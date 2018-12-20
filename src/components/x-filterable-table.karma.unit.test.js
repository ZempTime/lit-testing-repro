import "./x-filterable-table.js";

import { html, render } from "lit-html";
import sinon from "sinon";

const items = [{ id: 1, name: "unicorn" }, { id: 2, name: "cupcake" }];
const filterHandler = sinon.spy();

const elementReady = element => {
  return new Promise(async resolve => {
    let done = false;
    do {
      done = await element.updateComplete;
    } while (!done);
    resolve();
  });
};

const fixture = html`
  <x-filterable-table
    .items="${items}"
    .columns="${
      [
        {
          header: "id",
          row: item =>
            html`
              ${item.id}
            `
        },
        {
          header: "name",
          filter: {
            name: "name"
          },
          row: item => html`
            ${item.name}
          `
        }
      ]
    }"
    .currentPage="${1}"
    .pageSize="${7}"
    .totalItems="${2}"
    .paginate="${true}"
    @filter-change="${filterHandler}"
  ></x-filterable-table>
`;

describe("filterable-table", () => {
  let element;

  beforeEach(async () => {
    const div = document.createElement("div");
    render(fixture, div);
    element = div.firstElementChild;
    await elementReady(element);
  });

  afterEach(() => {
    if (element.parentNode) element.parentNode.removeChild(element);
  });

  describe("table", () => {
    it("will render out a number of table rows equal to a number of items", () => {
      const headerRow = 1;
      const count =
        element.shadowRoot.querySelectorAll("tr").length - headerRow;
      expect(count).to.equal(2);
    });
    it("will call item() method provided in columns", async () => {
      const args = [];
      const rowRenderer = arg => {
        args.push(arg);
        return html`
          ${arg.toString()}
        `;
      };
      element.columns = [{ name: "test", row: rowRenderer }];
      element.items = items;
      await elementReady(element);
      expect(args).to.eql(items);
    });
  });

  describe("firstUpdated()", () => {
    it("will call __initializeFilters", () => {
      element.__initializeFilters = sinon.spy();
      element.firstUpdated();
      expect(element.__initializeFilters).to.be.calledOnce;
    });
    it("will set __filterChangeDispatchEnabled to true", () => {
      element.__filterChangeDispatchEnabled = false;
      element.firstUpdated();
      expect(element.__filterChangeDispatchEnabled).to.equal(true);
    });
  });

  describe("updated()", () => {
    it("will invoke dispatchChangeEvent when the params are updated to an object holding different data", done => {
      element.dispatchChangeEvent = sinon.spy();
      element.params = {};

      /* eslint-disable */
      element.updateComplete
        .then(_result => {
          expect(element.dispatchChangeEvent).to.be.called;
        })
        .finally(done);
    });
  });

  describe("dispatchChangeEvent()", () => {
    it("is debounced", () => {
      let count = 0;
      element.addEventListener("filter-change", () => {
        count = count + 1;
      });

      element.dispatchChangeEvent();
      element.dispatchChangeEvent();
      element.dispatchChangeEvent();
      element.dispatchChangeEvent();
      element.dispatchChangeEvent();
      setTimeout(() => {
        expect(count).to.equal(1);
      }, 101);
    });
  });

  describe("__dispatchChangeEvent", () => {
    it("will dispatch a filter-change event", () => {
      filterHandler.resetHistory();
      const expected = {
        params: {
          filters: {
            name: ""
          },
          pagination: {
            currentPage: 1,
            pageSize: 7,
            totalItems: 2
          }
        },
        paginationOnly: false
      };
      element.__dispatchChangeEvent();
      expect(filterHandler.lastCall.args[0].detail).to.eql(expected);
    });
    it("will provide paginationOnly as true if no filters have changed", () => {
      filterHandler.resetHistory();
      element.__dispatchChangeEvent();
      element.currentPage = element.currentPage + 1;
      element.__dispatchChangeEvent();
      expect(filterHandler.lastCall.args[0].detail.paginationOnly).to.be.true;
    });
    it("will will set paginationOnly as false if filters have changed", () => {
      filterHandler.resetHistory();
      element.params = {
        ...element.params,
        filters: {
          name: "changed"
        }
      };
      element.__dispatchChangeEvent();
      expect(filterHandler.lastCall.args[0].detail.paginationOnly).to.be.false;
    });
    it("will not dispatch an event if __filterChangeDispatchEnabled is false", () => {
      filterHandler.resetHistory();
      element.__filterChangeDispatchEnabled = false;
      element.currentPage = element.currentPage + 1;
      element.__dispatchChangeEvent();
      expect(filterHandler).to.not.be.called;
    });
  });

  describe("__initializeFilters", () => {
    it("will set params.filters.filterName to an empty string", () => {
      element.columns = [
        {
          name: "oblong",
          filter: {
            name: "rectangle"
          }
        },
        {
          name: "ham",
          filter: {
            name: "sandwich"
          }
        }
      ];
      element.__initializeFilters();

      expect(element.params.filters).to.eql({
        rectangle: "",
        sandwich: ""
      });
    });
  });

  describe("getColumnHeader()", () => {
    it("will return a header without a textfield if column does not have a filter set", () => {
      const column = {
        header: "name",
        row: () => ""
      };
      const template = element.getColumnHeader(column);
      const staticStrings = template.strings.join();
      expect(staticStrings.includes("mtzwc-textfield")).to.equal(false);
    });
    it("will return a header with a select box", () => {
      const column = {
        header: "name",
        filter: {
          name: "coffee",
          items: ["beans"]
        },
        row: () => ""
      };
      const template = element.getColumnHeader(column);
      const staticParts = template.strings.join();
      const values = template.values;

      expect(staticParts.includes("select")).to.be.true;
      expect(values[3]).to.equal(column.filter.name);
    });
    it("will return a header with a textfield", () => {
      const column = {
        header: "name",
        filter: {
          name: "coffee"
        },
        row: () => ""
      };
      const template = element.getColumnHeader(column);
      const staticParts = template.strings.join();
      const values = template.values;

      expect(staticParts.includes("mtzwc-textfield")).to.be.true;
      expect(values[3]).to.equal(column.filter.name);
    });
  });

  describe("getColumnSort()", () => {
    it("will return a span without icons", () => {
      const column = {
        sortable: false,
        row: () => ""
      };

      const div = document.createElement("div");
      const template = element.getColumnSort(column);
      render(template, div);
      const hasIcon = !!div.querySelector("i");
      div.remove();

      expect(hasIcon).to.be.false;
    });

    it("will return a span with icons", () => {
      const column = {
        sortable: true,
        row: () => ""
      };

      const div = document.createElement("div");
      const template = element.getColumnSort(column);
      render(template, div);
      const hasIcon = !!div.querySelector("i");
      div.remove();

      expect(hasIcon).to.be.true;
    });
  });

  describe("__handleInput()", () => {
    it("will set params.filters[filterName] to provided filtername", () => {
      const textfield = element.shadowRoot.querySelector("mtzwc-textfield");

      textfield.value = "MOAR";
      textfield.dispatchEvent(new Event("input"));
      expect(element.params.filters.name).to.equal("MOAR");
    });
  });

  describe("__handleSortClick()", () => {
    it('will set params.filters["sortOrder"] to "asc" direction', () => {
      const column = {
        filter: {
          name: "filterName"
        },
        row: () => ""
      };
      element.__handleSortClick(column);
      elementReady(element).then(() => {
        expect(element.params.filters["sortOrder"].column).to.equal(
          column.filter.name
        );
        expect(element.params.filters["sortOrder"].direction).to.equal("asc");
      });
    });

    it('will set params.filters["sortOrder"] to "desc" direction', () => {
      const column = {
        filter: {
          name: "filterName"
        },
        row: () => ""
      };
      element.__handleSortClick(column);
      element.__handleSortClick(column);

      elementReady(element).then(() => {
        expect(element.params.filters["sortOrder"].column).to.equal(
          column.filter.name
        );
        expect(element.params.filters["sortOrder"].direction).to.equal("desc");
      });
    });

    it("will delete sort order if the same sort icon is clicked again", () => {
      const column = {
        filter: {
          name: "filterName"
        },
        row: () => ""
      };
      element.__handleSortClick(column);
      element.__handleSortClick(column);
      element.__handleSortClick(column);
      elementReady(element).then(() => {
        expect(element.params.filters["sortOrder"]).to.be.undefined;
      });
    });
  });

  describe("__handlePageChange()", () => {
    it("will call currentPage setter when it receives a page-change event", () => {
      const pagination = element.shadowRoot.querySelector("mtzwc-paginator");
      pagination.dispatchEvent(
        new CustomEvent("page-change", { detail: { currentPage: 10 } })
      );
      expect(element.params.pagination.currentPage).to.equal(10);
    });
  });

  describe("__shouldColorIcon()", () => {
    it("will return true for the icon representing the selected sort", () => {
      const column = {
        filter: {
          name: "filterName"
        },
        row: () => ""
      };
      const sortDirection = "asc";
      element.__handleSortClick(column, sortDirection);
      elementReady(element).then(() => {
        expect(element.__shouldColorIcon(column, "asc")).to.be.true;
      });
    });

    it("will return false for icons not representing the selected sort", () => {
      const column = {
        filter: {
          name: "filterName"
        },
        row: () => ""
      };
      const sortDirection = "asc";
      element.__handleSortClick(column, sortDirection);
      elementReady(element).then(() => {
        expect(element.__shouldColorIcon(column, "desc")).to.be.false;
      });
    });
  });

  ["currentPage", "totalItems", "pageSize"].forEach(paginationParam => {
    describe(`${paginationParam}`, () => {
      it("sets inside params.pagination", () => {
        element[paginationParam] = 44;
        expect(element.params.pagination[paginationParam]).to.equal(44);
      });
      it("gets from inside params.pagination", () => {
        const updatedParams = Object.assign({}, element.params);
        updatedParams.pagination[paginationParam] = 99;
        element.params = updatedParams;

        expect(element[paginationParam]).to.equal(99);
      });
    });
  });
});
