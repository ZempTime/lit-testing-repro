import { html, LitElement } from "@polymer/lit-element";

export class XPaginator extends LitElement {
  render() {
    return html`
      <style>
        .number {
          cursor: pointer;
        }

        .current {
          background-color: var(--primary-color);
          color: var(--surface-color);
          border-radius: 50%;
        }

        .number:hover {
          background-color: var(--primary-color-light);
          color: var(--surface-color);
          border-radius: 50%;
        }

        span {
          color: var(--gray-darkest);
          font-size: 14px;
          padding: 8px 16px;
          text-decoration: none;
        }

        .placeholder {
          /** Same width as the previous/next page buttons */
          width: 72px;
          /** Needs to have any height and some content to render */
          height: 1px;
          /** Place on same line as page numbers */
          display: inline-block;
        }
      </style>
      ${
        this.firstPageSelected
          ? html`
              <div class="placeholder">&nbsp</div>
            `
          : html`
              <button id="previous" @click="${this.previous}">&lt</button>
            `
      }
      ${
        this.pages.map(pageNumber => {
          return pageNumber === this.currentPage
            ? html`
                <span class="current">${pageNumber}</span>
              `
            : html`
                <span
                  id="page-${pageNumber}"
                  class="number"
                  @click="${e => this.goToPage(e, pageNumber)}"
                >
                  ${pageNumber}
                </span>
              `;
        })
      }
      ${
        this.lastPageSelected
          ? html`
              <div class="placeholder"></div>
            `
          : html`
              <button id="next" @click="${this.next}">&gt</button>
            `
      }
    `;
  }

  static get properties() {
    return {
      pageSize: Number,
      currentPage: Number,
      totalItems: Number,
      /* Number of pages you can select from */
      maxLength: Number
    };
  }

  get totalPages() {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get firstPageSelected() {
    return this.currentPage === 1;
  }

  get lastPageSelected() {
    return this.currentPage === this.totalPages;
  }

  previous() {
    this.dispatchEvent(
      new CustomEvent("page-change", {
        detail: {
          totalItems: this.totalItems,
          pageSize: this.pageSize,
          currentPage: this.currentPage - 1
        }
      })
    );
  }

  next() {
    this.dispatchEvent(
      new CustomEvent("page-change", {
        detail: {
          totalItems: this.totalItems,
          pageSize: this.pageSize,
          currentPage: this.currentPage + 1
        }
      })
    );
  }

  goToPage(_e, pageNumber) {
    this.dispatchEvent(
      new CustomEvent("page-change", {
        detail: {
          totalItems: this.totalItems,
          pageSize: this.pageSize,
          currentPage: pageNumber
        }
      })
    );
  }

  get pages() {
    const result = [];
    for (let i = 1; i <= this.totalPages; i++) {
      result.push(i);
    }
    return result;
  }
}

window.customElements.define("x-paginator", XPaginator);
