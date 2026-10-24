import type { PropType } from "vue";

import { definePart } from "../../utils/part";

export type MarkerVariant = "default" | "separator" | "border";

/** `[soneMarker]` — a quiet status line in a thread: thinking, a tool step, a divider. */
export const SoneMarker = definePart({
  name: "SoneMarker",
  tag: "div",
  slot: "marker",
  props: {
    variant: { type: String as PropType<MarkerVariant>, default: "default" },
  },
  attrs: (p) => ({ "data-variant": p.variant }),
});

/** `[soneMarkerIcon]` — decorative (`aria-hidden`). */
export const SoneMarkerIcon = definePart({
  name: "SoneMarkerIcon",
  tag: "span",
  slot: "marker-icon",
  static: { "aria-hidden": "true" },
});

export const SoneMarkerContent = definePart({
  name: "SoneMarkerContent",
  tag: "span",
  slot: "marker-content",
});
