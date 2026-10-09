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
