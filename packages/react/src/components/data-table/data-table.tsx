"use client";

import {
  createElement,
  useMemo,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  dataTableAriaSort,
  dataTableIndexKey,
  dataTableSelection,
  dataTableView,
  nextDataTableSort,
  toggleDataTableColumn,
  toggleDataTableKey,
  toggleDataTableKeys,
  visibleDataTableColumns,
  type SoneDataTableColumnLike,
  type SoneDataTableKey,
  type SoneDataTableRow,
  type SoneDataTableSort,
} from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { SoneButton } from "../button";
import { SoneCheckbox } from "../checkbox";
import { SoneIcon } from "../icon";
import { SoneMenu, SoneMenuCheckboxItem, SoneMenuTrigger } from "../menu";
import { SonePagination } from "../pagination";
import { SoneSearchField } from "../search-field";
import { SoneSpinner } from "../spinner";
import { SoneTable, type SoneTableColumn } from "../table";

export type {
  SoneDataTableKey,
  SoneDataTableSort,
  SoneDataTableSortDirection,
} from "@surface-one/core";

/**
 * A data table column: the `SoneTable` column (`key`, `header`, `width`, `alignEnd`,
 * `cell`) plus how it sorts, filters and hides. Without `cell` it shows `row[key]` as
 * text (`value` only sorts and filters).
 */
export interface SoneDataTableColumn<
  Row = never,
> extends SoneDataTableColumnLike<Row> {
  readonly key: string;
  readonly header?: string;
  /** Keep the header for screen readers only. */
  readonly hideHeader?: boolean;
  readonly width?: string | null;
  readonly alignEnd?: boolean;
  /** Renders the cell (the twin of the Vue `#cell-<key>="{ row }"` slot). */
  readonly cell?: (row: Row, index: number) => ReactNode;
  /** Whether the column menu lists it (so it can be hidden); default: true. */
  readonly hideable?: boolean;
}

export interface SoneDataTableProps<Row> extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onChange"
> {
  readonly ref?: Ref<HTMLElement>;
  /** Every row; the table filters, sorts and pages them. */
  readonly rows?: readonly Row[];
  readonly columns?: readonly SoneDataTableColumn<Row>[];
  /** A stable key per row — what `selected` holds; default: its index in `rows`. */
  readonly rowKey?: (row: Row, index: number) => SoneDataTableKey;
  /** The sorted column (controlled, with `onSortChange`); `null` keeps the order of `rows`. */
  readonly sort?: SoneDataTableSort | null;
  readonly defaultSort?: SoneDataTableSort | null;
  readonly onSortChange?: (sort: SoneDataTableSort | null) => void;
  /** The global filter text (controlled, with `onFilterChange`). */
  readonly filter?: string;
  readonly defaultFilter?: string;
  readonly onFilterChange?: (filter: string) => void;
  /** Shows the filter field above the table. */
  readonly filterable?: boolean;
  /** Default: the `dataTableFilter` message. */
  readonly filterPlaceholder?: string | null;
  /** The current page, 1-based (controlled, with `onPageChange`). */
  readonly page?: number;
  readonly defaultPage?: number;
  readonly onPageChange?: (page: number) => void;
  /** Rows per page; 0 shows every row (no pagination). */
  readonly pageSize?: number;
  /** Adds a checkbox column; the checked rows' keys are `selected`. */
  readonly selectable?: boolean;
  /** The keys of the selected rows (controlled, with `onSelectedChange`). */
  readonly selected?: readonly SoneDataTableKey[];
  readonly defaultSelected?: readonly SoneDataTableKey[];
  readonly onSelectedChange?: (selected: SoneDataTableKey[]) => void;
  /** Names a row for its checkbox (“Select INV001”); default: “Select row 3”. */
  readonly rowLabel?: ((row: Row) => string) | null;
  /** Shows the column visibility menu. */
  readonly columnToggle?: boolean;
  /** The keys of the hidden columns (controlled, with `onHiddenColumnsChange`). */
  readonly hiddenColumns?: readonly string[];
  readonly defaultHiddenColumns?: readonly string[];
  readonly onHiddenColumnsChange?: (hidden: string[]) => void;
  /** Rows are on their way: the table is busy and says so. */
  readonly loading?: boolean;
  readonly caption?: string | null;
  /** The one row shown when nothing matches (default: the `dataTableEmpty` message). */
  readonly emptyText?: string | null;
  /** More toolbar content (bulk actions), between the filter and the column menu. */
  readonly toolbar?: ReactNode;
}

