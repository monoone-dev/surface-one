import { defineComponent, h, onMounted, ref, watch } from "vue";

import { useModel } from "../../utils/model";

/**
 * `input[soneCheckbox]` — the native checkbox, the Vue twin of the Angular directive:
 * `v-model` (a boolean) and `v-model:indeterminate` (the mixed state, cleared when the
 * user toggles it). Every attribute (`id`, `name`, `disabled`, `aria-invalid`) and
 * listener falls through to the `<input>`, so a `<label for>` or a `SoneField` pairs it.
 */
export const SoneCheckbox = defineComponent({
  name: "SoneCheckbox",
  props: {
    /** Checked or not — `v-model`. */
    modelValue: { type: Boolean, default: false },
    /** The mixed state ("some of them") — `v-model:indeterminate`; a click clears it. */
    indeterminate: { type: Boolean, default: false },
  },
  emits: {
    "update:modelValue": (_checked: boolean) => true,
    "update:indeterminate": (_indeterminate: boolean) => true,
  },
  setup(props, { emit }) {
    const checked = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const mixed = useModel(
      () => props.indeterminate,
      (v) => emit("update:indeterminate", v),
    );
    const el = ref<HTMLInputElement | null>(null);
    // A DOM property only (no attribute), so it is set in the browser once mounted.
    const sync = (): void => {
      if (el.value) el.value.indeterminate = mixed.value;
    };
    onMounted(() => {
      sync();
      watch(mixed, sync, { flush: "post" });
    });
    return () =>
      h("input", {
        ref: el,
        type: "checkbox",
        "data-slot": "checkbox",
        checked: checked.value,
        onChange: (event: Event) => {
          checked.set((event.target as HTMLInputElement).checked);
          if (mixed.value) mixed.set(false);
          sync();
        },
      });
  },
});
