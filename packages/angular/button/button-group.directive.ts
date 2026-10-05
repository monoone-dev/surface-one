import { Directive, input } from "@angular/core";

@Directive({
  selector: "[soneButtonGroup]",
  host: {
    class: "btn-group",
    role: "group",
    "data-slot": "button-group",
    "[attr.data-orientation]": "orientation()",
  },
})
export class SoneButtonGroupDirective {
  readonly orientation = input<"horizontal" | "vertical">("horizontal");
}
