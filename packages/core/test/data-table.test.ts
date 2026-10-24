// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  clampDataTablePage,
  compareDataTableValues,
  dataTableAriaSort,
  dataTablePageCount,
  dataTableSelection,
  dataTableView,
  filterDataTableRows,
  nextDataTableSort,
  sortDataTableRows,
  toggleDataTableColumn,
  toggleDataTableKey,
  toggleDataTableKeys,
  visibleDataTableColumns,
  type SoneDataTableColumnLike,
} from "../src";

interface Row {
  readonly id: string;
  readonly name: string;
  readonly amount: number | null;
  readonly when?: Date;
}

const ROWS: Row[] = [
  { id: "a", name: "Item 10", amount: 3 },
  { id: "b", name: "item 2", amount: null },
  { id: "c", name: "Élan", amount: 1 },
  { id: "d", name: "Zed", amount: 3 },
];

const COLUMNS: SoneDataTableColumnLike<Row>[] = [
  { key: "name", sortable: true },
  { key: "amount", sortable: true },
  { key: "id", filterable: false },
];

describe("the data table state", () => {
  it("compares numbers, dates, booleans and text, with empty values last", () => {
    expect(compareDataTableValues(2, 10)).toBeLessThan(0);
    expect(compareDataTableValues("item 2", "Item 10")).toBeLessThan(0);
    expect(compareDataTableValues("a", "A")).toBe(0);
    expect(
      compareDataTableValues(new Date(2026, 0, 2), new Date(2026, 0, 1)),
    ).toBeGreaterThan(0);
    expect(compareDataTableValues(false, true)).toBeLessThan(0);
    expect(compareDataTableValues(null, 1)).toBe(1);
    expect(compareDataTableValues(1, undefined)).toBe(-1);
    expect(compareDataTableValues("", Number.NaN)).toBe(0);
  });

  it("cycles a column's sort and reads aria-sort for the sorted column only", () => {
    expect(nextDataTableSort(null, "name")).toEqual({
      key: "name",
      direction: "asc",
    });
    expect(
      nextDataTableSort({ key: "name", direction: "asc" }, "name"),
    ).toEqual({ key: "name", direction: "desc" });
    expect(
      nextDataTableSort({ key: "name", direction: "desc" }, "name"),
    ).toBeNull();
    expect(
      nextDataTableSort({ key: "name", direction: "desc" }, "amount"),
    ).toEqual({ key: "amount", direction: "asc" });
    expect(dataTableAriaSort({ key: "a", direction: "asc" }, "a")).toBe(
      "ascending",
    );
    expect(dataTableAriaSort({ key: "a", direction: "desc" }, "a")).toBe(
      "descending",
    );
    expect(dataTableAriaSort({ key: "a", direction: "desc" }, "b")).toBeNull();
    expect(dataTableAriaSort(null, "b")).toBeNull();
  });

  it("sorts stably, both ways, with empty values last and a custom comparator", () => {
    const ids = (rows: Row[]) => rows.map((r) => r.id);
    expect(
      ids(
        sortDataTableRows(ROWS, COLUMNS, { key: "amount", direction: "asc" }),
      ),
    ).toEqual(["c", "a", "d", "b"]);
    expect(
      ids(
        sortDataTableRows(ROWS, COLUMNS, { key: "amount", direction: "desc" }),
      ),
    ).toEqual(["a", "d", "c", "b"]);
    expect(
      ids(sortDataTableRows(ROWS, COLUMNS, { key: "name", direction: "asc" })),
    ).toEqual(["c", "b", "a", "d"]);
    const byLength: SoneDataTableColumnLike<Row>[] = [
      {
        key: "name",
        sortable: true,
        compare: (a, b) => a.name.length - b.name.length,
      },
    ];
    expect(
      ids(sortDataTableRows(ROWS, byLength, { key: "name", direction: "asc" })),
    ).toEqual(["d", "c", "b", "a"]);
    // Not sortable, or no such column: the order as given, on a copy.
    const copy = sortDataTableRows(ROWS, COLUMNS, {
      key: "id",
      direction: "desc",
    });
    expect(ids(copy)).toEqual(["a", "b", "c", "d"]);
    expect(copy).not.toBe(ROWS);
  });

  it("filters the filterable columns, case- and accent-insensitively", () => {
    const ids = (q: string) =>
      filterDataTableRows(ROWS, COLUMNS, q).map((r) => r.id);
    expect(ids("")).toEqual(["a", "b", "c", "d"]);
    expect(ids("  ITEM ")).toEqual(["a", "b"]);
    expect(ids("elan")).toEqual(["c"]);
    expect(ids("3")).toEqual(["a", "d"]);
    // `id` is not filterable.
    expect(ids("d")).toEqual(["d"]);
    const byValue: SoneDataTableColumnLike<Row>[] = [
      { key: "x", value: (r) => r.name.toUpperCase() },
    ];
    expect(filterDataTableRows(ROWS, byValue, "zed")).toHaveLength(1);
  });

  it("counts and clamps pages", () => {
    expect(dataTablePageCount(0, 10)).toBe(1);
    expect(dataTablePageCount(21, 10)).toBe(3);
    expect(dataTablePageCount(21, 0)).toBe(1);
    expect(clampDataTablePage(9, 3)).toBe(3);
    expect(clampDataTablePage(0, 3)).toBe(1);
    expect(clampDataTablePage(Number.NaN, 3)).toBe(1);
  });

  it("builds the page: filter, sort, slice, keeping keys and source indexes", () => {
    const view = dataTableView({
      rows: ROWS,
      columns: COLUMNS,
      sort: { key: "amount", direction: "asc" },
      filter: "",
      page: 2,
      pageSize: 3,
      rowKey: (r) => r.id,
    });
    expect(view).toEqual({
      rows: [{ row: ROWS[1], key: "b", index: 1 }],
      total: 4,
      page: 2,
      pageCount: 2,
    });
    const all = dataTableView({ rows: ROWS, columns: COLUMNS, page: 5 });
    expect(all.page).toBe(1);
    expect(all.rows.map((r) => r.key)).toEqual([0, 1, 2, 3]);
    const filtered = dataTableView({
      rows: ROWS,
      columns: COLUMNS,
      filter: "item",
      page: 9,
      pageSize: 1,
    });
    expect(filtered).toMatchObject({ total: 2, page: 2, pageCount: 2 });
  });

  it("selects rows one by one and a page at a time", () => {
    expect(dataTableSelection(["a", "b"], [])).toEqual({
      all: false,
      some: false,
    });
    expect(dataTableSelection(["a", "b"], ["b", "z"])).toEqual({
      all: false,
      some: true,
    });
    expect(dataTableSelection(["a", "b"], ["a", "b"])).toEqual({
      all: true,
      some: false,
    });
    expect(dataTableSelection([], ["a"])).toEqual({ all: false, some: false });
    expect(toggleDataTableKey(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleDataTableKey(["a", "b"], "a")).toEqual(["b"]);
    expect(toggleDataTableKeys(["z", "a"], ["a", "b"], true)).toEqual([
      "z",
      "a",
      "b",
    ]);
    expect(toggleDataTableKeys(["z", "a", "b"], ["a", "b"], false)).toEqual([
      "z",
    ]);
  });

  it("hides and shows columns", () => {
    expect(
      visibleDataTableColumns(COLUMNS, ["amount"]).map((c) => c.key),
    ).toEqual(["name", "id"]);
    expect(visibleDataTableColumns(COLUMNS, null)).toHaveLength(3);
    expect(toggleDataTableColumn(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleDataTableColumn(["a", "b"], "a")).toEqual(["b"]);
  });
});
