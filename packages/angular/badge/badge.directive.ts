import {
  Directive,
  HostAttributeToken,
  booleanAttribute,
  inject,
  input,
} from "@angular/core";

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

/**
 * `button[soneBadgeRemove]` — the remove button inside a removable badge (a tag
 * chip). Put the glyph inside (`<sone-icon icon="close" />`) and name it by what it
 * removes: `aria-label="Remove design"`. `type` defaults to `button`.
 */
@Directive({
  selector: "button[soneBadgeRemove]",
  host: {
    class: "badge-remove",
    "data-slot": "badge-remove",
    "[attr.type]": "type",
  },
})
export class SoneBadgeRemoveDirective {
  protected readonly type =
    inject(new HostAttributeToken("type"), { optional: true }) ?? "button";
}

export const SONE_BADGE_PARTS = [
  SoneBadgeDirective,
  SoneBadgeRemoveDirective,
] as const;
