// The model of `<sone-data-table>`: sorting, the global filter, client pagination and row
// selection. Angular-free — the Vue, React and React Native twins share it through
// @surface-one/core.

/** Which way a sorted column runs. */
export type SoneDataTableSortDirection = "asc" | "desc";

/** The sorted column, or `null` for the rows as given. */
export interface SoneDataTableSort {
  readonly key: string;
  readonly direction: SoneDataTableSortDirection;
}

/** A row's identity: what `selected` holds. */
export type SoneDataTableKey = string | number;

/** What the state helpers read from a column (`SoneDataTableColumn`). */
export interface SoneDataTableColumnLike<T = unknown> {
  readonly key: string;
  /** Sorting on this column; off by default. */
  readonly sortable?: boolean;
  /** The value sorted and filtered on; default: `row[key]`. */
  readonly value?: (row: T) => unknown;
  /** A custom comparator for the ascending order; default: `compareDataTableValues`. */
  readonly compare?: (a: T, b: T) => number;
  /** Whether the global filter searches this column; default: true. */
  readonly filterable?: boolean;
}

/** One row as drawn: the row, its key and its index in the source rows. */
export interface SoneDataTableRow<T> {
  readonly row: T;
  readonly key: SoneDataTableKey;
  readonly index: number;
}

/** The rows of the current page and the counts around them. */
export interface SoneDataTableView<T> {
  readonly rows: readonly SoneDataTableRow<T>[];
  /** The rows left after the filter, on every page. */
  readonly total: number;
  /** The page shown (clamped, 1-based). */
  readonly page: number;
  readonly pageCount: number;
}

/** The value of `column` in `row`: its `value` accessor, else `row[key]`. */
export function dataTableValue<T>(
  row: T,
  column: SoneDataTableColumnLike<T>,
): unknown {
  if (column.value) return column.value(row);
  return (row as Record<string, unknown> | null)?.[column.key];
}

const empty = (v: unknown): boolean =>
  v === null ||
  v === undefined ||
  v === "" ||
  (typeof v === "number" && Number.isNaN(v));

/**
 * The default ascending order of two cell values: empty values (null, undefined, "",
 * NaN) last, numbers and dates by value, booleans false first, everything else as text
 * with a numeric-aware, case-insensitive collation ("item 2" before "item 10").
 */
export function compareDataTableValues(a: unknown, b: unknown): number {
  const ea = empty(a);
  const eb = empty(b);
  if (ea || eb) return ea === eb ? 0 : ea ? 1 : -1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean")
    return Number(a) - Number(b);
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * The sort after the header of column `key` is pressed: unsorted → ascending →
 * descending → unsorted; another column starts again at ascending.
 */
export function nextDataTableSort(
  current: SoneDataTableSort | null | undefined,
  key: string,
): SoneDataTableSort | null {
  if (!current || current.key !== key) return { key, direction: "asc" };
  return current.direction === "asc" ? { key, direction: "desc" } : null;
}

/** The `aria-sort` of column `key`: set on the sorted column only (the APG sortable table). */
export function dataTableAriaSort(
  sort: SoneDataTableSort | null | undefined,
  key: string,
): "ascending" | "descending" | null {
  if (!sort || sort.key !== key) return null;
  return sort.direction === "asc" ? "ascending" : "descending";
}

/**
 * `rows` sorted by `sort` — a stable sort (equal rows keep their order, empty values stay
 * last in both directions), on a copy. A sort
 * on a column that is missing or not sortable leaves the rows as they are.
 */
export function sortDataTableRows<T>(
  rows: readonly T[],
  columns: readonly SoneDataTableColumnLike<T>[],
  sort: SoneDataTableSort | null | undefined,
): T[] {
  const column = sort && columns.find((c) => c.key === sort.key);
  if (!sort || !column || !column.sortable) return [...rows];
  const sign = sort.direction === "desc" ? -1 : 1;
  // Empty values stay last both ways; a custom comparator owns its whole order.
  const custom = column.compare;
  const compare = custom
    ? (a: T, b: T) => sign * custom(a, b)
    : (a: T, b: T) => {
        const va = dataTableValue(a, column);
        const vb = dataTableValue(b, column);
        if (empty(va) || empty(vb)) return compareDataTableValues(va, vb);
        return sign * compareDataTableValues(va, vb);
      };
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => compare(a.row, b.row) || a.i - b.i)
    .map((r) => r.row);
}

const text = (v: unknown): string =>
  empty(v) ? "" : v instanceof Date ? v.toISOString() : String(v);

/**
 * The rows any filterable column of which contains `query` (trimmed, case- and
 * accent-insensitive). An empty query keeps every row.
 */
