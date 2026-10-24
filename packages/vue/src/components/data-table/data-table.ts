import {
  computed,
  defineComponent,
  h,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";

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

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
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
 * A data table column: the `SoneTable` column (`key`, `header`, `width`, `alignEnd`) plus
 * how it sorts, filters and hides. Its cell is the `#cell-<key>="{ row }"` slot, else
 * `row[key]` as text (`value` only sorts and filters).
 */
export interface SoneDataTableColumn<
  T = never,
> extends SoneDataTableColumnLike<T> {
  readonly key: string;
  readonly header?: string;
  /** Keep the header for screen readers only. */
  readonly hideHeader?: boolean;
  readonly width?: string | null;
  readonly alignEnd?: boolean;
  /** Whether the column menu lists it (so it can be hidden); default: true. */
  readonly hideable?: boolean;
}

/** The key of the selection column (the row checkboxes). */
const SELECT_KEY = "sone-data-table-select";

type Row = never;

/**
 * `<sone-data-table>` — a data-driven table on top of `SoneTable` (shadcn/ui Data Table):
 * sortable headers (`aria-sort`, ascending → descending → unsorted), an optional global
 * filter, client pagination through `SonePagination`, row selection with checkboxes
 * (select-all with the mixed state), a column visibility menu, an empty row and a loading
 * state. `v-model:sort`, `v-model:filter`, `v-model:page`, `v-model:selected` and
 * `v-model:hiddenColumns`; cells are `#cell-<key>="{ row }"` slots, the default slot
 * goes into the toolbar.
 */
export const SoneDataTable = defineComponent({
  name: "SoneDataTable",
  props: {
    /** Every row; the table filters, sorts and pages them. */
    rows: { type: Array as PropType<readonly unknown[]>, default: () => [] },
    columns: {
      type: Array as PropType<readonly SoneDataTableColumn[]>,
      default: () => [],
    },
    /** A stable key per row — what `selected` holds; default: its index in `rows`. */
    rowKey: {
      type: Function as PropType<(row: Row, index: number) => SoneDataTableKey>,
      default: dataTableIndexKey,
    },
    /** The sorted column — `v-model:sort`; `null` keeps the order of `rows`. */
    sort: {
      type: Object as PropType<SoneDataTableSort | null>,
      default: null,
    },
    /** The global filter text — `v-model:filter`. */
    filter: { type: String, default: "" },
    /** Shows the filter field above the table. */
    filterable: { type: Boolean, default: false },
    /** Default: the `dataTableFilter` message. */
    filterPlaceholder: {
      type: String as PropType<string | null>,
      default: null,
    },
    /** The current page (1-based) — `v-model:page`. */
    page: { type: Number, default: 1 },
    /** Rows per page; 0 shows every row (no pagination). */
    pageSize: { type: Number, default: 10 },
    /** Adds a checkbox column; the checked rows' keys are `selected`. */
    selectable: { type: Boolean, default: false },
    /** The keys of the selected rows — `v-model:selected`. */
    selected: {
      type: Array as PropType<readonly SoneDataTableKey[]>,
      default: () => [],
    },
    /** Names a row for its checkbox (“Select INV001”); default: “Select row 3”. */
    rowLabel: {
      type: Function as PropType<((row: Row) => string) | null>,
      default: null,
    },
    /** Shows the column visibility menu. */
    columnToggle: { type: Boolean, default: false },
    /** The keys of the hidden columns — `v-model:hiddenColumns`. */
    hiddenColumns: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    /** Rows are on their way: the table is busy and says so. */
    loading: { type: Boolean, default: false },
    caption: { type: String as PropType<string | null>, default: null },
    /** The one row shown when nothing matches (default: the `dataTableEmpty` message). */
    emptyText: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    "update:sort": (_sort: SoneDataTableSort | null) => true,
    "update:filter": (_filter: string) => true,
    "update:page": (_page: number) => true,
    "update:selected": (_selected: SoneDataTableKey[]) => true,
    "update:hiddenColumns": (_hidden: string[]) => true,
  },
  slots: Object as SlotsType<
    { default?: () => VNodeChild } & Record<
      `cell-${string}`,
      { row: never; index: number }
    >
  >,
  setup(props, { emit, slots }) {
    const messages = useSoneMessages();
    const sort = useModel(
      () => props.sort,
      (v) => emit("update:sort", v),
    );
    const filter = useModel(
      () => props.filter,
      (v) => emit("update:filter", v),
    );
    const page = useModel(
      () => props.page,
      (v) => emit("update:page", v),
    );
    const selected = useModel<readonly SoneDataTableKey[]>(
      () => props.selected,
      (v) => emit("update:selected", [...v]),
    );
    const hidden = useModel<readonly string[]>(
      () => props.hiddenColumns,
      (v) => emit("update:hiddenColumns", [...v]),
    );

    const view = computed(() =>
      dataTableView<Row>({
        rows: props.rows as readonly Row[],
        columns: props.columns as readonly SoneDataTableColumn<Row>[],
        sort: sort.value,
        filter: filter.value,
        page: page.value,
        pageSize: props.pageSize,
        rowKey: props.rowKey,
      }),
    );
    const entryOf = computed(
      () =>
        new Map<unknown, SoneDataTableRow<Row>>(
          view.value.rows.map((r) => [r.row, r]),
        ),
    );
    const selection = computed(() =>
      dataTableSelection(
        view.value.rows.map((r) => r.key),
        selected.value,
      ),
    );
    const isSelected = (row: unknown): boolean => {
      const entry = entryOf.value.get(row);
      return !!entry && selected.value.includes(entry.key);
    };
    const rowCheckboxLabel = (row: unknown): string => {
      const name = props.rowLabel?.(row as Row);
      return messages.value.dataTableSelectRow(
        name || (entryOf.value.get(row)?.index ?? 0) + 1,
      );
    };
    const direction = (key: string) =>
      sort.value && sort.value.key === key ? sort.value.direction : null;

    const sortHead = (column: SoneTableColumn): VNodeChild => {
      const dir = direction(column.key);
      return h(
        SoneButton,
        {
          variant: "ghost",
          size: "sm",
          type: "button",
          class: "data-table-sort",
          "data-slot": "data-table-sort",
          "data-direction": dir ?? undefined,
          onClick: () => sort.set(nextDataTableSort(sort.value, column.key)),
        },
        () => [
          column.hideHeader
            ? h("span", { class: "sr-only" }, column.header ?? "")
            : (column.header ?? ""),
          h(SoneIcon, {
            icon:
              dir === "asc"
                ? "arrow-up"
                : dir === "desc"
                  ? "arrow-down"
                  : "arrow-up-down",
          }),
        ],
      );
    };

    const tableColumns = computed<SoneTableColumn[]>(() => {
      const cols = visibleDataTableColumns(props.columns, hidden.value).map(
        (c): SoneTableColumn => ({
          key: c.key,
          header: c.header ?? "",
          hideHeader: c.hideHeader,
          width: c.width,
          alignEnd: c.alignEnd,
          sort: c.sortable ? dataTableAriaSort(sort.value, c.key) : null,
        }),
      );
      return props.selectable
        ? [
            {
              key: SELECT_KEY,
              header: messages.value.dataTableSelectAll,
              width: "var(--space-10)",
            },
            ...cols,
          ]
        : cols;
    });

    return () => {
      const m = messages.value;
      const v = view.value;
      const rows = v.rows.map((r) => r.row);
      const sortable = new Set(
        props.columns.filter((c) => c.sortable).map((c) => c.key),
      );
      const tableSlots: Record<string, (scope: never) => VNodeChild> = {};
      for (const [name, slot] of Object.entries(slots))
        if (name.startsWith("cell-") && slot)
          tableSlots[name] = slot as (scope: never) => VNodeChild;
      for (const key of sortable)
        tableSlots[`head-${key}`] = (({
          column,
        }: {
          column: SoneTableColumn;
        }) => sortHead(column)) as (scope: never) => VNodeChild;
      if (props.selectable) {
        tableSlots[`head-${SELECT_KEY}`] = () =>
          h(SoneCheckbox, {
            modelValue: selection.value.all,
            indeterminate: selection.value.some,
            disabled: rows.length === 0,
            "aria-label": m.dataTableSelectAll,
            "onUpdate:modelValue": (on: boolean) =>
              selected.set(
                toggleDataTableKeys(
                  selected.value,
                  v.rows.map((r) => r.key),
                  on,
                ),
              ),
          });
        tableSlots[`cell-${SELECT_KEY}`] = (({ row }: { row: unknown }) =>
          h(SoneCheckbox, {
            modelValue: isSelected(row),
            "aria-label": rowCheckboxLabel(row),
            "onUpdate:modelValue": () => {
              const entry = entryOf.value.get(row);
              if (entry)
                selected.set(toggleDataTableKey(selected.value, entry.key));
            },
          })) as (scope: never) => VNodeChild;
      }

      const hiddenSet = new Set(hidden.value);
      const toolbar = h(
        "div",
        { class: "data-table-toolbar", "data-slot": "data-table-toolbar" },
        [
          props.filterable
            ? h(SoneSearchField, {
                class: "data-table-filter",
                size: "sm",
                clearable: true,
                modelValue: filter.value,
                placeholder: props.filterPlaceholder ?? m.dataTableFilter,
                ariaLabel: props.filterPlaceholder ?? m.dataTableFilter,
                "onUpdate:modelValue": (value: string) => {
                  if (value === filter.value) return;
                  filter.set(value);
                  page.set(1);
                },
              })
            : null,
          slots.default?.(),
          props.columnToggle
            ? h(
                SoneMenuTrigger,
                {
                  as: SoneButton,
                  variant: "outline",
                  size: "sm",
                  type: "button",
                  class: "data-table-columns",
                  "data-slot": "data-table-columns",
                },
                {
                  default: () => [
                    m.dataTableColumns,
                    h(SoneIcon, { icon: "chevron-down" }),
                  ],
                  menu: () =>
                    h(SoneMenu, { "aria-label": m.dataTableColumns }, () =>
                      props.columns
                        .filter((c) => c.hideable !== false)
                        .map((c) =>
                          h(
                            SoneMenuCheckboxItem,
                            {
                              key: c.key,
                              type: "button",
                              checked: !hiddenSet.has(c.key),
                              onClick: () =>
                                hidden.set(
                                  toggleDataTableColumn(hidden.value, c.key),
                                ),
                            },
                            () => c.header || c.key,
                          ),
                        ),
                    ),
                },
              )
            : null,
        ],
      );

      const showFooter = props.selectable || v.pageCount > 1;
      return h(
        "sone-data-table",
        {
          "data-slot": "data-table",
          "data-loading": props.loading ? "" : undefined,
        },
        [
          toolbar,
          h(
            "div",
            {
              class: "data-table-body",
              "data-slot": "data-table-body",
              "aria-busy": props.loading ? "true" : undefined,
            },
            [
              h(
                SoneTable,
                {
                  rows,
                  columns: tableColumns.value,
                  rowKey: (row: never) => entryOf.value.get(row)?.key ?? 0,
                  isSelected: (row: never) => isSelected(row),
                  caption: props.caption,
                  emptyText: props.loading
                    ? m.loading
                    : (props.emptyText ?? m.dataTableEmpty),
                },
                tableSlots,
              ),
              props.loading && rows.length > 0
                ? h(
                    "div",
                    {
                      class: "data-table-loading",
                      "data-slot": "data-table-loading",
                    },
                    h(SoneSpinner, { size: 20 }),
                  )
                : null,
            ],
          ),
          showFooter
            ? h(
                "div",
                {
                  class: "data-table-footer",
                  "data-slot": "data-table-footer",
                },
                [
                  props.selectable
                    ? h(
                        "p",
                        {
                          class: "data-table-count",
                          "data-slot": "data-table-count",
                          "aria-live": "polite",
                        },
                        m.dataTableSelected(selected.value.length, v.total),
                      )
                    : null,
                  v.pageCount > 1
                    ? h(SonePagination, {
                        class: "data-table-pagination",
                        page: v.page,
                        pageCount: v.pageCount,
                        "onUpdate:page": (p: number) => page.set(p),
                      })
                    : null,
                ],
              )
            : null,
        ],
      );
    };
  },
});
