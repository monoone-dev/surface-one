import { defineComponent, h, type PropType } from "vue";

import { SONE_ICONS, type ShellIcon } from "./icons.generated";

export type { ShellIcon };
export type IconSize = "xs" | "sm" | "base" | "lg" | "xl";

/**
 * `<sone-icon>` — one of the SurfaceOne glyphs (the same set as @surface-one/angular).
 * Decorative (`aria-hidden`) unless it has a `label`, which only a MEANINGFUL icon —
 * the only thing saying what it means — should get.
 */
export const SoneIcon = defineComponent({
  name: "SoneIcon",
  props: {
    icon: { type: String as PropType<ShellIcon>, required: true },
    size: { type: String as PropType<IconSize | null>, default: null },
    label: { type: String as PropType<string | null>, default: null },
    /** Beside text in a button or badge: `start` or `end`. */
    inline: { type: String as PropType<"start" | "end" | null>, default: null },
  },
  setup(props) {
    return () =>
      h(
        "sone-icon",
        {
          "data-slot": "icon",
          "data-icon": props.icon,
          "data-size": props.size ?? undefined,
          "data-inline": props.inline ?? undefined,
        },
        h("span", {
          class: "nav-icon",
          "aria-hidden": props.label ? undefined : "true",
          role: props.label ? "img" : undefined,
          "aria-label": props.label ?? undefined,
          innerHTML: SONE_ICONS[props.icon] ?? "",
        }),
      );
  },
});
