import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  input,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { SoneTableColumnComponent } from "./table-column.component";

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

  readonly columns = contentChildren(SoneTableColumnComponent);
}
