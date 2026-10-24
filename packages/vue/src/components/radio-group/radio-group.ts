import {
  defineComponent,
  h,
  inject,
  provide,
  useId,
  type InjectionKey,
  type PropType,
} from "vue";

import { useModel } from "../../utils/model";
import { asProp, flag, renderAs } from "../../utils/part";

export type RadioGroupOrientation = "vertical" | "horizontal";

interface RadioGroupContext {
  readonly name: () => string;
  readonly value: () => string | null;
  readonly disabled: () => boolean;
  readonly required: () => boolean;
  select(value: string): void;
}

const RADIO_GROUP: InjectionKey<RadioGroupContext> = Symbol("SoneRadioGroup");

/**
 * `[soneRadioGroup]` — a set of native radios with one value (`role="radiogroup"`):
 * `v-model` (the checked radio's value), a shared `name` (unique by default),
 * `disabled`, `required`, `orientation`. `as="fieldset"` with a `legend`, or a `div`
 * with an `aria-label`.
 */
export const SoneRadioGroup = defineComponent({
  name: "SoneRadioGroup",
  props: {
    ...asProp,
    /** The value of the checked radio, `null` while none is — `v-model`. */
    modelValue: { type: String as PropType<string | null>, default: null },
    /** The `name` every radio of the group shares; unique by default. */
    name: { type: String, default: undefined },
    /** Disables every radio of the group. */
    disabled: { type: Boolean, default: false },
    /** One of the radios must be checked (the native `required`). */
    required: { type: Boolean, default: false },
    /** Lays the radios out in a column or a row. */
    orientation: {
      type: String as PropType<RadioGroupOrientation>,
      default: "vertical",
    },
  },
  emits: { "update:modelValue": (_value: string) => true },
  setup(props, { slots, emit }) {
    const value = useModel<string | null>(
      () => props.modelValue,
      (v) => emit("update:modelValue", v as string),
    );
    const uid = `sone-radio-group-${useId()}`;
    provide(RADIO_GROUP, {
      name: () => props.name ?? uid,
      value: () => value.value,
      disabled: () => props.disabled,
      required: () => props.required,
      select: (v) => {
        if (v !== value.value) value.set(v);
      },
    });
    return () =>
      renderAs(
        props.as ?? "div",
        {
          class: "radio-group",
          "data-slot": "radio-group",
          role: "radiogroup",
          "data-orientation": props.orientation,
          "data-disabled": flag(props.disabled),
          "aria-disabled": props.disabled ? "true" : undefined,
          "aria-required": props.required ? "true" : undefined,
        },
        slots,
      );
  },
});

/**
 * `input[soneRadio]` — one native radio of a `SoneRadioGroup`: it takes the group's
 * `name`, is checked while its `value` is the group's, and checks it when picked.
 * Attributes (`id`, `aria-label`) and listeners fall through to the `<input>`.
 */
export const SoneRadio = defineComponent({
  name: "SoneRadio",
  props: {
    /** What the group's value becomes when this radio is checked. */
    value: { type: String, default: "" },
    /** Disables this radio alone. */
    disabled: { type: Boolean, default: false },
  },
  setup(props) {
    const group = inject(RADIO_GROUP, null);
    return () =>
      h("input", {
        type: "radio",
        "data-slot": "radio",
        name: group?.name(),
        value: props.value,
        checked: group ? group.value() === props.value : undefined,
        disabled: props.disabled || !!group?.disabled(),
        required: group?.required() || undefined,
        onChange: () => group?.select(props.value),
      });
  },
});
