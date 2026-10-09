import { computed, defineComponent, h, type PropType, type VNode } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";

/** One step of a `SoneStepper`. `key` must be unique. */
export interface SoneStep {
  readonly key: string;
  readonly label: string;
  readonly description?: string;
  /** This step can never be clicked. */
  readonly disabled?: boolean;
}

export type StepperVariant = "dots" | "numbered";
export type StepperOrientation = "horizontal" | "vertical";
export type StepState = "completed" | "active" | "inactive";

/** What `@step-click` emits: the clicked step and its index. */
export interface SoneStepClick {
  readonly index: number;
  readonly step: SoneStep;
}

const CHECK = () =>
  h("svg", { viewBox: "0 0 20 20", fill: "none" }, [
    h("path", {
      d: "m4.5 10 3.4 3.4 7.6-7.6",
      stroke: "currentColor",
      "stroke-width": "1.75",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    }),
  ]);

/**
 * `<sone-stepper>` — progress through a multi-step flow; `v-model:current` is the
 * active step's index (as in @surface-one/angular).
 */
export const SoneStepper = defineComponent({
  name: "SoneStepper",
  props: {
    steps: { type: Array as PropType<readonly SoneStep[]>, default: () => [] },
    current: { type: Number, default: 0 },
    variant: { type: String as PropType<StepperVariant>, default: "dots" },
    orientation: {
      type: String as PropType<StepperOrientation>,
      default: "horizontal",
    },
    linear: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    showCount: { type: Boolean, default: true },
    /** The group's accessible name (default: the "Progress" message). */
    ariaLabel: { type: String as PropType<string | null>, default: undefined },
  },
  emits: {
    "update:current": (_index: number) => true,
    stepClick: (_click: SoneStepClick) => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const current = useModel(
      () => props.current,
      (v) => emit("update:current", v),
    );
    const index = computed(() => {
      const n = props.steps.length;
      const c = Math.trunc(current.value);
      if (n === 0 || !Number.isFinite(c)) return 0;
      return Math.min(Math.max(c, 0), n - 1);
    });
    const stateOf = (i: number): StepState =>
      i < index.value ? "completed" : i === index.value ? "active" : "inactive";
    const canGo = (i: number): boolean => {
      const step = props.steps[i];
      if (!step || step.disabled || props.disabled) return false;
      return !props.linear || i <= index.value;
    };
    const go = (i: number): void => {
      if (!canGo(i)) return;
      current.set(i);
      emit("stepClick", { index: i, step: props.steps[i]! });
    };

    const body = (step: SoneStep, i: number): VNode[] => [
      h(
        "span",
        {
          class: "stepper-indicator",
          "data-slot": "stepper-indicator",
          "aria-hidden": "true",
        },
        props.variant === "numbered"
          ? stateOf(i) === "completed"
            ? [CHECK()]
            : String(i + 1)
          : undefined,
      ),
      h(
        "span",
        {
          class: ["stepper-text", { "sr-only": props.variant === "dots" }],
          "data-slot": "stepper-text",
        },
        [
          h(
            "span",
            { class: "stepper-title", "data-slot": "stepper-title" },
            step.label,
          ),
          step.description
            ? h(
                "span",
                {
                  class: "stepper-description",
                  "data-slot": "stepper-description",
                },
                step.description,
              )
            : null,
        ],
      ),
    ];

    return () => {
      const interactive = !props.disabled;
      const last = props.steps.length - 1;
      return h(
        "sone-stepper",
        {
          role: "group",
          "data-slot": "stepper",
          "data-variant": props.variant,
          "data-orientation": props.orientation,
          "data-interactive": interactive ? "" : undefined,
          "aria-label":
            props.ariaLabel === undefined
              ? messages.value.stepperLabel
              : (props.ariaLabel ?? undefined),
        },
        [
          h(
            "ol",
            { class: "stepper-list", "data-slot": "stepper-list" },
            props.steps.map((step, i) =>
              h(
                "li",
                {
                  key: step.key,
                  class: "stepper-item",
                  "data-slot": "stepper-item",
                  "data-state": stateOf(i),
                },
                [
                  interactive
                    ? h(
                        "button",
                        {
                          type: "button",
                          class: "stepper-trigger",
                          "data-slot": "stepper-trigger",
                          disabled: !canGo(i),
                          "aria-current":
                            i === index.value ? "step" : undefined,
                          onClick: () => go(i),
                        },
                        body(step, i),
                      )
                    : h(
                        "span",
                        {
                          class: "stepper-trigger",
                          "data-slot": "stepper-trigger",
                          "aria-current":
                            i === index.value ? "step" : undefined,
                        },
                        body(step, i),
                      ),
                  props.variant === "numbered" && i < last
                    ? h("span", {
                        class: "stepper-separator",
                        "data-slot": "stepper-separator",
                        "aria-hidden": "true",
                      })
                    : null,
                ],
              ),
            ),
          ),
          props.showCount && props.steps.length > 0
            ? h(
                "span",
                { class: "stepper-count", "data-slot": "stepper-count" },
                messages.value.stepCount(index.value + 1, props.steps.length),
              )
            : null,
        ],
      );
    };
  },
});
