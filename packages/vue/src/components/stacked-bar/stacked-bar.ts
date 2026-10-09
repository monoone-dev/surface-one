import { computed, defineComponent, h, type PropType } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { chartColor, chartTone, formatChartNumber } from "../../utils/chart";
import { SoneChartLegend } from "../chart-legend";

export interface SoneStackedBarSegment {
  key: string;
  label: string;
  value: number;
  tone?: string;
}
export type SoneStackedBarSize = "sm" | "md" | "lg";
export type SoneStackedBarValueFn = (value: number) => string;

const clean = (v: number) => (Number.isFinite(v) ? Math.max(0, v) : 0);

/**
 * `<sone-stacked-bar>` — one bar split into the parts of a whole; `max` above the
 * sum leaves the rest as the empty track. The bar is `role="img"` named by a
 * generated summary; `showLegend` adds a `SoneChartLegend`.
 */
export const SoneStackedBar = defineComponent({
  name: "SoneStackedBar",
  props: {
    segments: {
      type: Array as PropType<readonly SoneStackedBarSegment[]>,
      default: () => [],
    },
    max: { type: Number as PropType<number | null>, default: null },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    showLegend: { type: Boolean, default: false },
    size: { type: String as PropType<SoneStackedBarSize>, default: "md" },
    locale: { type: String as PropType<string | null>, default: null },
    valueLabel: {
      type: Function as PropType<SoneStackedBarValueFn | null>,
      default: null,
    },
  },
  setup(props) {
    const messages = useSoneMessages();
    const locale = computed(() => props.locale || messages.value.numberLocale);
    const format = computed<SoneStackedBarValueFn>(
      () =>
        props.valueLabel ?? ((v: number) => formatChartNumber(v, locale.value)),
    );
    const parts = computed(() =>
      props.segments
        .map((s, i) => ({
          ...s,
          value: clean(s.value),
          tone: s.tone || chartTone(i),
        }))
        .filter((s) => s.value > 0),
    );
    const total = computed(() => parts.value.reduce((n, s) => n + s.value, 0));
    const hasMax = computed(
      () => props.max !== null && Number.isFinite(props.max) && props.max > 0,
    );
    const scale = computed(() =>
      hasMax.value && (props.max as number) > total.value
        ? (props.max as number)
        : total.value,
    );
    const geometry = computed(() => {
      if (scale.value <= 0) return [];
      let run = 0;
      const n = parts.value.length;
      return parts.value.map((s, i) => {
        run += s.value;
        return {
          key: s.key,
          end: Math.min(100, (run / scale.value) * 100),
          color: chartColor(s.tone),
          z: n - i,
          gap: i < n - 1,
        };
      });
    });
    const summary = computed(() => {
      const m = messages.value;
      const label = (props.ariaLabel ?? "").trim();
      const prefix = label ? `${label}: ` : "";
      if (parts.value.length === 0 || scale.value <= 0)
        return prefix + m.stackedBarEmpty;
      const pct = (v: number) =>
        formatChartNumber(v / scale.value, locale.value, {
          style: "percent",
          maximumFractionDigits: 0,
        });
      const list = parts.value
        .map((s) =>
          m.stackedBarPart(s.label, format.value(s.value), pct(s.value)),
        )
        .join(", ");
      const sum = format.value(total.value);
      const whole = hasMax.value
        ? m.stackedBarOf(sum, format.value(props.max as number))
        : m.stackedBarTotal(sum);
      return `${prefix}${list}; ${whole}`;
    });
    const legendItems = computed(() =>
      props.segments.map((s, i) => ({
        key: s.key,
        label: s.label,
        tone: s.tone || chartTone(i),
        value: format.value(clean(s.value)),
      })),
    );
    return () =>
      h(
        "sone-stacked-bar",
        { "data-slot": "stacked-bar", "data-size": props.size },
        [
          h(
            "div",
            {
              class: "track",
              "data-slot": "stacked-bar-track",
              role: "img",
              "aria-label": summary.value,
            },
            geometry.value.map((g) =>
              h("span", {
                key: g.key,
                class: ["segment", { "has-gap": g.gap }],
                "data-slot": "stacked-bar-segment",
                "data-key": g.key,
                style: {
                  "--_end": g.end,
                  "--_color": g.color ?? undefined,
                  "z-index": g.z,
                },
              }),
            ),
          ),
          props.showLegend
            ? h(SoneChartLegend, {
                class: "legend",
                items: legendItems.value,
                shape: "square",
                locale: locale.value,
              })
            : null,
        ],
      );
  },
});
