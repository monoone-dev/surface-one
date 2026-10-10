import { computed, defineComponent, h, ref, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

export type InputNumberSize = "sm" | "default";

/**
 * `<sone-input-number>` — a number field with − and + buttons, a WAI-ARIA spinbutton
 * (↑ / ↓, Page Up / Down, Home / End); `v-model` (`number | null`).
 */
export const SoneInputNumber = defineComponent({
  name: "SoneInputNumber",
  props: {
    modelValue: {
      type: Number as PropType<number | null>,
      default: null,
    },
    min: { type: Number as PropType<number | null>, default: null },
    max: { type: Number as PropType<number | null>, default: null },
    step: { type: Number, default: 1 },
    size: { type: String as PropType<InputNumberSize>, default: "default" },
    placeholder: { type: String, default: "" },
    inputId: { type: String as PropType<string | null>, default: null },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    disabled: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    decrementLabel: { type: String as PropType<string | null>, default: null },
    incrementLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:modelValue": (_value: number | null) => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const draft = ref<string | null>(null);

    const text = computed(() =>
      draft.value !== null
        ? draft.value
        : value.value === null
          ? ""
          : String(value.value),
    );
    const atMin = computed(
      () =>
        value.value !== null && props.min !== null && value.value <= props.min,
    );
    const atMax = computed(
      () =>
        value.value !== null && props.max !== null && value.value >= props.max,
    );

    const clamp = (n: number): number => {
      let v = n;
      if (props.min !== null) v = Math.max(v, props.min);
      if (props.max !== null) v = Math.min(v, props.max);
      const decimals = (String(props.step).split(".")[1] ?? "").length;
      return Number(v.toFixed(decimals));
    };
    const commit = (v: number | null) => {
      draft.value = null;
      if (v !== value.value) value.set(v);
    };
    const stepBy = (times: number) => {
      if (props.disabled) return;
      commit(clamp((value.value ?? props.min ?? 0) + props.step * times));
    };
    const parseDraft = () => {
      if (draft.value === null) return;
      const trimmed = draft.value.trim().replace(",", ".");
      const n = Number(trimmed);
      if (trimmed === "") commit(null);
      else if (Number.isFinite(n)) commit(clamp(n));
      draft.value = null;
    };
    const onKeydown = (e: KeyboardEvent) => {
      const keys: Record<string, () => void> = {
        ArrowUp: () => stepBy(1),
        ArrowDown: () => stepBy(-1),
        PageUp: () => stepBy(10),
        PageDown: () => stepBy(-10),
        Home: () => props.min !== null && commit(props.min),
        End: () => props.max !== null && commit(props.max),
        Enter: parseDraft,
      };
      const run = keys[e.key];
      if (!run) return;
      if (e.key !== "Enter") e.preventDefault();
      run();
    };

    const stepButton = (dir: -1 | 1) =>
      h(
        SoneButton,
        {
          class: "input-number-step",
          variant: "ghost",
          size: props.size === "sm" ? "icon-xs" : "icon-sm",
          type: "button",
          tabindex: "-1",
          "data-slot":
            dir < 0 ? "input-number-decrement" : "input-number-increment",
          "aria-label":
            dir < 0
              ? (props.decrementLabel ?? messages.value.decrease)
              : (props.incrementLabel ?? messages.value.increase),
          "aria-controls": props.inputId ?? undefined,
          disabled: props.disabled || (dir < 0 ? atMin.value : atMax.value),
          onClick: () => stepBy(dir),
        },
        () => h(SoneIcon, { icon: dir < 0 ? "minus" : "plus" }),
      );

    return () =>
      h(
        "sone-input-number",
        {
          "data-slot": "input-number",
          "data-size": props.size,
          "data-invalid": props.invalid ? "true" : undefined,
          "data-disabled": props.disabled ? "true" : undefined,
        },
        [
          stepButton(-1),
          h("input", {
            class: "input-number-field",
            "data-slot": "input-number-field",
            type: "text",
            inputmode: "decimal",
            autocomplete: "off",
            role: "spinbutton",
            id: props.inputId ?? undefined,
            "aria-label": props.ariaLabel ?? undefined,
            "aria-valuenow": value.value ?? undefined,
            "aria-valuemin": props.min ?? undefined,
            "aria-valuemax": props.max ?? undefined,
            "aria-invalid": props.invalid ? "true" : undefined,
            placeholder: props.placeholder,
            value: text.value,
            disabled: props.disabled,
            onInput: (e: Event) =>
              (draft.value = (e.target as HTMLInputElement).value),
            onKeydown,
            onBlur: parseDraft,
          }),
          stepButton(1),
        ],
      );
  },
});
