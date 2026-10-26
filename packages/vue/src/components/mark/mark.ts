import { defineComponent, h, type PropType } from "vue";

import {
  markSizePreset,
  markSizeStyle,
  type MarkSize,
  type MarkTone,
  type ShellIcon,
} from "@surface-one/core";

import { SoneIcon } from "../icon/icon";

export type { MarkSize, MarkTone } from "@surface-one/core";
export { MARK_TONES } from "@surface-one/core";

/**
 * `<sone-mark>` — an app or source mark: a small rounded tile with a gradient `tone` and
 * a white glyph. Decorative unless it has a `label` (then `role="img"`).
 */
export const SoneMark = defineComponent({
  name: "SoneMark",
  props: {
    icon: { type: String as PropType<ShellIcon>, default: "layout-grid" },
    tone: { type: String as PropType<MarkTone>, default: "brand" },
    /** `sm` (20), `md` (28), `lg` (40) or a size in px. */
    size: { type: [String, Number] as PropType<MarkSize>, default: "md" },
    /** The accessible name; leave it out when text beside the mark already names it. */
    label: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    return () => {
      const px = markSizeStyle(props.size);
      return h(
        "sone-mark",
        {
          "data-slot": "mark",
          "data-tone": props.tone,
          "data-size": markSizePreset(props.size) ?? undefined,
          // The server renderer prints `style=""` for an undefined style; leave the key out.
          ...(px ? { style: { "--mark-size": px } } : {}),
          role: props.label ? "img" : undefined,
          "aria-label": props.label || undefined,
          "aria-hidden": props.label ? undefined : "true",
        },
        h(SoneIcon, { icon: props.icon }),
      );
    };
  },
});
