import { defineComponent, h, type PropType } from "vue";

import { SoneSpinner } from "../spinner/spinner";

export type StatusOrbState =
  "ready" | "live" | "processing" | "paused" | "queued" | "error";
export type StatusOrbSize = "default" | "sm";

/**
 * `<sone-status-orb>` — a decorative dot for a recording's state (ready, live, paused,
 * queued, error); `processing` draws a small spinner instead. Always `aria-hidden`: say
 * the state in text next to it.
 */
export const SoneStatusOrb = defineComponent({
  name: "SoneStatusOrb",
  props: {
    state: { type: String as PropType<StatusOrbState>, default: "ready" },
    size: { type: String as PropType<StatusOrbSize>, default: "default" },
  },
  setup(props) {
    return () =>
      h(
        "sone-status-orb",
        {
          "data-slot": "status-orb",
          "aria-hidden": "true",
          "data-state": props.state,
          "data-size": props.size,
        },
        props.state === "processing"
          ? h(SoneSpinner, { size: props.size === "sm" ? 12 : 14, label: null })
          : undefined,
      );
  },
});
