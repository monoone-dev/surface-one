import { computed, defineComponent, h, type PropType } from "vue";

export type SoneProgressSize = "sm" | "md";
export type SoneProgressTone = "default" | "warning" | "destructive";
export type SoneProgressLabelFn = (value: number, max: number) => string;

const defaultValueLabel: SoneProgressLabelFn = (value, max) =>
  `${Math.round((value / max) * 100)}%`;

/** `<sone-progress>` — a `progressbar`; `value` `null` (the default) is indeterminate. */
export const SoneProgress = defineComponent({
  name: "SoneProgress",
  props: {
    value: { type: Number as PropType<number | null>, default: null },
    max: { type: Number, default: 100 },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    size: { type: String as PropType<SoneProgressSize>, default: "sm" },
    tone: { type: String as PropType<SoneProgressTone>, default: "default" },
    valueLabel: {
      type: Function as PropType<SoneProgressLabelFn>,
      default: defaultValueLabel,
    },
  },
  setup(props) {
    const indeterminate = computed(
      () => props.value === null || props.value === undefined,
    );
    const valueNow = computed(() => {
      const raw = props.value;
      if (raw === null || !Number.isFinite(raw)) return 0;
      return Math.min(Math.max(raw, 0), Math.max(props.max, 0));
    });
    const fillPct = computed(() =>
      !Number.isFinite(props.max) || props.max <= 0
        ? 0
        : (valueNow.value / props.max) * 100,
    );
    const state = computed(() =>
      indeterminate.value
        ? "indeterminate"
        : fillPct.value >= 100
          ? "complete"
          : "loading",
    );
    const valueText = computed(() =>
      indeterminate.value || !Number.isFinite(props.max) || props.max <= 0
        ? undefined
        : props.valueLabel(valueNow.value, props.max),
    );
    return () =>
      h(
        "sone-progress",
        {
          role: "progressbar",
          "data-slot": "progress",
          "data-state": state.value,
          "data-size": props.size,
          "data-tone": props.tone,
          "data-value": indeterminate.value ? undefined : valueNow.value,
          "data-max": props.max,
          "aria-label": props.ariaLabel ?? undefined,
          "aria-valuemin": 0,
          "aria-valuemax": props.max,
          // Indeterminate MUST NOT carry aria-valuenow — its absence is the signal.
          "aria-valuenow": indeterminate.value ? undefined : valueNow.value,
          "aria-valuetext": valueText.value,
        },
        indeterminate.value
          ? h("div", { class: "fill fill--indeterminate" })
          : h("div", {
              class: "fill",
              style: { "--_progress-pct": fillPct.value },
            }),
      );
  },
});