/** The key of the selection column (the row checkboxes). */
const SELECT_KEY = "sone-data-table-select";
const NO_KEYS: readonly never[] = [];

/**
 * `<sone-data-table>` — a data-driven table on top of `SoneTable` (shadcn/ui Data Table):
 * sortable headers (`aria-sort`, ascending → descending → unsorted), an optional global
 * filter, client pagination through `SonePagination`, row selection with checkboxes
 * (select-all with the mixed state), a column visibility menu, an empty row and a loading
 * state. Sort, filter, page, selection and hidden columns are each a `value` /
 * `defaultValue` / `onValueChange` style trio.
 */
export function SoneDataTable<Row>({
  rows = NO_KEYS,
  columns = NO_KEYS,
  rowKey = dataTableIndexKey,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  filter: filterProp,
  defaultFilter = "",
  onFilterChange,
  filterable = false,
  filterPlaceholder = null,
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  pageSize = 10,
  selectable = false,
  selected: selectedProp,
  defaultSelected = NO_KEYS,
  onSelectedChange,
  rowLabel = null,
  columnToggle = false,
  hiddenColumns: hiddenProp,
  defaultHiddenColumns = NO_KEYS,
  onHiddenColumnsChange,
  loading = false,
  caption = null,
  emptyText = null,
  toolbar,
  ...rest
}: SoneDataTableProps<Row>): ReactElement {
  const m = useSoneMessages();
  const [sort, setSort] = useControllable(sortProp, defaultSort, onSortChange);
  const [filter, setFilter] = useControllable(
    filterProp,
    defaultFilter,
    onFilterChange,
  );
  const [page, setPage] = useControllable(pageProp, defaultPage, onPageChange);
  const [selected, setSelected] = useControllable<readonly SoneDataTableKey[]>(
    selectedProp,
    defaultSelected,
    onSelectedChange as ((v: readonly SoneDataTableKey[]) => void) | undefined,
  );
  const [hidden, setHidden] = useControllable<readonly string[]>(
    hiddenProp,
    defaultHiddenColumns,
    onHiddenColumnsChange as ((v: readonly string[]) => void) | undefined,
  );

  const view = useMemo(
    () =>
      dataTableView({ rows, columns, sort, filter, page, pageSize, rowKey }),
    [rows, columns, sort, filter, page, pageSize, rowKey],
  );
  const entryOf = new Map<Row, SoneDataTableRow<Row>>(
    view.rows.map((r) => [r.row, r]),
  );
  const pageKeys = view.rows.map((r) => r.key);
  const selection = dataTableSelection(pageKeys, selected);
  const isSelected = (row: Row): boolean => {
    const entry = entryOf.get(row);
    return !!entry && selected.includes(entry.key);
  };
  const direction = (key: string) =>
    sort && sort.key === key ? sort.direction : null;

  const sortHead = (column: SoneTableColumn<Row>): ReactNode => {
    const dir = direction(column.key);
    return (
      <SoneButton
        variant="ghost"
        size="sm"
        type="button"
        className="data-table-sort"
        data-slot="data-table-sort"
        data-direction={dir ?? undefined}
        onClick={() => setSort(nextDataTableSort(sort, column.key))}
      >
        {column.hideHeader ? (
          <span className="sr-only">{column.header ?? ""}</span>
        ) : (
          (column.header ?? "")
        )}
        <SoneIcon
          icon={
            dir === "asc"
              ? "arrow-up"
              : dir === "desc"
                ? "arrow-down"
                : "arrow-up-down"
          }
        />
      </SoneButton>
    );
  };

  const tableColumns: SoneTableColumn<Row>[] = visibleDataTableColumns(
    columns,
    hidden,
  ).map((c) => ({
    key: c.key,
    header: c.header ?? "",
    hideHeader: c.hideHeader,
    width: c.width,
    alignEnd: c.alignEnd,
    cell: c.cell,
    head: c.sortable ? sortHead : undefined,
    sort: c.sortable ? dataTableAriaSort(sort, c.key) : null,
  }));
  if (selectable)
    tableColumns.unshift({
      key: SELECT_KEY,
      header: m.dataTableSelectAll,
      width: "var(--space-10)",
      head: () => (
        <SoneCheckbox
          checked={selection.all}
          indeterminate={selection.some}
          disabled={view.rows.length === 0}
          aria-label={m.dataTableSelectAll}
          onCheckedChange={(on) =>
            setSelected(toggleDataTableKeys(selected, pageKeys, on))
          }
        />
      ),
      cell: (row) => {
        const entry = entryOf.get(row);
        const name = rowLabel?.(row);
        return (
          <SoneCheckbox
            checked={isSelected(row)}
            aria-label={m.dataTableSelectRow(name || (entry?.index ?? 0) + 1)}
            onCheckedChange={() => {
              if (entry) setSelected(toggleDataTableKey(selected, entry.key));
            }}
          />
        );
      },
    });

  const placeholder = filterPlaceholder ?? m.dataTableFilter;
  const off = new Set(hidden);
  const pageRows = view.rows.map((r) => r.row);
  return createElement(
    "sone-data-table",
    {
      "data-slot": "data-table",
      "data-loading": loading ? "" : undefined,
      ...rest,
    },
    <div className="data-table-toolbar" data-slot="data-table-toolbar">
      {filterable ? (
        <SoneSearchField
          className="data-table-filter"
          size="sm"
          clearable
          value={filter}
          placeholder={placeholder}
          ariaLabel={placeholder}
          onValueChange={(value) => {
            if (value === filter) return;
            setFilter(value);
            setPage(1);
          }}
        />
      ) : null}
      {toolbar}
      {columnToggle ? (
        <SoneMenuTrigger
          as={SoneButton}
          variant="outline"
          size="sm"
          type="button"
          className="data-table-columns"
          data-slot="data-table-columns"
          menu={
            <SoneMenu aria-label={m.dataTableColumns}>
              {columns
                .filter((c) => c.hideable !== false)
                .map((c) => (
                  <SoneMenuCheckboxItem
                    key={c.key}
                    type="button"
                    checked={!off.has(c.key)}
                    onClick={() =>
                      setHidden(toggleDataTableColumn(hidden, c.key))
                    }
                  >
                    {c.header || c.key}
                  </SoneMenuCheckboxItem>
                ))}
            </SoneMenu>
          }
        >
          {m.dataTableColumns}
          <SoneIcon icon="chevron-down" />
        </SoneMenuTrigger>
      ) : null}
    </div>,
    <div
      className="data-table-body"
      data-slot="data-table-body"
      aria-busy={loading ? "true" : undefined}
    >
      <SoneTable
        rows={pageRows}
        columns={tableColumns}
        rowKey={(row) => entryOf.get(row)?.key ?? 0}
        isSelected={isSelected}
        caption={caption}
        emptyText={loading ? m.loading : (emptyText ?? m.dataTableEmpty)}
      />
      {loading && pageRows.length > 0 ? (
        <div className="data-table-loading" data-slot="data-table-loading">
          <SoneSpinner size={20} />
        </div>
      ) : null}
    </div>,
    selectable || view.pageCount > 1 ? (
      <div className="data-table-footer" data-slot="data-table-footer">
        {selectable ? (
          <p
            className="data-table-count"
            data-slot="data-table-count"
            aria-live="polite"
          >
            {m.dataTableSelected(selected.length, view.total)}
          </p>
        ) : null}
        {view.pageCount > 1 ? (
          <SonePagination
            className="data-table-pagination"
            page={view.page}
            pageCount={view.pageCount}
            onPageChange={setPage}
          />
        ) : null}
      </div>
    ) : null,
  );
}
