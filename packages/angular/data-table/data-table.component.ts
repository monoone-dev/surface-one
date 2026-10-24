import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  booleanAttribute,
  computed,
  input,
  model,
  numberAttribute,
  viewChild,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneCheckboxDirective } from "@surface-one/angular/checkbox";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SoneMenuCheckboxItemDirective,
  SoneMenuDirective,
  SoneMenuTriggerDirective,
} from "@surface-one/angular/menu";
import { SonePaginationComponent } from "@surface-one/angular/pagination";
import { SoneSearchFieldComponent } from "@surface-one/angular/search-field";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";
import {
  SoneTableComponent,
  type SoneTableCellContext,
  type SoneTableColumn,
  type SoneTableHeadContext,
} from "@surface-one/angular/table";

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
  type SoneDataTableSort,
} from "./data-table-state";

/**
 * A data table column: the `sone-table` column (`key`, `header`, `width`, `alignEnd`,
 * `cell` template) plus how it sorts, filters and hides.
 */
export interface SoneDataTableColumn<
  T = unknown,
> extends SoneDataTableColumnLike<T> {
  readonly key: string;
  readonly header?: string;
  /** Keep the header for screen readers only. */
  readonly hideHeader?: boolean;
  readonly width?: string | null;
  readonly alignEnd?: boolean;
  /** The cell (`<ng-template let-row>`); default: `row[key]` as text (`value` only sorts and filters). */
  readonly cell?: TemplateRef<SoneTableCellContext<T>> | null;
  /** Whether the column menu lists it (so it can be hidden); default: true. */
  readonly hideable?: boolean;
}

/** The key of the selection column (the row checkboxes). */
const SELECT_KEY = "sone-data-table-select";

/**
 * `<sone-data-table>` — a data-driven table on top of `<sone-table>` (shadcn/ui Data
 * Table): sortable headers (`aria-sort`, ascending → descending → unsorted), an optional
 * global filter, client pagination through `<sone-pagination>`, row selection with
 * checkboxes (select-all with the mixed state), a column visibility menu, an empty row and
 * a loading state. Sort, filter, page, selection and hidden columns are two-way.
 */
@Component({
  selector: "sone-data-table",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneButtonDirective,
    SoneCheckboxDirective,
    SoneIconComponent,
    SoneMenuCheckboxItemDirective,
    SoneMenuDirective,
    SoneMenuTriggerDirective,
    SonePaginationComponent,
    SoneSearchFieldComponent,
    SoneSpinnerComponent,
    SoneTableComponent,
  ],
  templateUrl: "./data-table.component.html",
  styleUrl: "./data-table.component.scss",
  host: {
    "data-slot": "data-table",
    "[attr.data-loading]": "loading() ? '' : null",
  },
})
export class SoneDataTableComponent<T = unknown> {
  /** Every row; the table filters, sorts and pages them. */
  readonly rows = input<readonly T[]>([]);
  readonly columns = input<readonly SoneDataTableColumn<T>[]>([]);
  /** A stable key per row — what `selected` holds; default: its index in `rows`. */
  readonly rowKey =
    input<(row: T, index: number) => SoneDataTableKey>(dataTableIndexKey);
  /** The sorted column, two-way; `null` keeps the order of `rows`. */
  readonly sort = model<SoneDataTableSort | null>(null);
  /** The global filter text, two-way. */
  readonly filter = model("");
  /** Shows the filter field above the table. */
  readonly filterable = input(false, { transform: booleanAttribute });
  readonly filterPlaceholder = input($localize`Filter…`);
  /** The current page (1-based), two-way. */
  readonly page = model(1);
  /** Rows per page; 0 shows every row (no pagination). */
  readonly pageSize = input(10, { transform: numberAttribute });
  /** Adds a checkbox column; the checked rows' keys are `selected`. */
  readonly selectable = input(false, { transform: booleanAttribute });
  /** The keys of the selected rows, two-way. */
  readonly selected = model<readonly SoneDataTableKey[]>([]);
  /** Names a row for its checkbox (“Select INV001”); default: “Select row 3”. */
  readonly rowLabel = input<((row: T) => string) | null>(null);
  /** Shows the column visibility menu. */
  readonly columnToggle = input(false, { transform: booleanAttribute });
  /** The keys of the hidden columns, two-way. */
  readonly hiddenColumns = model<readonly string[]>([]);
  /** Rows are on their way: the table is busy and says so. */
  readonly loading = input(false, { transform: booleanAttribute });
  readonly caption = input<string | null>(null);
  /** The one row shown when nothing matches. */
  readonly emptyText = input($localize`No results.`);

