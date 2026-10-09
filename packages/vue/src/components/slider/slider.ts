import { computed, defineComponent, h, type PropType } from "vue";

import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";

/** `<sone-slider>` — a styled native range input; `v-model` (a number). */
export const SoneSlider = defineComponent({
  name: "SoneSlider",
  inheritAttrs: false,
  props: {
    modelValue: { type: Number, default: 0 },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    disabled: { type: Boolean, default: false },
    ariaLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:modelValue": (_value: number) => true },
  setup(props, { emit, attrs }) {
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const fill = computed(() => {
      const span = props.max - props.min;
      if (!Number.isFinite(span) || span <= 0) return "0%";
      const frac = (value.value - props.min) / span;
      return `${Math.min(Math.max(Number.isFinite(frac) ? frac : 0, 0), 1) * 100}%`;
    });
    return () => {
      const { host, control } = splitAttrs(attrs);
      return h(
        "sone-slider",
        {
          ...host,
          "data-slot": "slider",
          "data-orientation": "horizontal",
          "data-disabled": props.disabled ? "" : undefined,
        },
        h("input", {
          ...control,
          class: "sone-range",
          style: { "--sone-range-fill": fill.value },
          type: "range",
          "data-slot": "slider-thumb",
          min: props.min,
          max: props.max,
          step: props.step,
          value: value.value,
          disabled: props.disabled,
          "aria-label": props.ariaLabel ?? undefined,
          onInput: (e: Event) =>
            value.set(Number((e.target as HTMLInputElement).value)),
        }),
      );
    };
  },
});
