import { defineComponent, h, withDirectives, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { vSoneTooltip } from "../../directives/tooltip";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type FloatingBarState = "idle" | "live" | "processing";

/**
 * `<sone-floating-bar>` — the compact always-on-top recording bar of a desktop app: your
 * content (an orb, a status line) in a pill, with an optional close button. `state`
 * tints it; `dragRegionAttr` marks its chrome as the window's drag handle
 * (`data-tauri-drag-region`).
 */
export const SoneFloatingBar = defineComponent({
  name: "SoneFloatingBar",
  props: {
    state: { type: String as PropType<FloatingBarState>, default: "idle" },
    /** The close button's name (default: the "Hide" message). */
    closeLabel: { type: String as PropType<string>, default: undefined },
    /** Show the trailing close button. */
    closable: { type: Boolean, default: true },
    /**
     * An attribute that marks the bar's chrome as the window's drag handle — Tauri's
     * `data-tauri-drag-region`; `null` = none.
     */
    dragRegionAttr: { type: String as PropType<string | null>, default: null },
    /** The attribute's value: `deep` (default) drags from anywhere but controls; `""` the background only. */
    dragRegionValue: { type: String, default: "deep" },
  },
  emits: { closed: () => true },
  setup(props, { slots, emit }) {
    const messages = useSoneMessages();
    return () => {
      const label = props.closeLabel ?? messages.value.floatingBarHide;
      const drag = props.dragRegionAttr?.trim();
      return h(
        "sone-floating-bar",
        { "data-slot": "floating-bar", "data-state": props.state },
        h(
          "div",
          {
            class: "floating-bar",
            "data-slot": "floating-bar-chrome",
            ...(drag ? { [drag]: props.dragRegionValue } : {}),
          },
          [
            h("div", { class: "floating-bar-content" }, slots.default?.()),
            props.closable
              ? withDirectives(
                  h(
                    SoneButton,
                    {
                      variant: "ghost",
                      size: "icon-xs",
                      type: "button",
                      class: "floating-bar-close",
                      "data-slot": "floating-bar-close",
                      "aria-label": label,
                      onClick: () => emit("closed"),
                    },
                    () => h(SoneIcon, { icon: "close" }),
                  ),
                  [[vSoneTooltip, label]],
                )
              : null,
          ],
        ),
      );
    };
  },
});
