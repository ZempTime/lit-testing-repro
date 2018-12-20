import { LitElement } from "@polymer/lit-element";
import { html } from "lit-html";
import { ifDefined } from "lit-html/directives/if-defined";
import "./x-paginator.js";
import { isEqual, debounce } from "lodash";
import idx from "idx";

export default class XFilterableTable extends LitElement {
  render() {
    return html`
      <style>
        :host {
          display: block;
          --textfield-height: 40px;
          --textfield-top-margin: 4px;
          --textfield-bgcolor: var(--surface-color);
        }
        .pagination {
          display: flex;
          justify-content: flex-end;
          margin-top: 20px;
        }
        table {
          border-spacing: 0;
          width: 100%;
        }
        td,
        th {
          font-size: 14px;
          line-height: 18px;
          text-align: left;
          padding: 22px 50px 22px 0;
          color: var(--black-color);
          width: var(--filterable-table-column-width);
        }
        td:last-child,
        th:last-child {
          padding-right: 10px;
          span {
            float: right;
          }
          a {
            float: right;
          }
        }
        thead {
          vertical-align: top;
          display: table-header-group;
          padding-bottom: 25px;
        }
        thead th {
          border-bottom: 3px solid var(--secondary-color);
        }
        tbody td {
          border-bottom: 1px solid var(--gray-light);
        }
        select {
          width: 100%;
          height: 38px;
          margin-top: 4px;
          background-color: var(--surface-color);
          font-family: var(--app-body-font);
          color: var(--gray-darkest);
          font-size: 1rem;
        }
        .sort-container {
          display: flex;
          padding-bottom: 5px;
        }
        .column-header {
          width: 99%;
        }
        .sort-seperator {
          height: 10px;
        }
        .icon-container {
          height: 12px;
          cursor: pointer;
        }
      </style>

      <table>
        <thead>
          <tr>
            ${
              this.columns.map(
                column => html`
                  <th width="${ifDefined(column.width)}">
                    ${this.getColumnHeader(column)}
                  </th>
                `
              )
            }
          </tr>
        </thead>
        <tbody height="${ifDefined(this.height)}">
          ${
            this.items.map(
              item => html`
                <tr>
                  ${
                    this.columns.map(
                      column => html`
                        <td>${column.row(item)}</td>
                      `
                    )
                  }
                </tr>
              `
            )
          }
        </tbody>
      </table>
      <div class="pagination">
        <mtzwc-paginator
          .currentPage="${this.currentPage}"
          .totalItems="${this.totalItems}"
          .pageSize="${this.pageSize}"
          @page-change="${this.__handlePageChange}"
        ></mtzwc-paginator>
      </div>
    `;
  }

  constructor() {
    super();
    this.params = {};
    this.items = [];
    this.dispatchChangeEvent = debounce(this.__dispatchChangeEvent, 100);
    // We don't want to dispatch any filter-change events that would otherwise occur during instantiation
    this.__filterChangeDispatchEnabled = false;
  }

  static get properties() {
    return {
      /**
       * TODO(zemptime): Add validation around columns to give helpful error messages
       * column setter that runs it through validation function & assigns default row renderer if not present/column getter
       */
      columns: Array,
      params: Object,
      items: Array,
      height: Number
    };
  }

  firstUpdated() {
    super.firstUpdated();
    this.__initializeFilters();
    this.__filterChangeDispatchEnabled = true;
  }

  updated(changedProperties) {
    if (changedProperties.has("params")) {
      this.dispatchChangeEvent();
    }
  }

  __dispatchChangeEvent() {
    if (!this.__filterChangeDispatchEnabled) return;
    const paginationOnly = isEqual(this.params.filters, this.__previousFilters);
    this.dispatchEvent(
      new CustomEvent("filter-change", {
        detail: {
          params: this.params,
          paginationOnly
        }
      })
    );
    this.__previousFilters = Object.assign({}, this.params.filters);
  }

  __initializeFilters() {
    const filters = {};
    this.columns.forEach(column => {
      if (column.filter && column.filter.name) {
        filters[column.filter.name] = "";
      }
    });
    this.params = {
      ...this.params,
      filters
    };
  }

