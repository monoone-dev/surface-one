import { defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { SoneElapsedTimer } from "../elapsed-timer/elapsed-timer";
import { SoneStatusOrb } from "../status-orb/status-orb";

export type RecordingIndicatorState = "live" | "paused";
export type RecordingIndicatorSize = "default" | "sm";

/**
 * `<sone-recording-indicator>` — "a recording is running": the live (or paused) status
 * orb, the elapsed timer and an optional label, in one row.
 */
export const SoneRecordingIndicator = defineComponent({
  name: "SoneRecordingIndicator",
  props: {
    /** Elapsed whole seconds. */
    seconds: { type: Number as PropType<number | null>, default: 0 },
    /** Visible text after the timer ("Recording"); `null` = none. */
    label: { type: String as PropType<string | null>, default: null },
    state: {
      type: String as PropType<RecordingIndicatorState>,
      default: "live",
    },
    size: {
      type: String as PropType<RecordingIndicatorSize>,
      default: "default",
    },
    /** The timer's accessible name (default: the "Recording time" message). */
    timerLabel: { type: String as PropType<string>, default: undefined },
  },
  setup(props) {
    const messages = useSoneMessages();
    return () =>
      h(
        "sone-recording-indicator",
        {
          "data-slot": "recording-indicator",
          "data-state": props.state,
          "data-size": props.size,
        },
        [
          h(SoneStatusOrb, { state: props.state, size: props.size }),
          h(SoneElapsedTimer, {
            live: true,
            seconds: props.seconds,
            size: props.size,
            ariaLabel: props.timerLabel ?? messages.value.recordingTime,
          }),
          props.label
            ? h(
                "span",
                {
                  class: "recording-indicator-label",
                  "data-slot": "recording-indicator-label",
                },
                props.label,
              )
            : null,
        ],
      );
  },
});