  protected readonly columnsLabel = $localize`Columns`;
  protected readonly selectAllLabel = $localize`Select all`;
  protected readonly loadingLabel = $localize`Loading`;

  private readonly sortHead =
    viewChild.required<TemplateRef<SoneTableHeadContext<T>>>("sortHead");
  private readonly selectHead =
    viewChild.required<TemplateRef<SoneTableHeadContext<T>>>("selectHead");
  private readonly selectCell =
    viewChild.required<TemplateRef<SoneTableCellContext<T>>>("selectCell");

  readonly view = computed(() =>
    dataTableView({
      rows: this.rows(),
      columns: this.columns(),
      sort: this.sort(),
      filter: this.filter(),
      page: this.page(),
      pageSize: this.pageSize(),
      rowKey: this.rowKey(),
    }),
  );

  protected readonly pageRows = computed(() =>
    this.view().rows.map((r) => r.row),
  );

  private readonly entryOf = computed(
    () => new Map(this.view().rows.map((r) => [r.row, r])),
  );

  protected readonly trackRow = (row: T): unknown =>
    this.entryOf().get(row)?.key ?? row;

  protected readonly selection = computed(() =>
    dataTableSelection(
      this.view().rows.map((r) => r.key),
      this.selected(),
    ),
  );

  protected readonly isRowSelected = (row: T): boolean => {
    const entry = this.entryOf().get(row);
    return !!entry && this.selected().includes(entry.key);
  };

  /** The columns the column menu lists. */
  protected readonly toggleable = computed(() => {
    const hidden = new Set(this.hiddenColumns());
    return this.columns()
      .filter((c) => c.hideable !== false)
      .map((c) => ({
        key: c.key,
        label: c.header || c.key,
        shown: !hidden.has(c.key),
      }));
  });

  protected readonly tableColumns = computed<readonly SoneTableColumn<T>[]>(
    () => {
      const sort = this.sort();
      const cols: SoneTableColumn<T>[] = visibleDataTableColumns(
        this.columns(),
        this.hiddenColumns(),
      ).map((c) => ({
        key: c.key,
        header: c.header ?? "",
        hideHeader: c.hideHeader,
        width: c.width,
        alignEnd: c.alignEnd,
        cell: c.cell ?? null,
        head: c.sortable ? this.sortHead() : null,
        sort: c.sortable ? dataTableAriaSort(sort, c.key) : null,
      }));
      if (!this.selectable()) return cols;
      return [
        {
          key: SELECT_KEY,
          header: this.selectAllLabel,
          width: "var(--space-10)",
          head: this.selectHead(),
          cell: this.selectCell(),
        },
        ...cols,
      ];
    },
  );

  protected readonly showFooter = computed(
    () => this.selectable() || this.view().pageCount > 1,
  );

  protected readonly selectedCount = computed(() => this.selected().length);

  protected selectedText(count: number, total: number): string {
    return $localize`${count}:count: of ${total}:total: row(s) selected.`;
  }

  protected sortDirection(key: string): "asc" | "desc" | null {
    const sort = this.sort();
    return sort && sort.key === key ? sort.direction : null;
  }

  protected sortIcon(key: string): "arrow-up" | "arrow-down" | "arrow-up-down" {
    const dir = this.sortDirection(key);
    return dir === "asc"
      ? "arrow-up"
      : dir === "desc"
        ? "arrow-down"
        : "arrow-up-down";
  }

  protected rowCheckboxLabel(row: T): string {
    const name = this.rowLabel()?.(row);
    if (name) return $localize`Select ${name}:name:`;
    const n = (this.entryOf().get(row)?.index ?? 0) + 1;
    return $localize`Select row ${n}:row:`;
  }

  /** Cycles the sort of column `key`: ascending → descending → unsorted. */
  toggleSort(key: string): void {
    this.sort.set(nextDataTableSort(this.sort(), key));
  }

  protected onFilter(value: string): void {
    if (value === this.filter()) return;
    this.filter.set(value);
    this.page.set(1);
  }

  protected onPage(page: number): void {
    this.page.set(page);
  }

  protected toggleRow(row: T): void {
    const entry = this.entryOf().get(row);
    if (entry)
      this.selected.set(toggleDataTableKey(this.selected(), entry.key));
  }

  protected toggleAll(on: boolean): void {
    this.selected.set(
      toggleDataTableKeys(
        this.selected(),
        this.view().rows.map((r) => r.key),
        on,
      ),
    );
  }

  protected toggleColumn(key: string): void {
    this.hiddenColumns.set(toggleDataTableColumn(this.hiddenColumns(), key));
  }

  protected checked(event: Event): boolean {
    return (event.target as HTMLInputElement).checked;
  }
}
