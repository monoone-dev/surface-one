import type { PropType } from "vue";

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
  | "live";

export const SoneBadge = definePart({
  name: "SoneBadge",
  tag: "span",
  className: "badge",
  slot: "badge",
  props: {
    variant: { type: String as PropType<BadgeVariant>, default: "default" },
    /** A leading status dot in the badge's colour. */
    dot: { type: Boolean, default: false },
  },
  attrs: (p) => ({ "data-variant": p.variant, "data-dot": flag(p.dot) }),
});
