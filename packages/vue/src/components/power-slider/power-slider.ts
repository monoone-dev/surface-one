import { computed, defineComponent, h, ref, watch, type PropType } from "vue";

import { flag } from "../../utils/part";

export interface PowerRung {
  id: string;
  name: string;
}

/**
 * `<sone-power-slider>` — a stepped range over named rungs ("Battery saver" … "Maximum"),
 * bound with `v-model` to the rung's `id`. Dragging only previews; the value commits once,
 * on release, a key or Page Up / Page Down — so dragging past the end never stores every
 * rung on the way.
 */
export const SonePowerSlider = defineComponent({
  name: "SonePowerSlider",
  props: {
    rungs: { type: Array as PropType<readonly PowerRung[]>, default: () => [] },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    /** The committed rung's `id` (`v-model`). */
    modelValue: { type: String, default: "" },
    disabled: { type: Boolean, default: false },
  },
  emits: { "update:modelValue": (_id: string) => true },
  setup(props, { emit }) {
    const input = ref<HTMLInputElement | null>(null);
    const committed = ref(props.modelValue);
    watch(
      () => props.modelValue,
      (v) => (committed.value = v),
    );
    const preview = ref<number | null>(null);

    const maxIndex = computed(() => Math.max(0, props.rungs.length - 1));
    const committedIndex = computed(() =>
      props.rungs.findIndex((r) => r.id === committed.value),
    );
    const offLadder = computed(() => committedIndex.value < 0);
    const activeIndex = computed(() =>
      preview.value !== null
        ? preview.value
        : Math.max(0, committedIndex.value),
    );
    const fillFraction = computed(() =>
      maxIndex.value <= 0 ? 1 : activeIndex.value / maxIndex.value,
    );

    // Disabling mid-drag leaves `activeIndex` where it was (preview N → commit N), so
    // the `value` binding never touches the element: write the committed rung back.
    watch(
      () => props.disabled,
      (disabled) => {
        if (!disabled) return;
        preview.value = null;
        if (input.value) {
          input.value.value = String(Math.max(0, committedIndex.value));
        }
      },
    );

    const clamp = (index: number): number =>
      Number.isFinite(index)
        ? Math.min(Math.max(Math.round(index), 0), maxIndex.value)
        : 0;
    const commit = (index: number): void => {
      const rung = props.rungs[index];
      preview.value = null;
      if (!rung) return;
      committed.value = rung.id;
      emit("update:modelValue", rung.id);
    };
    const onKeydown = (e: KeyboardEvent): void => {
      if (props.disabled) return;
      const step = e.key === "PageUp" ? 1 : e.key === "PageDown" ? -1 : 0;
      if (step === 0) return;
      e.preventDefault();
      commit(clamp(activeIndex.value + step));
    };

    return () =>
      h(
        "sone-power-slider",
        {
          "data-slot": "power-slider",
          "data-orientation": "horizontal",
          "data-disabled": flag(props.disabled),
        },
        h(
          "div",
          { class: { "ps-wrap": true, "is-disabled": props.disabled } },
          [
            h(
              "div",
              {
                class: "ps-track",
                "data-slot": "power-slider-track",
                "aria-hidden": "true",
              },
              [
                h("span", {
                  class: "ps-fill",
                  "data-slot": "power-slider-range",
                  style: { "--ps-frac": fillFraction.value },
                }),
                ...props.rungs.map((r, i) =>
                  h("span", {
                    key: r.id,
                    class: {
                      "ps-notch": true,
                      "is-reached": i <= activeIndex.value && !offLadder.value,
                    },
                    style: {
                      "--ps-frac": maxIndex.value > 0 ? i / maxIndex.value : 0,
                    },
                  }),
                ),
              ],
            ),
            h("input", {
              ref: input,
              class: "sone-range ps-input",
              "data-slot": "power-slider-thumb",
              type: "range",
              min: "0",
              step: "1",
              max: maxIndex.value,
              value: activeIndex.value,
              disabled: props.disabled,
              "aria-label": props.ariaLabel ?? undefined,
              "aria-valuetext": props.rungs[activeIndex.value]?.name ?? "",
              onInput: (e: Event) => {
                preview.value = clamp(
                  Number((e.target as HTMLInputElement).value),
                );
              },
              onChange: (e: Event) =>
                commit(clamp(Number((e.target as HTMLInputElement).value))),
              onKeydown,
            }),
            h(
              "div",
              {
                class: "ps-labels",
                "data-slot": "power-slider-labels",
                "aria-hidden": "true",
              },
              props.rungs.map((r, i) =>
                h(
                  "span",
                  {
                    key: r.id,
                    class: {
                      "ps-label": true,
                      "is-active": i === activeIndex.value && !offLadder.value,
                    },
                  },
                  r.name,
                ),
              ),
            ),
          ],
        ),
      );
  },
});
