import { computed, defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { chartColor, chartTone, formatChartNumber } from "../../utils/chart";
import { useModel } from "../../utils/model";

export type SoneSwatchShape = "dot" | "square" | "line";
export type SoneChartLegendOrientation = "row" | "column";

export interface SoneChartLegendItem {
  key: string;
  label: string;
  tone?: string;
  value?: string | number | null;
}

const swatch = (tone: string | null | undefined, shape: SoneSwatchShape) => {
  const color = chartColor(tone);
  return h("span", {
    "data-slot": "chart-swatch",
    "aria-hidden": "true",
    "data-shape": shape,
    style: color ? { "--swatch-color": color } : undefined,
  });
};

/**
 * `<span data-slot="chart-swatch">` — the colour key of a series. Decorative;
 * `tone` is a token suffix (`chart-3`), a custom property (`--brand`) or a colour.
 */
export const SoneSwatch = defineComponent({
  name: "SoneSwatch",
  props: {
    tone: { type: String as PropType<string | null>, default: "" },
    shape: { type: String as PropType<SoneSwatchShape>, default: "dot" },
  },
  setup(props) {
    return () => swatch(props.tone, props.shape);
  },
});

/**
 * `<sone-chart-legend>` — swatch, label and value per series. `toggleable` makes
 * each item an `aria-pressed` toggle that updates `v-model:hidden` and emits
 * `toggle` with the key.
 */
export const SoneChartLegend = defineComponent({
  name: "SoneChartLegend",
  props: {
    items: {
      type: Array as PropType<readonly SoneChartLegendItem[]>,
      default: () => [],
    },
    orientation: {
      type: String as PropType<SoneChartLegendOrientation>,
      default: "row",
    },
    toggleable: { type: Boolean, default: false },
    hidden: { type: Array as PropType<readonly string[]>, default: () => [] },
    shape: { type: String as PropType<SoneSwatchShape>, default: "dot" },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    locale: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    "update:hidden": (_: readonly string[]) => true,
    toggle: (_: string) => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const hidden = useModel(
      () => props.hidden,
      (v) => emit("update:hidden", v),
    );
    const rows = computed(() => {
      const off = new Set(hidden.value);
      const locale = props.locale || messages.value.numberLocale;
      return props.items.map((item, i) => ({
        key: item.key,
        label: item.label,
        tone: item.tone || chartTone(i),
        value:
          item.value === null || item.value === undefined || item.value === ""
            ? null
            : typeof item.value === "number"
              ? formatChartNumber(item.value, locale)
              : item.value,
        hidden: off.has(item.key),
      }));
    });
    const toggle = (key: string) => {
      const current = hidden.value;
      hidden.set(
        current.includes(key)
          ? current.filter((k) => k !== key)
          : [...current, key],
      );
      emit("toggle", key);
    };
    return () =>
      h(
        "sone-chart-legend",
        {
          "data-slot": "chart-legend",
          "data-orientation": props.orientation,
          "data-toggleable": props.toggleable ? "" : undefined,
        },
        h(
          "ul",
          {
            class: "legend-list",
            role: "list",
            "aria-label": props.ariaLabel ?? undefined,
          },
          rows.value.map((row) => {
            const content = [
              swatch(row.tone, props.shape),
              h("span", { class: "legend-label" }, row.label),
              row.value !== null
                ? h("span", { class: "legend-value" }, row.value)
                : null,
            ];
            return h(
              "li",
              {
                key: row.key,
                class: "legend-item",
                "data-slot": "chart-legend-item",
                "data-hidden": row.hidden ? "" : undefined,
              },
              props.toggleable
                ? h(
                    "button",
                    {
                      type: "button",
                      class: "legend-entry legend-toggle",
                      "aria-pressed": row.hidden ? "false" : "true",
                      onClick: () => toggle(row.key),
                    },
                    content,
                  )
                : h("span", { class: "legend-entry" }, content),
            );
          }),
        ),
      );
  },
});
