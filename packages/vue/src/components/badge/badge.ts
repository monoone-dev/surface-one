import type { PropType } from "vue";

import { definePart } from "../../utils/part";

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

export const SoneBadge = definePart({
  name: "SoneBadge",
  tag: "span",
  className: "badge",
  slot: "badge",
  props: {
    variant: { type: String as PropType<BadgeVariant>, default: "default" },
  },
  attrs: (p) => ({ "data-variant": p.variant }),
});

/** `button[soneBadgeRemove]` — the remove button of a tag chip; name it `aria-label="Remove {tag}"`. */
export const SoneBadgeRemove = definePart({
  name: "SoneBadgeRemove",
  tag: "button",
  className: "badge-remove",
  slot: "badge-remove",
  static: { type: "button" },
});
