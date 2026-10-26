import { definePart, flag } from "../../utils/part";

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
  | "info"
  | "live"
  | "dashed"
  | "count";

export interface SoneBadgeOwnProps {
  readonly variant?: BadgeVariant;
  /** A leading status dot in the badge's colour. */
  readonly dot?: boolean;
  /** Hover feedback for a badge that is not itself the link or button. */
  readonly interactive?: boolean;
}

/** `[soneBadge]` */
export const SoneBadge = definePart<"span", SoneBadgeOwnProps>({
  name: "SoneBadge",
  tag: "span",
  className: "badge",
  slot: "badge",
  props: ["variant", "dot", "interactive"],
  attrs: (p) => ({
    "data-variant": p.variant ?? "default",
    "data-dot": flag(p.dot),
    "data-interactive": flag(p.interactive),
  }),
});

/** `button[soneBadgeRemove]` — the remove button of a tag chip; name it `aria-label="Remove {tag}"`. */
export const SoneBadgeRemove = definePart({
  name: "SoneBadgeRemove",
  tag: "button",
  className: "badge-remove",
  slot: "badge-remove",
  static: { type: "button" },
});
