import { computed, defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";

/**
 * `<sone-meter>` — a relative rating in pips (at most 10). Not a progress bar: it
 * announces a sentence ("Accuracy: 3 of 4") instead of a percentage.
 */
export const SoneMeter = defineComponent({
  name: "SoneMeter",
  props: {
    label: { type: String, default: "" },
    value: { type: Number, default: 0 },
    max: { type: Number, default: 4 },
    detail: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    const messages = useSoneMessages();
    const pips = computed(() => {
      const n = Number.isFinite(props.max) ? Math.round(props.max) : 0;
      return Math.min(Math.max(n, 0), 10);
    });
    const filled = computed(() =>
      Number.isFinite(props.value)
        ? Math.min(Math.max(Math.round(props.value), 0), pips.value)
        : 0,
    );
    const ariaText = computed(() => {
      const count = messages.value.meterCount(filled.value, pips.value);
      const label = props.label.trim();
      const base = label ? `${label}: ${count}` : count;
      return props.detail ? `${base}. ${props.detail}` : base;
    });
    return () =>
      h(
        "sone-meter",
        { role: "img", "data-slot": "meter", "aria-label": ariaText.value },
        [
          props.label
            ? h(
                "span",
                { class: "meter-label", "data-slot": "meter-label" },
                props.label,
              )
            : null,
          h(
            "span",
            {
              class: "meter-pips",
              "data-slot": "meter-track",
              "aria-hidden": "true",
            },
            Array.from({ length: pips.value }, (_, i) =>
              h("span", {
                key: i,
                class: ["meter-pip", { "is-on": i < filled.value }],
                "data-slot": "meter-indicator",
                "data-state": i < filled.value ? "on" : "off",
              }),
            ),
          ),
          props.detail
            ? h(
                "span",
                { class: "meter-detail", "data-slot": "meter-value" },
                props.detail,
              )
            : null,
        ],
      );
  },
});
