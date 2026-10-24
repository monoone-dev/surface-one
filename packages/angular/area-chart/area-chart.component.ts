import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  numberAttribute,
} from "@angular/core";
import {
  formatChartNumber,
  type SoneLineChartCurve,
  type SoneLineChartXScale,
} from "@surface-one/angular/chart-utils";
import {
  SoneLineChartComponent,
  type SoneLineChartFormat,
  type SoneLineChartSeries,
  type SoneLineChartXFormat,
} from "@surface-one/angular/line-chart";

const optionalNumber = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : numberAttribute(v);

const defaultFormat: SoneLineChartFormat = (n) => formatChartNumber(n);

/**
 * `<sone-area-chart>` — series drawn as filled areas (shadcn/ui Area Chart): a
 * `<sone-line-chart area>` with the same data, axis, legend, tooltip, roving focus and
 * hidden data table. `stacked` piles the series on one another, each filling down to the
 * one below; otherwise every area fills down to zero.
 */
@Component({
  selector: "sone-area-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneLineChartComponent],
  templateUrl: "./area-chart.component.html",
  styleUrl: "./area-chart.component.scss",
  host: {
    "data-slot": "area-chart",
    "[attr.data-stacked]": "stacked() ? '' : null",
  },
})
export class SoneAreaChartComponent<T = Record<string, unknown>> {
  /** The rows, left to right: each holds the x value (`xKey`) and one value per series. */
  readonly data = input<readonly T[]>([]);
  /** The series: `{ key, label, tone }`, `key` naming the row property of its values. */
  readonly series = input<readonly SoneLineChartSeries[]>([]);
  /** The row property of the x value. */
  readonly xKey = input("x");
  /** `category` — evenly spaced; `time` — spaced by date (`Date`, epoch ms or ISO string). */
  readonly xScale = input<SoneLineChartXScale>("category");
  /** The label of an x value (axis, tooltip, table); default: the text, or a short date. */
  readonly xFormat = input<SoneLineChartXFormat | null>(null);
  /** At most this many x-axis labels (stepped back from the last one); 0 hides the axis. */
  readonly xTicks = input(6, { transform: numberAttribute });
  /** About this many value-axis steps. */
  readonly yTicks = input(4, { transform: numberAttribute });
  /** The bottom of the value axis; default: 0, or the lowest value when negative. */
  readonly yMin = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** The top of the value axis; default: a round step above the highest (stacked) value. */
  readonly yMax = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** The plot height in CSS pixels (the x labels sit below it). */
  readonly height = input(200, { transform: numberAttribute });
  /** `linear` — straight segments; `smooth` — a monotone curve. */
  readonly curve = input<SoneLineChartCurve>("linear");
  /** Stacks the series, each filling down to the one below. */
  readonly stacked = input(false, { transform: booleanAttribute });
  /** Draws a dot on every value (the hovered or focused x value always shows its dots). */
  readonly dots = input(false, { transform: booleanAttribute });
  /** Shows the legend under the plot. */
  readonly legend = input(true, { transform: booleanAttribute });
  /** Names the chart and captions its data table. */
  readonly ariaLabel = input("");
  /** Formats values on the axis, in the tooltip and in the data table. */
  readonly valueFormat = input<SoneLineChartFormat>(defaultFormat);
  /** The data table's category column header. */
  readonly categoryHeader = input($localize`Category`);
}
