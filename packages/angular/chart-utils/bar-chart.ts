// The model of `<sone-bar-chart>`: the scale, the bars, the roving focus and the tooltip
// placement. Angular-free — the Vue and React twins share it through @surface-one/core.
import { niceCeiling, scaleToPercent } from "./scale";

/** What a bar chart reads from a datum (`SoneBarChartDatum`). */
export interface SoneBarChartDatumLike {
  readonly key: string;
  readonly value: number;
  readonly label?: string;
}

/** A bar as drawn. */
export interface SoneBarChartBar {
  readonly key: string;
  /** The category as people read it. */
  readonly label: string;
  /** The formatted value. */
  readonly value: string;
  /** The height in percent of the plot. */
  readonly pct: number;
  /** Zero, negative or not a number: drawn as a stub or a gap. */
  readonly empty: boolean;
  /** The axis label under the bar, `null` for none. */
  readonly tick: string | null;
  /** The tooltip and accessible name. */
  readonly tip: string;
}

/** Where the tooltip of the shown bar sits. */
export interface SoneBarChartTip {
  readonly text: string;
  /** Its bottom, in percent of the plot height. */
  readonly pct: number;
  /** Its anchor, in percent of the plot width. */
  readonly at: number;
  readonly align: "start" | "center" | "end";
}

/** The top of the value axis: `yMax` when it is a positive number, else a nice ceiling. */
export function barChartTop(
  values: readonly number[],
  yMax: number | null | undefined,
): number {
  return yMax !== null &&
    yMax !== undefined &&
    Number.isFinite(yMax) &&
    yMax > 0
    ? yMax
    : niceCeiling(values, 4);
}

/** The bars of `data` on a `top` scale, with their ticks, tooltips and formatted values. */
export function barChartBars<T extends SoneBarChartDatumLike>(
  data: readonly T[],
  top: number,
  tick: ((datum: T, index: number) => string | null) | null | undefined,
  tooltip: ((datum: T) => string) | null | undefined,
  format: (value: number) => string,
): SoneBarChartBar[] {
  return data.map((d, i) => {
    const label = d.label ?? d.key;
    return {
      key: d.key,
      label,
      value: format(d.value),
      pct: scaleToPercent(d.value, top),
      empty: !(d.value > 0),
      tick: tick ? tick(d, i) : null,
      tip: tooltip ? tooltip(d) : `${label}: ${format(d.value)}`,
    };
  });
}

/** The roving-focus bar among `count`: `active`, clamped; `null` = the last one. */
export function barChartCurrent(count: number, active: number | null): number {
  if (count === 0) return -1;
  return active === null ? count - 1 : Math.min(Math.max(active, 0), count - 1);
}

/** The bar whose tooltip shows: the hovered one, else the focused one, unless dismissed. */
export function barChartShown(state: {
  readonly count: number;
  readonly hovered: number | null;
  readonly current: number;
  readonly focusWithin: boolean;
  readonly dismissed: boolean;
}): number | null {
  if (state.dismissed) return null;
  if (state.hovered !== null && state.hovered < state.count)
    return state.hovered;
  return state.focusWithin ? state.current : null;
}

/** The tooltip of bar `shown`, kept inside the plot near its edges. */
export function barChartTip(
  bars: readonly SoneBarChartBar[],
  shown: number | null,
): SoneBarChartTip | null {
  if (shown === null || shown < 0 || shown >= bars.length) return null;
  const bar = bars[shown];
  const n = bars.length;
  const mid = (shown + 0.5) / n;
  const align = mid < 0.15 ? "start" : mid > 0.85 ? "end" : "center";
  const at =
    align === "start" ? shown / n : align === "end" ? (shown + 1) / n : mid;
  return { text: bar.tip, pct: bar.empty ? 0 : bar.pct, at: at * 100, align };
}
