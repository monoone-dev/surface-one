import { Directive, booleanAttribute, input } from "@angular/core";

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
    "[attr.data-dot]": 'dot() ? "" : null',
  },
})
export class SoneBadgeDirective {
  readonly variant = input<BadgeVariant>("default");
  /** A leading status dot in the badge's colour (the `<span class="badge-dot">` part, drawn for you). */
  readonly dot = input(false, { transform: booleanAttribute });
}
