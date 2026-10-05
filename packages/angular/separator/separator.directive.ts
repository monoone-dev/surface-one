import { Directive, input } from "@angular/core";

export type SeparatorOrientation = "horizontal" | "vertical";

@Directive({
  selector: "[soneSeparator]",
  host: {
    class: "separator",
    "data-slot": "separator",
    "[attr.data-orientation]": "orientation()",
    "[attr.role]": "decorative() ? 'none' : 'separator'",
    "[attr.aria-orientation]": "decorative() ? null : orientation()",
  },
})
export class SoneSeparatorDirective {
  readonly orientation = input<SeparatorOrientation>("horizontal");
  readonly decorative = input(true);
}
