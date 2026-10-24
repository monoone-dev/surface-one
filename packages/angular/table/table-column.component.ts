import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
  booleanAttribute,
} from "@angular/core";

// A COLUMN DEFINITION for `<sone-table>`, not a rendered element: captured
// via `contentChildren`, never projected.
@Component({
  selector: "sone-table-column",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: "",
})
export class SoneTableColumnComponent {
  readonly key = input.required<string>();
  readonly header = input<string>("");
  readonly hideHeader = input(false, { transform: booleanAttribute });
  readonly width = input<string | null>(null);
  readonly alignEnd = input(false, { transform: booleanAttribute });
  /** The header's `aria-sort`; set it on the sorted column only. */
  readonly sort = input<"ascending" | "descending" | "none" | null>(null);

  readonly cellTemplate = contentChild(TemplateRef);
}
