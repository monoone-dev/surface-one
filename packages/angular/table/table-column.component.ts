import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
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
  readonly hideHeader = input(false);
  readonly width = input<string | null>(null);
  readonly alignEnd = input(false);

  readonly cellTemplate = contentChild(TemplateRef);
}
