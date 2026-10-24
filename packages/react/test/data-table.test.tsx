import { act, fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneDataTable,
  type SoneDataTableColumn,
  type SoneDataTableKey,
} from "../src/index";

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

const COLUMNS: SoneDataTableColumn<Payment>[] = [
  { key: "email", header: "Email", sortable: true },
  { key: "amount", header: "Amount", sortable: true, alignEnd: true },
];

const byId = (p: Payment): string => p.id;

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
  it("renders the same markup as Angular on the server", () => {
    const el = document.createElement("div");
    el.innerHTML = renderToString(
      <SoneDataTable
        rows={ROWS}
        columns={COLUMNS}
        rowKey={byId}
        pageSize={2}
        sort={{ key: "amount", direction: "desc" }}
        filterable
        selectable
      />,
    );
    const html = el.innerHTML;
    expect(html).toContain('<sone-data-table data-slot="data-table">');
    expect(html).toContain('<sone-search-field class="data-table-filter"');
    expect(html).toContain('aria-sort="descending"');
    expect(html).toContain(
      'data-direction="desc" class="btn data-table-sort">Amount',
    );
    expect(html).toContain('aria-label="Select all"');
    expect(html).toContain("0 of 5 row(s) selected.");
    expect(html).toContain(
      '<td data-slot="table-cell" class="is-end">874</td>',
    );
  });

  it("sorts, pages, filters, selects and hides columns (uncontrolled)", () => {
    const onSort = vi.fn();
    const onPage = vi.fn();
    const onSelected = vi.fn();
    const onHidden = vi.fn();
    const { container } = render(
      <SoneDataTable
        rows={ROWS}
        columns={COLUMNS}
        rowKey={byId}
        pageSize={2}
        filterable
        selectable
        columnToggle
        rowLabel={(p) => p.email}
        onSortChange={onSort}
        onPageChange={onPage}
        onSelectedChange={onSelected}
        onHiddenColumnsChange={onHidden}
      />,
    );
    expect(bodyText(container)).toEqual([
      "ken@example.com | 316",
      "abe@example.com | 242",
    ]);
    const sortButton = () =>
      container.querySelectorAll<HTMLButtonElement>(
        '[data-slot="data-table-sort"]',
      )[1];
    fireEvent.click(sortButton());
    expect(onSort).toHaveBeenLastCalledWith({
      key: "amount",
      direction: "asc",
    });
    expect(
      container.querySelectorAll("thead th")[2].getAttribute("aria-sort"),
    ).toBe("ascending");
    expect(bodyText(container)[0]).toBe("abe@example.com | 242");
    fireEvent.click(sortButton());
    fireEvent.click(sortButton());
    expect(onSort).toHaveBeenLastCalledWith(null);

    fireEvent.click(container.querySelector('[data-slot="pagination-next"]')!);
    expect(onPage).toHaveBeenLastCalledWith(2);
    expect(bodyText(container)[0]).toBe("monserrat@example.com | 837");

    const input = container.querySelector<HTMLInputElement>(
      ".data-table-filter input",
    )!;
    fireEvent.change(input, { target: { value: "SILAS" } });
    expect(onPage).toHaveBeenLastCalledWith(1);
    expect(bodyText(container)).toEqual(["silas@example.com | 874"]);
    fireEvent.change(input, { target: { value: "" } });

    const boxes = () =>
      container.querySelectorAll<HTMLInputElement>(
        'tbody input[data-slot="checkbox"]',
      );
    const all = () =>
      container.querySelector<HTMLInputElement>(
        'thead input[data-slot="checkbox"]',
      )!;
    expect(boxes()[0].getAttribute("aria-label")).toBe(
      "Select ken@example.com",
    );
    fireEvent.click(boxes()[0]);
    expect(onSelected).toHaveBeenLastCalledWith(["a"]);
    expect(all().indeterminate).toBe(true);
    expect(
      container.querySelector("tbody tr")!.getAttribute("data-state"),
    ).toBe("selected");
    fireEvent.click(all());
    expect(onSelected).toHaveBeenLastCalledWith(["a", "b"]);
    expect(
      container.querySelector('[data-slot="data-table-count"]')!.textContent,
    ).toBe("2 of 5 row(s) selected.");

    act(() => {
      container
        .querySelector<HTMLButtonElement>('[data-slot="data-table-columns"]')!
        .click();
    });
    const items = document.querySelectorAll<HTMLButtonElement>(
      '[role="menuitemcheckbox"]',
    );
    expect([...items].map((i) => i.textContent)).toEqual(["Email", "Amount"]);
    fireEvent.click(items[1]);
    expect(onHidden).toHaveBeenLastCalledWith(["amount"]);
    expect(container.querySelectorAll("thead th")).toHaveLength(2);
  });

  it("follows a controlled selection and renders cells and toolbar content", () => {
    const selected: SoneDataTableKey[] = ["b"];
    const { container } = render(
      <SoneDataTable
        rows={ROWS.slice(0, 2)}
        columns={[
          COLUMNS[0],
          { ...COLUMNS[1], cell: (row) => <b>${row.amount}</b> },
        ]}
        rowKey={byId}
        selectable
        selected={selected}
        toolbar={<button className="bulk">Delete</button>}
      />,
    );
    expect(
      container.querySelector('[data-slot="data-table-toolbar"] .bulk'),
    ).toBeTruthy();
    expect(container.querySelector("tbody b")!.textContent).toBe("$316");
    expect(
      container.querySelectorAll("tbody tr")[1].getAttribute("data-state"),
    ).toBe("selected");
  });

  it("shows the empty row, and a busy table while loading", () => {
    const { container, rerender } = render(
      <SoneDataTable rows={[]} columns={COLUMNS} />,
    );
    expect(bodyText(container)).toEqual(["No results."]);
    rerender(<SoneDataTable rows={[]} columns={COLUMNS} loading />);
    expect(bodyText(container)).toEqual(["Loading"]);
    rerender(<SoneDataTable rows={ROWS} columns={COLUMNS} loading />);
    expect(
      container
        .querySelector('[data-slot="data-table-body"]')!
        .getAttribute("aria-busy"),
    ).toBe("true");
    expect(
      container.querySelector(
        '[data-slot="data-table-loading"] [role="status"]',
      ),
    ).toBeTruthy();
  });
});
