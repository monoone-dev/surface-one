import type { PropType } from "vue";

import { definePart } from "../../utils/part";

export type SeparatorOrientation = "horizontal" | "vertical";

export const SoneSeparator = definePart({
  name: "SoneSeparator",
  tag: "div",
  className: "separator",
  slot: "separator",
  props: {
    orientation: {
      type: String as PropType<SeparatorOrientation>,
      default: "horizontal",
    },
    /** A purely visual rule (`role="none"`); `false` makes it a semantic separator. */
    decorative: { type: Boolean, default: true },
  },
  attrs: (p) => ({
    "data-orientation": p.orientation,
    role: p.decorative ? "none" : "separator",
    "aria-orientation": p.decorative ? undefined : p.orientation,
  }),
});
