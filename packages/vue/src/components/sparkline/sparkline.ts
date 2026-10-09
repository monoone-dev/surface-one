import { computed, defineComponent, h, type PropType, type VNode } from "vue";

import { useSoneMessages } from "../../composables/messages";
import { chartColor, formatChartNumber } from "../../utils/chart";
import {
  niceCeiling,
  sparklineGeometry,
  type SoneChartTone,
  type SoneSparklineType,
} from "../../utils/scale";

/**
 * `<sone-sparkline>` — a word-sized line, area, bar or heat chart in one stretched
 * `<svg>`. Decorative (`aria-hidden`) by default; `:decorative="false"` makes it
 * `role="img"` named by `summary` or the `sparklineSummary` message.
 */
export const SoneSparkline = defineComponent({
  name: "SoneSparkline",
  props: {
    values: { type: Array as PropType<readonly number[]>, default: () => [] },
    type: { type: String as PropType<SoneSparklineType>, default: "line" },
    min: { type: Number, default: 0 },
    max: { type: Number as PropType<number | null>, default: null },
    tone: { type: String as PropType<SoneChartTone>, default: "accent" },
    decorative: { type: Boolean, default: true },
    summary: { type: String as PropType<string | null>, default: null },
  },
  setup(props) {
    const messages = useSoneMessages();
    const top = computed(() =>
      props.max !== null && Number.isFinite(props.max)
        ? props.max
        : niceCeiling(props.values, 4),
    );
    const geometry = computed(() =>
      sparklineGeometry(props.values, props.type, props.min, top.value),
    );
    const label = computed(() => {
      if (props.summary) return props.summary;
      const values = props.values.filter((v) => Number.isFinite(v));
      const peak = values.reduce((a, b) => Math.max(a, b), -Infinity);
      const total = values.reduce((a, b) => a + b, 0);
      return messages.value.sparklineSummary(
        values.length,
        formatChartNumber(
          values.length ? peak : 0,
          messages.value.numberLocale,
        ),
        formatChartNumber(total, messages.value.numberLocale),
      );
    });
    const marks = (): VNode[] => {
      const g = geometry.value;
      if (props.type === "heat") {
        return g.cells.map((cell, i) =>
          h("rect", {
            key: i,
            class: "sparkline-cell",
            x: cell.x,
            y: 0,
            width: cell.width,
            height: 100,
            "data-level": cell.level,
          }),
        );
      }
      if (props.type === "bar") {
        return g.bars
          ? [h("path", { class: "sparkline-bars", d: g.bars })]
          : [];
      }
      return [
        g.area ? h("path", { class: "sparkline-area", d: g.area }) : null,
        g.line
          ? h("path", {
              class: "sparkline-line",
              d: g.line,
              "vector-effect": "non-scaling-stroke",
            })
          : null,
      ].filter((n): n is VNode => n !== null);
    };
    return () =>
      h(
        "sone-sparkline",
        {
          "data-slot": "sparkline",
          "data-type": props.type,
          style: { "--_color": chartColor(props.tone) },
          role: props.decorative ? undefined : "img",
          "aria-label": props.decorative ? undefined : label.value,
          "aria-hidden": props.decorative ? "true" : undefined,
        },
        h(
          "svg",
          {
            class: "sparkline-svg",
            viewBox: "0 0 100 100",
            preserveAspectRatio: "none",
            "aria-hidden": "true",
            focusable: "false",
          },
          marks(),
        ),
      );
  },
});
