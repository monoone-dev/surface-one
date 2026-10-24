import { createElement, type ReactElement } from "react";

import { SoneLineChart, type SoneSeriesChartProps } from "../line-chart";

export type SoneAreaChartProps<T extends object = object> =
  SoneSeriesChartProps<T>;

/**
 * `<sone-area-chart>` — series drawn as filled areas (shadcn/ui Area Chart): a
 * `SoneLineChart` with `area` on, so the same data, axis, legend, tooltip, roving focus and
 * hidden data table. `stacked` piles the series on one another, each filling down to the
 * one below; otherwise every area fills down to zero. Dots are off by default.
 */
export function SoneAreaChart<T extends object = object>({
  data,
  series,
  xKey,
  xScale,
  xFormat,
  xTicks,
  yTicks,
  yMin,
  yMax,
  height,
  curve,
  stacked = false,
  dots = false,
  legend,
  ariaLabel,
  valueFormat,
  categoryHeader,
  ...rest
}: SoneAreaChartProps<T>): ReactElement {
  return createElement(
    "sone-area-chart",
    {
      "data-slot": "area-chart",
      "data-stacked": stacked ? "" : undefined,
      ...rest,
    },
    <SoneLineChart
      area
      data={data}
      series={series}
      xKey={xKey}
      xScale={xScale}
      xFormat={xFormat}
      xTicks={xTicks}
      yTicks={yTicks}
      yMin={yMin}
      yMax={yMax}
      height={height}
      curve={curve}
      stacked={stacked}
      dots={dots}
      legend={legend}
      ariaLabel={ariaLabel}
      valueFormat={valueFormat}
      categoryHeader={categoryHeader}
    />,
  );
}
