import {
  defineComponent,
  h,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";

export interface SoneTableColumn {
  readonly key: string;
  readonly header?: string;
  /** Keep the header for screen readers only. */
  readonly hideHeader?: boolean;
  readonly width?: string | null;
  readonly alignEnd?: boolean;
}

/**
 * `<sone-table>` — a data table. Columns are a prop; a cell renders the
 * `#cell-<key>="{ row }"` slot, else the row's `key` property.
 */
export const SoneTable = defineComponent({
  name: "SoneTable",
  props: {
    rows: { type: Array as PropType<readonly unknown[]>, required: true },
    columns: {
      type: Array as PropType<readonly SoneTableColumn[]>,
      required: true,
    },
    /** A stable key per row. */
    rowKey: {
      type: Function as PropType<(row: never, index: number) => PropertyKey>,
      default: (_row: unknown, index: number) => index,
    },
    rowClass: {
      type: Function as PropType<(row: never) => unknown>,
      default: undefined,
    },
    isSelected: {
      type: Function as PropType<(row: never) => boolean>,
      default: undefined,
    },
    caption: { type: String as PropType<string | null>, default: null },
    emptyText: { type: String as PropType<string | null>, default: null },
  },
  slots: Object as SlotsType<
    Record<`cell-${string}`, { row: never; index: number }>
  >,
  setup(props, { slots }) {
    type Row = never;
    const cell = (
      row: Row,
      index: number,
      col: SoneTableColumn,
    ): VNodeChild => {
      const slot = slots[`cell-${col.key}`];
      if (slot) return slot({ row, index });
      const value = (row as Record<string, unknown> | null)?.[col.key];
      return value == null ? "" : String(value);
    };
    return () =>
      h(
        "sone-table",
        { "data-slot": "table-container" },
        h("table", { class: "sone-table", "data-slot": "table" }, [
          props.caption
            ? h(
                "caption",
                { class: "sone-table-caption", "data-slot": "table-caption" },
                props.caption,
              )
            : null,
          h(
            "thead",
            { "data-slot": "table-header" },
            h(
              "tr",
              { "data-slot": "table-row" },
              props.columns.map((col) =>
                h(
                  "th",
                  {
                    key: col.key,
                    "data-slot": "table-head",
                    scope: "col",
                    ...(col.width && { style: { width: col.width } }),
                    ...(col.alignEnd && { class: "is-end" }),
                  },
                  col.hideHeader
                    ? h("span", { class: "sr-only" }, col.header ?? "")
                    : (col.header ?? ""),
                ),
              ),
            ),
          ),
          h("tbody", { "data-slot": "table-body" }, [
            props.rows.length === 0
              ? props.emptyText
                ? h(
                    "tr",
                    { class: "sone-table-empty", "data-slot": "table-row" },
                    h("td", { colspan: props.columns.length }, props.emptyText),
                  )
                : null
              : props.rows.map((row, index) =>
                  h(
                    "tr",
                    {
                      key: props.rowKey(row as Row, index),
                      "data-slot": "table-row",
                      ...(props.rowClass && {
                        class: props.rowClass(row as Row),
                      }),
                      "data-state": props.isSelected?.(row as Row)
                        ? "selected"
                        : undefined,
                    },
                    props.columns.map((col) =>
                      h(
                        "td",
                        {
                          key: col.key,
                          "data-slot": "table-cell",
                          ...(col.alignEnd && { class: "is-end" }),
                        },
                        [cell(row as Row, index, col)],
                      ),
                    ),
                  ),
                ),
          ]),
        ]),
      );
  },
});