export function filterDataTableRows<T>(
  rows: readonly T[],
  columns: readonly SoneDataTableColumnLike<T>[],
  query: string | null | undefined,
): T[] {
  const fold = (s: string): string =>
    s.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();
  const q = fold((query ?? "").trim());
  if (!q) return [...rows];
  const searched = columns.filter((c) => c.filterable !== false);
  return rows.filter((row) =>
    searched.some((c) => fold(text(dataTableValue(row, c))).includes(q)),
  );
}

/** How many pages `total` rows fill at `pageSize` a page (at least 1); 0 = one page. */
export function dataTablePageCount(total: number, pageSize: number): number {
  const t = Number.isFinite(total) ? Math.max(0, Math.floor(total)) : 0;
  const size = Number.isFinite(pageSize) ? Math.floor(pageSize) : 0;
  if (size <= 0) return 1;
  return Math.max(1, Math.ceil(t / size));
}

/** `page` as a whole page number in 1..pageCount. */
export function clampDataTablePage(page: number, pageCount: number): number {
  const max = Math.max(1, Math.floor(pageCount) || 1);
  const p = Number.isFinite(page) ? Math.floor(page) : 1;
  return Math.min(Math.max(p, 1), max);
}

/** The default row key: the row's index in the source rows. */
export const dataTableIndexKey = (_row: unknown, index: number): number =>
  index;

/**
 * The page of rows a data table shows: filtered by `filter`, sorted by `sort`, cut to
 * page `page` of `pageSize` rows (`pageSize` 0 shows every row). Each row keeps its key
 * (`rowKey(row, index)`, index in the source rows) and its source index.
 */
export function dataTableView<T>(options: {
  readonly rows: readonly T[];
  readonly columns: readonly SoneDataTableColumnLike<T>[];
  readonly sort?: SoneDataTableSort | null;
  readonly filter?: string | null;
  readonly page?: number;
  readonly pageSize?: number;
  readonly rowKey?: (row: T, index: number) => SoneDataTableKey;
}): SoneDataTableView<T> {
  const rowKey = options.rowKey ?? dataTableIndexKey;
  const indexed = options.rows.map((row, index) => ({
    row,
    key: rowKey(row, index),
    index,
  }));
  // The same columns, read through the indexed rows, so each row keeps its key.
  const columns = options.columns.map(
    (c): SoneDataTableColumnLike<SoneDataTableRow<T>> => ({
      key: c.key,
      sortable: c.sortable,
      filterable: c.filterable,
      value: (r) => dataTableValue(r.row, c),
      compare: c.compare ? (a, b) => c.compare!(a.row, b.row) : undefined,
    }),
  );
  const out = sortDataTableRows(
    filterDataTableRows(indexed, columns, options.filter),
    columns,
    options.sort,
  );
  const pageSize = options.pageSize ?? 0;
  const pageCount = dataTablePageCount(out.length, pageSize);
  const page = clampDataTablePage(options.page ?? 1, pageCount);
  const rows =
    pageSize > 0 ? out.slice((page - 1) * pageSize, page * pageSize) : out;
  return { rows, total: out.length, page, pageCount };
}

/** The select-all checkbox over `keys` (the shown rows): all, some (mixed) or none. */
export function dataTableSelection(
  keys: readonly SoneDataTableKey[],
  selected: readonly SoneDataTableKey[],
): { readonly all: boolean; readonly some: boolean } {
  const set = new Set(selected);
  const count = keys.filter((k) => set.has(k)).length;
  return {
    all: keys.length > 0 && count === keys.length,
    some: count > 0 && count < keys.length,
  };
}

/** `selected` with `key` switched; the order of the other keys is kept. */
export function toggleDataTableKey(
  selected: readonly SoneDataTableKey[],
  key: SoneDataTableKey,
): SoneDataTableKey[] {
  return selected.includes(key)
    ? selected.filter((k) => k !== key)
    : [...selected, key];
}

/**
 * `selected` after the select-all checkbox: `on` adds every key of `keys` (the shown
 * rows), off removes them; keys selected on other pages stay.
 */
export function toggleDataTableKeys(
  selected: readonly SoneDataTableKey[],
  keys: readonly SoneDataTableKey[],
  on: boolean,
): SoneDataTableKey[] {
  if (!on) {
    const drop = new Set(keys);
    return selected.filter((k) => !drop.has(k));
  }
  const have = new Set(selected);
  return [...selected, ...keys.filter((k) => !have.has(k))];
}

/** The columns left after `hidden` (keys) are taken out. */
export function visibleDataTableColumns<C extends { readonly key: string }>(
  columns: readonly C[],
  hidden: readonly string[] | null | undefined,
): C[] {
  if (!hidden || hidden.length === 0) return [...columns];
  const off = new Set(hidden);
  return columns.filter((c) => !off.has(c.key));
}

/** `hidden` with column `key` shown or hidden. */
export function toggleDataTableColumn(
  hidden: readonly string[],
  key: string,
): string[] {
  return hidden.includes(key)
    ? hidden.filter((k) => k !== key)
    : [...hidden, key];
}
