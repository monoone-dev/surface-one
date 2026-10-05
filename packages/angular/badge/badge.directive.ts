import { Directive, input } from "@angular/core";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "destructive"
  | "outline"
  | "ghost"
  | "link"
  | "success"
  | "warning"
  | "accent"
  | "live";

@Directive({
  selector: "[soneBadge]",
  host: {
    class: "badge",
    "data-slot": "badge",
    "[attr.data-variant]": "variant()",
  },
})
export class SoneBadgeDirective {
  readonly variant = input<BadgeVariant>("default");
}
