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

  readonly cellTemplate = contentChild(TemplateRef);
}
