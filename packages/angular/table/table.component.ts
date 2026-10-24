import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChildren,
  input,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { SoneTableColumnComponent } from "./table-column.component";

/** What a cell template receives: `let-row` (`$implicit`) and `let-index="index"`. */
export interface SoneTableCellContext<T = unknown> {
  readonly $implicit: T;
  readonly index: number;
}

/**
 * A column given through the `columns` input — the shape of the Vue and React twins'
 * `columns` prop. A cell renders `cell` (an `<ng-template let-row>`), else the row's
 * `key` property as text.
 */
export interface SoneTableColumn<T = unknown> {
  readonly key: string;
  readonly header?: string;
  /** Keep the header for screen readers only. */
  readonly hideHeader?: boolean;
  readonly width?: string | null;
  readonly alignEnd?: boolean;
  readonly cell?: TemplateRef<SoneTableCellContext<T>> | null;
}

/** One column as the template draws it, from either source. */
interface ResolvedColumn {
  readonly key: string;
  readonly header: string;
  readonly hideHeader: boolean;
  readonly width: string | null;
  readonly alignEnd: boolean;
  readonly cell: TemplateRef<SoneTableCellContext> | null;
}

@Component({
  selector: "sone-table",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: "./table.component.html",
  styleUrl: "./table.component.scss",
  host: { "data-slot": "table-container" },
})
export class SoneTableComponent<T = unknown> {
  readonly rows = input.required<readonly T[]>();
  readonly trackBy = input.required<(row: T) => unknown>();
  readonly rowClass = input<(row: T) => Record<string, boolean>>(() => ({}));
  readonly isSelected = input<
    (row: T) => boolean,
    ((row: T) => boolean) | null | undefined
  >(() => false, { transform: (fn) => fn ?? (() => false) });
  readonly caption = input<string | null>(null);
  readonly emptyText = input<string | null>(null);
  /**
   * The columns as data (`{ key, header, cell }`), like the Vue and React twins — an
   * alternative to `<sone-table-column>` children, which win when both are given.
   */
  readonly columns = input<readonly SoneTableColumn<T>[] | null>(null);

  protected readonly columnChildren = contentChildren(SoneTableColumnComponent);

  protected readonly resolvedColumns = computed<readonly ResolvedColumn[]>(
    () => {
      const children = this.columnChildren();
      if (children.length > 0) {
        return children.map((col) => ({
          key: col.key(),
          header: col.header(),
          hideHeader: col.hideHeader(),
          width: col.width(),
          alignEnd: col.alignEnd(),
          cell: (col.cellTemplate() ??
            null) as TemplateRef<SoneTableCellContext> | null,
        }));
      }
      return (this.columns() ?? []).map((col) => ({
        key: col.key,
        header: col.header ?? "",
        hideHeader: col.hideHeader ?? false,
        width: col.width ?? null,
        alignEnd: col.alignEnd ?? false,
        cell: (col.cell ?? null) as TemplateRef<SoneTableCellContext> | null,
      }));
    },
  );

  /** A cell with no template: the row's `key` property as text. */
  protected text(row: T, key: string): string {
    const value = (row as Record<string, unknown> | null)?.[key];
    return value == null ? "" : String(value);
  }
}
