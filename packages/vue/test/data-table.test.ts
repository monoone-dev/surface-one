import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import { SoneDataTable, type SoneDataTableColumn } from "../src/index";

interface Payment {
  readonly id: string;
  readonly email: string;
  readonly amount: number;
}

const ROWS: Payment[] = [
  { id: "a", email: "ken@example.com", amount: 316 },
  { id: "b", email: "abe@example.com", amount: 242 },
  { id: "c", email: "monserrat@example.com", amount: 837 },
  { id: "d", email: "silas@example.com", amount: 874 },
  { id: "e", email: "carmella@example.com", amount: 721 },
];

const COLUMNS: SoneDataTableColumn[] = [
  { key: "email", header: "Email", sortable: true },
  { key: "amount", header: "Amount", sortable: true, alignEnd: true },
];

const byId = (p: never): string => (p as Payment).id;

afterEach(() => {
  document.body.innerHTML = "";
});

const bodyText = (root: ParentNode = document): string[] =>
  [...root.querySelectorAll("tbody tr")].map((tr) =>
    [...tr.querySelectorAll("td")]
      .map((td) => td.textContent!.trim())
      .filter(Boolean)
      .join(" | "),
  );

describe("SoneDataTable", () => {
  it("renders the toolbar, a sortable header and the footer on the server", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(SoneDataTable, {
              rows: ROWS,
              columns: COLUMNS,
              rowKey: byId,
              pageSize: 2,
              sort: { key: "amount", direction: "desc" },
              filterable: true,
              selectable: true,
            }),
        }),
      )
    ).replace(/<!--\[-->|<!--\]-->|<!---->/g, "");
    expect(html).toContain('<sone-data-table data-slot="data-table">');
    expect(html).toContain('<sone-search-field class="data-table-filter"');
    expect(html).toContain(
      '<th data-slot="table-head" scope="col" class="is-end" aria-sort="descending">',
    );
    expect(html).toContain('type="button" data-direction="desc">Amount');
    expect(html).toContain('aria-label="Select all"');
    expect(html).toContain("0 of 5 row(s) selected.");
    expect(html).toContain(
      '<td data-slot="table-cell" class="is-end">874</td>',
    );
  });

  it("sorts, pages, filters, selects and hides columns", async () => {
    const wrapper = mount(SoneDataTable, {
      attachTo: document.body,
      props: {
        rows: ROWS,
        columns: COLUMNS,
        rowKey: byId,
        pageSize: 2,
        filterable: true,
        selectable: true,
        columnToggle: true,
        rowLabel: (p: never) => (p as Payment).email,
      },
    });
    const root = wrapper.element as HTMLElement;
    expect(bodyText(root)).toEqual([
      "ken@example.com | 316",
      "abe@example.com | 242",
    ]);

    // Sort: ascending, descending, unsorted.
    const sortButton = () =>
      root.querySelectorAll<HTMLButtonElement>(
        '[data-slot="data-table-sort"]',
      )[1];
    sortButton().click();
    await nextTick();
    expect(wrapper.emitted("update:sort")?.at(-1)).toEqual([
      { key: "amount", direction: "asc" },
    ]);
    expect(root.querySelectorAll("thead th")[2].getAttribute("aria-sort")).toBe(
      "ascending",
    );
    expect(bodyText(root)[0]).toBe("abe@example.com | 242");
    sortButton().click();
    await nextTick();
    sortButton().click();
    await nextTick();
    expect(wrapper.emitted("update:sort")?.at(-1)).toEqual([null]);

    // Pagination.
    root
      .querySelector<HTMLButtonElement>('[data-slot="pagination-next"]')!
      .click();
    await nextTick();
    expect(wrapper.emitted("update:page")?.at(-1)).toEqual([2]);
    expect(bodyText(root)[0]).toBe("monserrat@example.com | 837");

    // Filter: back to page 1.
    await wrapper.find(".data-table-filter input").setValue("SILAS");
    expect(wrapper.emitted("update:filter")?.at(-1)).toEqual(["SILAS"]);
    expect(wrapper.emitted("update:page")?.at(-1)).toEqual([1]);
    expect(bodyText(root)).toEqual(["silas@example.com | 874"]);
    await wrapper.find(".data-table-filter input").setValue("");

    // Selection.
    const boxes = () =>
      root.querySelectorAll<HTMLInputElement>(
        'tbody input[data-slot="checkbox"]',
      );
    const all = () =>
      root.querySelector<HTMLInputElement>(
        'thead input[data-slot="checkbox"]',
      )!;
    expect(boxes()[0].getAttribute("aria-label")).toBe(
      "Select ken@example.com",
    );
    boxes()[0].click();
    await nextTick();
    expect(wrapper.emitted("update:selected")?.at(-1)).toEqual([["a"]]);
    expect(all().indeterminate).toBe(true);
    expect(root.querySelector("tbody tr")!.getAttribute("data-state")).toBe(
      "selected",
    );
    all().click();
    await nextTick();
    expect(wrapper.emitted("update:selected")?.at(-1)).toEqual([["a", "b"]]);
    expect(
      root.querySelector('[data-slot="data-table-count"]')!.textContent,
    ).toBe("2 of 5 row(s) selected.");

    // Column menu.
    root
      .querySelector<HTMLButtonElement>('[data-slot="data-table-columns"]')!
      .click();
    await nextTick();
    const items = document.querySelectorAll<HTMLButtonElement>(
      '[role="menuitemcheckbox"]',
    );
    expect([...items].map((i) => i.textContent)).toEqual(["Email", "Amount"]);
    items[1].click();
    await nextTick();
    expect(wrapper.emitted("update:hiddenColumns")?.at(-1)).toEqual([
      ["amount"],
    ]);
    expect(root.querySelectorAll("thead th")).toHaveLength(2);
    wrapper.unmount();
  });

  it("shows the empty row, and a busy table while loading", async () => {
    const wrapper = mount(SoneDataTable, {
      props: { rows: [], columns: COLUMNS },
    });
    expect(bodyText(wrapper.element)).toEqual(["No results."]);
    await wrapper.setProps({ loading: true });
    expect(bodyText(wrapper.element)).toEqual(["Loading"]);
    await wrapper.setProps({ rows: ROWS });
    expect(
      wrapper.find('[data-slot="data-table-body"]').attributes("aria-busy"),
    ).toBe("true");
    expect(
      wrapper.find('[data-slot="data-table-loading"] [role="status"]').exists(),
    ).toBe(true);
  });

  it("renders cell slots and toolbar content", () => {
    const wrapper = mount(SoneDataTable, {
      props: { rows: ROWS.slice(0, 1), columns: COLUMNS },
      slots: {
        default: () => h("button", { class: "bulk" }, "Delete"),
        "cell-amount": ({ row }: { row: Payment }) => h("b", `$${row.amount}`),
      },
    });
    expect(
      wrapper.find('[data-slot="data-table-toolbar"] .bulk').exists(),
    ).toBe(true);
    expect(wrapper.find("tbody b").text()).toBe("$316");
  });
});
