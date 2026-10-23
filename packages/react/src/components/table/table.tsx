import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

export interface SoneTableColumn<Row = never> {
  readonly key: string;
  readonly header?: string;
  /** Keep the header for screen readers only. */
  readonly hideHeader?: boolean;
  readonly width?: string | null;
  readonly alignEnd?: boolean;
  /**
   * Renders the column's cell (the twin of the Vue `#cell-<key>="{ row }"` slot);
   * without it the cell shows `String(row[key])`.
   */
  readonly cell?: (row: Row, index: number) => ReactNode;
}

export interface SoneTableProps<Row> extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
  readonly rows: readonly Row[];
  readonly columns: readonly SoneTableColumn<Row>[];
  /** A stable key per row; default: its index. */
  readonly rowKey?: (row: Row, index: number) => string | number;
  /** A class name per row. */
  readonly rowClass?: (row: Row) => string | undefined;
  /** Marks a row `data-state="selected"`. */
  readonly isSelected?: (row: Row) => boolean;
  readonly caption?: string | null;
  /** The one row shown when there are no rows. */
  readonly emptyText?: string | null;
}

const byIndex = (_row: unknown, index: number) => index;

function cellOf<Row>(
  row: Row,
  index: number,
  col: SoneTableColumn<Row>,
): ReactNode {
  if (col.cell) return col.cell(row, index);
  const value = (row as Record<string, unknown> | null)?.[col.key];
  return value == null ? "" : String(value);
}

/**
 * `<sone-table>` — a data table. Columns are a prop; a cell renders the column's
 * `cell(row, index)` render prop, else the row's `key` property:
 *
 *   <SoneTable rows={notes} columns={[
 *     { key: "title", header: "Title" },
 *     { key: "folder", header: "Folder", cell: (note) => <SoneBadge>{note.folder}</SoneBadge> },
 *   ]} />
 */
export function SoneTable<Row>({
  rows,
  columns,
  rowKey = byIndex,
  rowClass,
  isSelected,
  caption = null,
  emptyText = null,
  ...rest
}: SoneTableProps<Row>): ReactElement {
  return createElement(
    "sone-table",
    { "data-slot": "table-container", ...rest },
    <table className="sone-table" data-slot="table">
      {caption ? (
        <caption className="sone-table-caption" data-slot="table-caption">
          {caption}
        </caption>
      ) : null}
      <thead data-slot="table-header">
        <tr data-slot="table-row">
          {columns.map((col) => (
            <th
              key={col.key}
              data-slot="table-head"
              scope="col"
              style={col.width ? { width: col.width } : undefined}
              className={col.alignEnd ? "is-end" : undefined}
            >
              {col.hideHeader ? (
                <span className="sr-only">{col.header ?? ""}</span>
              ) : (
                (col.header ?? "")
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody data-slot="table-body">
        {rows.length === 0 ? (
          emptyText ? (
            <tr className="sone-table-empty" data-slot="table-row">
              <td colSpan={columns.length}>{emptyText}</td>
            </tr>
          ) : null
        ) : (
          rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              data-slot="table-row"
              className={rowClass?.(row)}
              data-state={isSelected?.(row) ? "selected" : undefined}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  data-slot="table-cell"
                  className={col.alignEnd ? "is-end" : undefined}
                >
                  {cellOf(row, index, col)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>,
  );
}
