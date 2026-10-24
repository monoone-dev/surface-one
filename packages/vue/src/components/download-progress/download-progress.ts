import { computed, defineComponent, h, type PropType } from "vue";

import { pct, type SoneProgressSize } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneButton } from "../button/button";
import { SoneProgress } from "../progress/progress";
import { SoneSpinner } from "../spinner/spinner";

/**
 * `<sone-download-progress>` — a progress bar with a caption ("Downloading… 42%") in a
 * `role="status"` region, a spinner while the share is unknown, and an optional cancel
 * button (`cancelRequested`). `frac` is 0..1, `null` = indeterminate.
 */
export const SoneDownloadProgress = defineComponent({
  name: "SoneDownloadProgress",
  props: {
    frac: { type: Number as PropType<number | null>, default: null },
    /** The caption (default: the "Downloading…" message); `""` shows the percentage alone. */
    label: { type: String as PropType<string>, default: undefined },
    /** Between the label and the percentage. */
    separator: { type: String, default: " " },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    size: { type: String as PropType<SoneProgressSize>, default: "sm" },
    cancellable: { type: Boolean, default: false },
    /** The cancel button's text (default: the "Cancel download" message). */
    cancelLabel: { type: String as PropType<string>, default: undefined },
  },
  emits: { cancelRequested: () => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const label = computed(
      () => props.label ?? messages.value.downloadProgressLabel,
    );
    const value = computed(() =>
      props.frac === null || props.frac === undefined ? null : props.frac * 100,
    );
    const percent = computed(() => {
      const f = props.frac;
      if (f === null || f === undefined || !Number.isFinite(f)) return null;
      return f > 0 || !label.value ? pct(f) : null;
    });
    const caption = computed(() => {
      if (!percent.value) return label.value;
      return label.value
        ? `${label.value}${props.separator}${percent.value}`
        : percent.value;
    });
    const state = computed(() => {
      const f = props.frac;
      if (f === null || f === undefined) return "indeterminate";
      return f >= 1 ? "complete" : "loading";
    });
    return () =>
      h(
        "sone-download-progress",
        {
          "data-slot": "download-progress",
          "data-state": state.value,
          "data-size": props.size,
        },
        [
          h(
            "div",
            {
              class: "body",
              "data-slot": "download-progress-body",
              role: "status",
            },
            [
              h(SoneProgress, {
                value: value.value,
                size: props.size,
                ariaLabel: props.ariaLabel,
              }),
              h(
                "span",
                { class: "caption", "data-slot": "download-progress-label" },
                [
                  percent.value
                    ? null
                    : h(SoneSpinner, { size: 16, label: null }),
                  caption.value,
                ],
              ),
            ],
          ),
          props.cancellable
            ? h(
                SoneButton,
                {
                  variant: "ghost",
                  type: "button",
                  onClick: () => emit("cancelRequested"),
                },
                () =>
                  props.cancelLabel ?? messages.value.downloadProgressCancel,
              )
            : null,
        ],
      );
  },
});
