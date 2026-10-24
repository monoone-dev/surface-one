import { defineComponent, h } from "vue";

import { SoneLineChart, lineChartProps } from "../line-chart/line-chart";

/**
 * `<sone-area-chart>` — series drawn as filled areas (shadcn/ui Area Chart): a
 * `SoneLineChart` with `area` on, so the same data, axis, legend, tooltip, roving focus and
 * hidden data table. `stacked` piles the series on one another, each filling down to the
 * one below; otherwise every area fills down to zero.
 */
export const SoneAreaChart = defineComponent({
  name: "SoneAreaChart",
  props: {
    ...lineChartProps,
    /** Draws a dot on every value (the hovered or focused x value always shows its dots). */
    dots: { type: Boolean, default: false },
  },
  setup(props) {
    return () =>
      h(
        "sone-area-chart",
        {
          "data-slot": "area-chart",
          "data-stacked": props.stacked ? "" : undefined,
        },
        h(SoneLineChart, { ...props, area: true }),
      );
  },
});
