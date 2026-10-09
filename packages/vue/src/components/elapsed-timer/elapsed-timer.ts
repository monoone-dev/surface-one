import { computed, defineComponent, h, type PropType } from "vue";

import { clockTime, isoDuration } from "../../utils/format";

export type ElapsedTimerSize = "default" | "sm";

/**
 * `<sone-elapsed-timer>` — a running time (`12:04`) in tabular mono figures, as a
 * `<time>` with an ISO 8601 `datetime`. `live` = `role="timer"` (aria-live off, so a
 * screen reader reads it on demand instead of on every tick).
 */
export const SoneElapsedTimer = defineComponent({
  name: "SoneElapsedTimer",
  props: {
    seconds: { type: Number as PropType<number | null>, default: 0 },
    live: { type: Boolean, default: false },
    size: { type: String as PropType<ElapsedTimerSize>, default: "default" },
    ariaLabel: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    const label = computed(() => clockTime(props.seconds));
    const datetime = computed(() => isoDuration(props.seconds));
    return () =>
      h(
        "sone-elapsed-timer",
        {
          "data-slot": "elapsed-timer",
          "data-size": props.size,
          role: props.live ? "timer" : undefined,
          "aria-label": props.live ? (props.ariaLabel ?? undefined) : undefined,
        },
        h("time", { datetime: datetime.value }, label.value),
      );
  },
});