  getColumnHeader(column) {
    if (column.filter && column.filter.name) {
      return column.filter.items
        ? html`
            <div class="sort-container">
              <span class="column-header"> ${column.header} </span> ${
                this.getColumnSort(column)
              }
            </div>
            <select
              @change="${this.__handleInput}"
              name="${column.filter.name}"
            >
              <option>Select one</option>
              ${
                column.filter.items.map(item => {
                  return html`
                    <option .value="${item.typeCode}">${item.typeName}</option>
                  `;
                })
              }
            </select>
          `
        : html`
            <div class="sort-container">
              <span class="column-header"> ${column.header} </span> ${
                this.getColumnSort(column)
              }
            </div>
            <mtzwc-textfield
              @input="${this.__handleInput}"
              outlined
              elevated
              placeholder="Search"
              name="${column.filter.name}"
            ></mtzwc-textfield>
          `;
    } else {
      return html`
        <span> ${column.header} </span>
      `;
    }
  }

  getColumnSort(column) {
    return column.sortable
      ? html`
          <div @click="${() => this.__handleSortClick(column)}">
            <div class="icon-container">
              <i
                class="fa fa-chevron-up fa-sm ${
                  this.__shouldColorIcon(column, "asc") ? "primary-color" : ""
                }"
              ></i>
            </div>
            <div class="icon-container">
              <i
                class="fa fa-chevron-down fa-sm ${
                  this.__shouldColorIcon(column, "desc") ? "primary-color" : ""
                }"
              ></i>
            </div>
          </div>
        `
      : html`
          <span class="fa-stack fa-1x"></span>
        `;
  }

  __handleInput(e) {
    const updatedParams = Object.assign({}, this.params);
    if (e.target.value === "Select one")
      updatedParams.filters[e.target.getAttribute("name")] = "";
    else updatedParams.filters[e.target.getAttribute("name")] = e.target.value;
    this.params = updatedParams;
  }

  __handleSortClick(column) {
    const updatedParams = Object.assign({}, this.params);
    let sortDirection;
    if (updatedParams.filters.sortOrder) {
      sortDirection = updatedParams.filters.sortOrder.direction;
    }

    if (
      sortDirection === "desc" &&
      updatedParams.filters.sortOrder.column === column.filter.name
    ) {
      delete updatedParams.filters.sortOrder;
    } else if (sortDirection === "asc") {
      if (updatedParams.filters.sortOrder.column === column.filter.name) {
        updatedParams.filters["sortOrder"] = {
          column: column.filter.name,
          direction: "desc"
        };
      } else {
        updatedParams.filters["sortOrder"] = {
          column: column.filter.name,
          direction: "asc"
        };
      }
    } else {
      updatedParams.filters["sortOrder"] = {
        column: column.filter.name,
        direction: "asc"
      };
    }
    this.params = updatedParams;
  }

  __handlePageChange(e) {
    this.currentPage = e.detail.currentPage;
  }

  __shouldColorIcon(column, direction) {
    const sortOrder = idx(this.params, _ => _.filters.sortOrder);
    return (
      sortOrder !== undefined &&
      sortOrder.direction === direction &&
      sortOrder.column === column.filter.name
    );
  }

  set currentPage(number) {
    this.params = {
      ...this.params,
      pagination: {
        ...this.params.pagination,
        currentPage: number
      }
    };
  }
  get currentPage() {
    return idx(this.params, _ => _.pagination.currentPage) || 1;
  }
  set pageSize(number) {
    this.params = {
      ...this.params,
      pagination: {
        ...this.params.pagination,
        pageSize: number
      }
    };
  }
  get pageSize() {
    return idx(this.params, _ => _.pagination.pageSize) || 7;
  }
  set totalItems(number) {
    this.params = {
      ...this.params,
      pagination: {
        ...this.params.pagination,
        totalItems: number
      }
    };
  }
  get totalItems() {
    return idx(this.params, _ => _.pagination.totalItems) || 1;
  }
}

customElements.define("x-filterable-table", XFilterableTable);
