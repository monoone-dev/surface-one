import type { ReactElement } from "react";

import { SoneLineChart, type SoneSeriesChartProps } from "../line-chart";

export type SoneAreaChartProps<T extends object = object> =
  SoneSeriesChartProps<T>;

/**
 * `<sone-area-chart>` — series drawn as filled areas: a `SoneLineChart` with `area` on, so
 * the same axis, legend, tooltip and pressable, named x values. `stacked` piles the series
 * on one another, each filling down to the one below. Dots are off by default.
 */
export function SoneAreaChart<T extends object = object>({
  dots = false,
  ...rest
}: SoneAreaChartProps<T>): ReactElement {
  return <SoneLineChart {...rest} dots={dots} area />;
}
