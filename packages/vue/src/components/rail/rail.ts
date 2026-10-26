import { defineComponent, h, type PropType } from "vue";

import type { RailBadge, ShellIcon } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { definePart, splitAttrs } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

export type { RailBadge } from "@surface-one/core";

/**
 * `<sone-rail>` — a narrow column of icon buttons beside the page (on the glass in the
 * Surface skin). A `nav` landmark named by `ariaLabel`; put the buttons in
 * `SoneRailGroup` blocks — the first sits at the top, the last at the bottom.
 */
export const SoneRail = defineComponent({
  name: "SoneRail",
  props: {
    /** Names the navigation landmark (default: the "Main" message). */
    ariaLabel: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    return () =>
      h(
        "sone-rail",
        { "data-slot": "rail" },
        h(
          "nav",
          {
            class: "rail",
            "data-slot": "rail-nav",
            "aria-label": props.ariaLabel ?? messages.value.railLabel,
          },
          slots.default?.(),
        ),
      );
  },
});

/** A column of rail buttons. */
export const SoneRailGroup = definePart({
  name: "SoneRailGroup",
  tag: "div",
  className: "rail-group",
  slot: "rail-group",
});

/**
 * `<sone-rail-button>` — one place on a rail: a square icon button whose `label` is its
 * accessible name and its tooltip. `current` sets `aria-current="page"`; `badge` adds a
 * status dot. `class` / `style` style the host; listeners and other attributes go to the button.
 */
export const SoneRailButton = defineComponent({
  name: "SoneRailButton",
  inheritAttrs: false,
  props: {
    icon: { type: String as PropType<ShellIcon>, required: true },
    /** The accessible name and the tooltip. */
    label: { type: String, required: true },
    /** The place on screen now (`aria-current="page"`). */
    current: { type: Boolean, default: false },
    /** A status dot in the corner. */
    badge: { type: String as PropType<RailBadge | null>, default: null },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { attrs }) {
    return () => {
      const { host, control } = splitAttrs(attrs);
      return h(
        "sone-rail-button",
        { ...host, "data-slot": "rail-button" },
        h(
          "button",
          {
            ...control,
            type: "button",
            class: "rail-button",
            "data-slot": "rail-button-trigger",
            "aria-label": props.label,
            title: props.label,
            "aria-current": props.current ? "page" : undefined,
            disabled: props.disabled,
          },
          [
            h(SoneIcon, { icon: props.icon }),
            props.badge
              ? h("span", {
                  class: "rail-badge",
                  "data-slot": "rail-badge",
                  "data-badge": props.badge,
                  "aria-hidden": "true",
                })
              : null,
          ],
        ),
      );
    };
  },
});
