import { computed, defineComponent, h, type PropType } from "vue";

import { processingStageLabel } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneProgress } from "../progress/progress";
import { SoneStatusOrb } from "../status-orb/status-orb";

export type ProcessingStatusSize = "default" | "sm";

/**
 * `<sone-processing-status>` — where a recording is in the pipeline: the processing
 * orb, the stage label and a thin `SoneProgress`. A polite live region
 * (`role="status"`), so a stage change is announced once.
 */
export const SoneProcessingStatus = defineComponent({
  name: "SoneProcessingStatus",
  props: {
    /** `recording`, `transcribing`, `summarizing`, `exporting`, `saved`, `finalized`, `done`, `error` or your own. */
    stage: { type: String, default: "transcribing" },
    /** Overrides for the built-in stage labels; an unknown stage shows itself capitalised. */
    labels: {
      type: Object as PropType<Partial<Record<string, string>>>,
      default: () => ({}),
    },
    /** A live detail that replaces the stage label while it is non-empty. */
    message: { type: String as PropType<string | null>, default: null },
    /** 0..1; `null` = indeterminate. */
    progress: { type: Number as PropType<number | null>, default: null },
    /** Draw the progress track (off for a compact row status). */
    showProgress: { type: Boolean, default: true },
    size: {
      type: String as PropType<ProcessingStatusSize>,
      default: "default",
    },
  },
  setup(props) {
    const messages = useSoneMessages();
    const text = computed(
      () =>
        props.message?.trim() ||
        (props.labels[props.stage] ??
          messages.value.processingStage(props.stage) ??
          processingStageLabel(props.stage)),
    );
    const failed = computed(() => props.stage === "error");
    const value = computed(() => {
      const p = props.progress;
      return p === null || p === undefined || !Number.isFinite(p)
        ? null
        : Math.min(1, Math.max(0, p)) * 100;
    });
    return () =>
      h(
        "sone-processing-status",
        {
          role: "status",
          "data-slot": "processing-status",
          "data-stage": props.stage,
          "data-size": props.size,
        },
        [
          h(SoneStatusOrb, {
            state: failed.value ? "error" : "processing",
            size: props.size,
          }),
          h(
            "span",
            {
              class: "processing-status-label",
              "data-slot": "processing-status-label",
            },
            text.value,
          ),
          props.showProgress && !failed.value
            ? h(SoneProgress, {
                class: "processing-status-track",
                value: value.value,
                ariaLabel: text.value,
              })
            : null,
        ],
      );
  },
});
