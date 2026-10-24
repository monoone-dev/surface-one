import { definePart } from "../../utils/part";

export type MarkerVariant = "default" | "separator" | "border";

/** `[soneMarker]` — a quiet status line in a thread: thinking, a tool step, a divider. */
export const SoneMarker = definePart<"div", { variant?: MarkerVariant }>({
  name: "SoneMarker",
  tag: "div",
  slot: "marker",
  props: ["variant"],
  attrs: (p) => ({ "data-variant": p.variant ?? "default" }),
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
