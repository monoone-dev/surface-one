import { computed, defineComponent, h, ref, useId, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";

export type RatingSize = "sm" | "default" | "lg";

/** The star outline, 24 × 24 — the same path as @surface-one/angular. */
const STAR =
  "M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z";

const glyph = (fill: number) =>
  h(
    "span",
    {
      class: "rating-glyph",
      style: { "--rating-fill": String(fill) },
      "aria-hidden": "true",
    },
    [
      h("svg", { class: "rating-base", viewBox: "0 0 24 24" }, [
        h("path", { d: STAR }),
      ]),
      h("svg", { class: "rating-fill", viewBox: "0 0 24 24" }, [
        h("path", { d: STAR }),
      ]),
    ],
  );

/**
 * `<sone-rating>` — stars for a score. `readonly`: one image named "4.5 out of 5";
 * otherwise a native radio group; `v-model` (a number, 0 = no rating).
 */
export const SoneRating = defineComponent({
  name: "SoneRating",
  props: {
    modelValue: { type: Number, default: 0 },
    max: { type: Number, default: 5 },
    size: { type: String as PropType<RatingSize>, default: "default" },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    clearable: { type: Boolean, default: false },
    ariaLabel: { type: String as PropType<string | null>, default: null },
  },
  emits: { "update:modelValue": (_value: number) => true },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const value = useModel(
      () => props.modelValue,
      (v) => emit("update:modelValue", v),
    );
    const hover = ref<number | null>(null);
    // useId, not a module counter: the server and the client must agree on the name.
    const name = `sone-rating-${useId()}`;

    const stars = computed(() => {
      const max = Math.max(1, Math.round(props.max));
      const shown = props.readonly ? value.value : (hover.value ?? value.value);
      return Array.from({ length: max }, (_, i) => ({
        value: i + 1,
        fill: Math.min(Math.max(shown - i, 0), 1),
      }));
    });

    const select = (n: number) => {
      if (props.disabled || props.readonly) return;
      value.set(props.clearable && n === value.value ? 0 : n);
    };
    const preview = (n: number | null) => {
      if (!props.disabled && !props.readonly) hover.value = n;
    };

    return () => {
      const host = {
        "data-slot": "rating",
        "data-size": props.size,
        "data-readonly": props.readonly ? "" : undefined,
        "data-disabled": props.disabled ? "" : undefined,
      };
      if (props.readonly) {
        const score = Math.round(value.value * 10) / 10;
        const text = messages.value.ratingSummary(score, props.max);
        return h(
          "sone-rating",
          host,
          h(
            "span",
            {
              class: "rating-stars",
              role: "img",
              "aria-label": props.ariaLabel
                ? `${props.ariaLabel}: ${text}`
                : text,
            },
            stars.value.map((s) => glyph(s.fill)),
          ),
        );
      }
      return h(
        "sone-rating",
        host,
        h(
          "div",
          {
            class: "rating-stars",
            role: "radiogroup",
            "aria-label": props.ariaLabel ?? messages.value.ratingLabel,
            onMouseleave: () => preview(null),
          },
          stars.value.map((s) =>
            h(
              "label",
              {
                key: s.value,
                class: "rating-star",
                onMouseenter: () => preview(s.value),
              },
              [
                h("input", {
                  class: "rating-input",
                  type: "radio",
                  name,
                  value: s.value,
                  checked: value.value === s.value,
                  disabled: props.disabled,
                  onChange: () => select(s.value),
                  onClick: () => {
                    if (props.clearable && s.value === value.value)
                      select(s.value);
                  },
                }),
                h(
                  "span",
                  { class: "sr-only" },
                  messages.value.ratingStar(s.value),
                ),
                glyph(s.fill),
              ],
            ),
          ),
        ),
      );
    };
  },
});
