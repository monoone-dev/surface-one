import { Directive, model } from "@angular/core";

/**
 * `input[soneCheckbox]` — the native checkbox (spartan/ui Checkbox, native first): it
 * stays an `<input type="checkbox">`, so `[checked]`, `(change)`, `ngModel`,
 * `formControl`, `required` and a `<label for>` all work as they do on any checkbox,
 * and the global form styles draw it. The directive adds the mixed state the markup
 * cannot express: `[(indeterminate)]`, cleared when the user toggles it.
 */
@Directive({
  selector: "input[soneCheckbox]",
  exportAs: "soneCheckbox",
  host: {
    type: "checkbox",
    "data-slot": "checkbox",
    "[indeterminate]": "indeterminate()",
    "(change)": "onChange()",
  },
})
export class SoneCheckboxDirective {
  /** The mixed state ("some of them") — `[(indeterminate)]`; a click clears it. */
  readonly indeterminate = model(false);

  protected onChange(): void {
    // The browser drops the mixed state on a toggle; follow it.
    if (this.indeterminate()) this.indeterminate.set(false);
  }
}
