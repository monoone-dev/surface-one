import { defineComponent, h, type PropType } from "vue";

import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";

export type SwitchSize = "default" | "sm";

// Intentionally still a native checkbox, not `role="switch"` — as in @surface-one/angular.
/** `<sone-switch>` — an on / off checkbox; `v-model` (a boolean). */
export const SoneSwitch = defineComponent({
  name: "SoneSwitch",
  inheritAttrs: false,
  props: {
    modelValue: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<SwitchSize>, default: "default" },
    inputId: { type: String as PropType<string | null>, default: null },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    invalid: { type: Boolean, default: false },
  },
  emits: { "update:modelValue": (_value: boolean) => true },
  setup(props, { emit, attrs }) {
    const checked = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    return () => {
      const { host, control } = splitAttrs(attrs);
      return h(
        "sone-switch",
        host,
        h("input", {
          ...control,
          class: "switch",
          type: "checkbox",
          "data-slot": "switch",
          checked: checked.value,
          disabled: props.disabled,
          id: props.inputId ?? undefined,
          "data-size": props.size,
          "data-state": checked.value ? "checked" : "unchecked",
          "aria-invalid": props.invalid ? "true" : undefined,
          "aria-label": props.ariaLabel ?? undefined,
          onChange: (e: Event) =>
            checked.set((e.target as HTMLInputElement).checked),
        }),
      );
    };
  },
});
