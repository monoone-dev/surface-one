import {
  defineComponent,
  h,
  onMounted,
  onUpdated,
  shallowRef,
  type PropType,
} from "vue";

import { useModel } from "../../utils/model";
import { splitAttrs } from "../../utils/part";

export type NativeSelectSize = "default" | "sm";

/** `<sone-select>` — a styled native `<select>`; `<option>`s go in the slot, `v-model` (a string). */
export const SoneSelect = defineComponent({
  name: "SoneSelect",
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
    size: { type: String as PropType<NativeSelectSize>, default: "default" },
    selectId: { type: String as PropType<string | null>, default: null },
    name: { type: String as PropType<string | null>, default: null },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    invalid: { type: Boolean, default: false },
  },
  emits: { "update:modelValue": (_value: string) => true },
  setup(props, { emit, attrs, slots }) {
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const el = shallowRef<HTMLSelectElement | null>(null);
    // Re-asserts the value when late-rendered options made the <select> drift to its
    // first option; a value with no matching option is left alone.
    const sync = (): void => {
      const select = el.value;
      if (!select || select.value === value.value) return;
      if (Array.from(select.options).some((o) => o.value === value.value))
        select.value = value.value;
    };
    onMounted(sync);
    onUpdated(sync);
    return () => {
      const { host, control } = splitAttrs(attrs);
      return h(
        "sone-select",
        {
          ...host,
          "data-slot": "native-select-wrapper",
          "data-size": props.size,
          "data-disabled": props.disabled ? "true" : undefined,
        },
        h(
          "select",
          {
            ...control,
            ref: el,
            "data-slot": "native-select",
            value: value.value,
            disabled: props.disabled,
            id: props.selectId ?? undefined,
            name: props.name ?? undefined,
            "data-size": props.size,
            "aria-label": props.ariaLabel ?? undefined,
            "aria-invalid": props.invalid ? "true" : undefined,
            onChange: (e: Event) =>
              value.set((e.target as HTMLSelectElement).value),
          },
          slots.default?.(),
        ),
      );
    };
  },
});
