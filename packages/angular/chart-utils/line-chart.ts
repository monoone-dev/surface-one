// The model of `<sone-line-chart>` and `<sone-area-chart>`: the x positions (categories or
// time), the value axis and its ticks, the series paths (straight or smoothed, stacked or
// not), the hit columns, the axis labels and the tooltip. Angular-free — the Vue, React and
// React Native twins share it through @surface-one/core.
import { chartTone } from "./chart";

/** An x value: a category name, a number, or a time (a `Date`, epoch ms or an ISO string). */
export type SoneChartX = string | number | Date;

/** How the x values are laid out: evenly (`category`) or by their time (`time`). */
export type SoneLineChartXScale = "category" | "time";

/** `linear` — straight segments; `smooth` — a monotone curve (never overshoots a value). */
export type SoneLineChartCurve = "linear" | "smooth";

/** A series as the charts read it: the row key of its values, its name and colour. */
export interface SoneLineChartSeriesLike {
  readonly key: string;
  /** The name in the legend, the tooltip and the data table; default: `key`. */
  readonly label?: string;
  /** The colour (`chart-3`, `success`, `--brand`, a CSS colour); default: `chart-<n>`. */
  readonly tone?: string;
}

/** A value axis: its ends and its labelled steps. */
export interface SoneChartAxis {
  readonly min: number;
  readonly max: number;
  readonly ticks: readonly number[];
}

/** A point of a series in the 0–100 box (y grows downwards); `null` y = no value. */
export interface SoneLineChartPoint {
  readonly x: number;
  readonly y: number | null;
  readonly value: number | null;
}

/** A series as drawn in a 0–100 × 0–100 box stretched over the plot. */
export interface SoneLineChartPath {
  readonly key: string;
  readonly label: string;
  readonly tone: string;
  /** The line (one sub-path per run of values; a missing value breaks it). */
  readonly line: string;
  /** The filled area under the line (or between stacked lines); empty without `area`. */
  readonly area: string;
  readonly points: readonly SoneLineChartPoint[];
}

/** The hit column of an x value: its slot across the plot, in percent. */
export interface SoneLineChartColumn {
  readonly left: number;
  readonly width: number;
}

/** Where the tooltip of the shown x value sits. */
export interface SoneLineChartTip {
  /** Its anchor, in percent of the plot width. */
  readonly at: number;
  readonly align: "start" | "center" | "end";
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

const NICE = [1, 2, 2.5, 5, 10] as const;

/** The smallest 1 / 2 / 2.5 / 5 × 10ⁿ step ≥ `x` (`x` > 0). */
function niceStep(x: number): number {
  const exp = Math.floor(Math.log10(x));
  const base = 10 ** exp;
  const f = x / base;
  const step = NICE.find((s) => f <= s * (1 + 1e-9)) ?? 10;
  return Number((step * base).toPrecision(12));
}

/**
 * Round ticks over `min..max`: about `count` steps of a 1 / 2 / 2.5 / 5 × 10ⁿ size, the
 * first at or below `min` and the last at or above `max`. `niceTicks(0, 37)` →
 * `[0, 10, 20, 30, 40]`. An empty range widens to one step above it.
 */
export function niceTicks(min: number, max: number, count = 4): number[] {
  let lo = Number.isFinite(min) ? min : 0;
  let hi = Number.isFinite(max) ? max : lo;
  if (hi < lo) [lo, hi] = [hi, lo];
  if (hi === lo) hi = lo + (lo === 0 ? 1 : Math.abs(lo));
  const n = Number.isFinite(count) && count >= 1 ? Math.floor(count) : 4;
  const step = niceStep((hi - lo) / n);
  const first = Math.floor(lo / step + 1e-9) * step;
  const last = Math.ceil(hi / step - 1e-9) * step;
  const ticks: number[] = [];
  for (let v = first; v <= last + step / 2; v += step)
    ticks.push(Number(v.toPrecision(12)));
  return ticks;
}

/** A number, or `null` for a missing one (null, undefined, NaN, ±Infinity, not a number). */
export function chartValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/** The values of every series, row by row: `values[s][i]` = series `s` at row `i`. */
export function lineChartValues<T>(
  data: readonly T[],
  series: readonly SoneLineChartSeriesLike[],
): (number | null)[][] {
  return series.map((s) =>
    data.map((row) =>
      chartValue((row as Record<string, unknown> | null)?.[s.key]),
    ),
  );
}

/** Running totals for a stacked chart: a missing value adds nothing. */
export function stackValues(values: readonly (readonly (number | null)[])[]): {
  readonly lower: number[][];
  readonly upper: number[][];
} {
  const n = Math.max(0, ...values.map((v) => v.length));
  const run = new Array<number>(n).fill(0);
  const lower: number[][] = [];
  const upper: number[][] = [];
  for (const v of values) {
    const lo = run.slice();
    for (let i = 0; i < n; i++) run[i] += v[i] ?? 0;
    lower.push(lo);
    upper.push(run.slice());
  }
  return { lower, upper };
}

/**
 * The value axis of a line or area chart: from `yMin` (default: 0, or the lowest value
 * when it is negative) to `yMax` (default: a nice step above the highest value, or the
 * highest running total when `stacked`), with round ticks.
 */
export function lineChartAxis(
  values: readonly (readonly (number | null)[])[],
  options: {
    readonly stacked?: boolean;
    readonly yMin?: number | null;
    readonly yMax?: number | null;
    readonly ticks?: number;
  } = {},
): SoneChartAxis {
  const all = options.stacked
    ? stackValues(values).upper.flat()
    : values.flat().filter((v): v is number => v !== null);
  let lo = Math.min(0, ...all);
  let hi = Math.max(0, ...all);
  const fixedMin = chartValue(options.yMin);
  const fixedMax = chartValue(options.yMax);
  if (fixedMin !== null) lo = fixedMin;
  if (fixedMax !== null) hi = fixedMax;
  const ticks = niceTicks(lo, hi, options.ticks ?? 4);
  const min = fixedMin ?? ticks[0];
  const max = fixedMax ?? ticks[ticks.length - 1];
  return {
    min,
    max: max > min ? max : min + 1,
    ticks: ticks.filter((t) => t >= min - 1e-9 && t <= max + 1e-9),
  };
}

/** An x value as epoch milliseconds (a `Date`, a number, or a date string), else NaN. */
export function chartTime(x: SoneChartX): number {
  if (x instanceof Date) return x.getTime();
  if (typeof x === "number") return x;
  // A bare `YYYY-MM-DD` is a LOCAL day (Date parses it as UTC midnight).
  const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(x);
  if (day) return new Date(+day[1], +day[2] - 1, +day[3]).getTime();
  return Date.parse(x);
}

/**
 * The x positions of `xs` in percent of the plot width: evenly spaced (`category`, one
 * value in the middle) or in proportion to their time (`time`; a value that is not a time
 * falls back to the even spacing of the whole axis).
 */
export function lineChartXPositions(
  xs: readonly SoneChartX[],
  scale: SoneLineChartXScale = "category",
): number[] {
  const n = xs.length;
  const even = xs.map((_, i) => (n === 1 ? 50 : r2((i / (n - 1)) * 100)));
  if (scale !== "time" || n < 2) return even;
  const t = xs.map(chartTime);
  if (t.some((v) => !Number.isFinite(v))) return even;
  const lo = Math.min(...t);
  const hi = Math.max(...t);
  if (hi === lo) return xs.map(() => 50);
  return t.map((v) => r2(((v - lo) / (hi - lo)) * 100));
}

/** `value` on the axis as a y in the 0–100 box (0 at the top), clamped into the box. */
export function chartY(value: number, axis: SoneChartAxis): number {
  const span = axis.max - axis.min || 1;
  return r2(100 - Math.min(Math.max((value - axis.min) / span, 0), 1) * 100);
}

type Pt = readonly [number, number];
interface Segment {
  readonly c1: Pt;
  readonly c2: Pt;
  readonly to: Pt;
}

/**
 * The cubic segments through `pts` (x ascending): straight lines for `linear`, the
 * monotone cubic of Fritsch–Carlson for `smooth` (no bump above or below a value).
 */
function segments(pts: readonly Pt[], curve: SoneLineChartCurve): Segment[] {
  const n = pts.length;
  if (n < 2) return [];
  if (curve !== "smooth" || n < 3) {
    return pts.slice(1).map((p, i) => {
      const a = pts[i];
      return {
        c1: [a[0] + (p[0] - a[0]) / 3, a[1] + (p[1] - a[1]) / 3],
        c2: [a[0] + ((p[0] - a[0]) * 2) / 3, a[1] + ((p[1] - a[1]) * 2) / 3],
        to: p,
      };
    });
  }
  const dx: number[] = [];
  const slope: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1][0] - pts[i][0]);
    slope.push(dx[i] === 0 ? 0 : (pts[i + 1][1] - pts[i][1]) / dx[i]);
  }
  const m: number[] = [slope[0]];
  for (let i = 1; i < n - 1; i++)
    m.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2);
  m.push(slope[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / slope[i];
    const b = m[i + 1] / slope[i];
    const h = a * a + b * b;
    if (h > 9) {
      const t = 3 / Math.sqrt(h);
      m[i] = t * a * slope[i];
      m[i + 1] = t * b * slope[i];
    }
  }
  return pts.slice(1).map((p, i) => {
    const a = pts[i];
    const d = dx[i] / 3;
    return {
      c1: [a[0] + d, a[1] + m[i] * d],
      c2: [p[0] - d, p[1] - m[i + 1] * d],
      to: p,
    };
  });
}

const pt = (p: Pt): string => `${r2(p[0])} ${r2(p[1])}`;

function draw(segs: readonly Segment[], curve: SoneLineChartCurve): string {
  if (curve !== "smooth") return segs.map((s) => `L${pt(s.to)}`).join("");
  return segs.map((s) => `C${pt(s.c1)} ${pt(s.c2)} ${pt(s.to)}`).join("");
}

/** The SVG path through `pts`: one point draws a short flat dash so it stays visible. */
export function chartLinePath(
  pts: readonly Pt[],
  curve: SoneLineChartCurve = "linear",
): string {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pt(pts[0])}L${pt(pts[0])}`;
  return `M${pt(pts[0])}${draw(segments(pts, curve), curve)}`;
}

/** The closed SVG path between `top` and `bottom` (the same x values, left to right). */
export function chartAreaPath(
  top: readonly Pt[],
  bottom: readonly Pt[],
  curve: SoneLineChartCurve = "linear",
): string {
  if (top.length === 0 || top.length !== bottom.length) return "";
  if (top.length === 1) {
    const [x, y] = top[0];
    return `M${pt([x - 0.5, y])}L${pt([x + 0.5, y])}L${pt([x + 0.5, bottom[0][1]])}L${pt([x - 0.5, bottom[0][1]])}Z`;
  }
  const up = segments(top, curve);
  // The bottom edge runs right to left: each segment reversed (control points swapped).
  const down = segments(bottom, curve)
    .map((s, i) => ({ c1: s.c2, c2: s.c1, to: bottom[i] }))
    .reverse();
  const last = bottom[bottom.length - 1];
  return `M${pt(top[0])}${draw(up, curve)}L${pt(last)}${draw(down, curve)}Z`;
}

/**
 * The paths of every series over the x positions `xs` (percent): a line per run of
 * values (a missing value breaks it), and with `area` the fill under it — down to the
 * zero line, or, `stacked`, down to the series below.
 */
export function lineChartPaths(
  series: readonly SoneLineChartSeriesLike[],
  values: readonly (readonly (number | null)[])[],
  xs: readonly number[],
  axis: SoneChartAxis,
  options: {
    readonly curve?: SoneLineChartCurve;
    readonly area?: boolean;
    readonly stacked?: boolean;
  } = {},
): SoneLineChartPath[] {
  const curve = options.curve ?? "linear";
  const stack = options.stacked ? stackValues(values) : null;
  const base = chartY(Math.min(Math.max(0, axis.min), axis.max), axis);
  return series.map((s, si) => {
    const raw = values[si] ?? [];
    const tops = xs.map((_, i) =>
      stack ? stack.upper[si][i] : (raw[i] ?? null),
    );
    const points: SoneLineChartPoint[] = xs.map((x, i) => ({
      x,
      y: raw[i] === null && !stack ? null : chartY(tops[i] ?? 0, axis),
      value: raw[i] ?? null,
    }));
    // Runs of consecutive points with a value.
    const runs: number[][] = [];
    let run: number[] = [];
    points.forEach((p, i) => {
      if (p.y === null) {
        if (run.length) runs.push(run);
        run = [];
      } else run.push(i);
    });
    if (run.length) runs.push(run);
    const line = runs
      .map((r) =>
        chartLinePath(
          r.map((i) => [xs[i], points[i].y!]),
          curve,
        ),
      )
      .join("");
    const area = options.area
      ? runs
          .map((r) =>
            chartAreaPath(
              r.map((i) => [xs[i], points[i].y!] as const),
              r.map(
                (i) =>
                  [
                    xs[i],
                    stack ? chartY(stack.lower[si][i], axis) : base,
                  ] as const,
              ),
              curve,
            ),
          )
          .join("")
      : "";
    return {
      key: s.key,
      label: s.label ?? s.key,
      tone: s.tone || chartTone(si),
      line,
      area,
      points,
    };
  });
}

/** The hit column of each x position: from halfway to its left neighbour to halfway to its right one. */
export function lineChartColumns(xs: readonly number[]): SoneLineChartColumn[] {
  return xs.map((x, i) => {
    const left = i === 0 ? 0 : (xs[i - 1] + x) / 2;
    const right = i === xs.length - 1 ? 100 : (x + xs[i + 1]) / 2;
    return { left: r2(left), width: r2(Math.max(right - left, 0)) };
  });
}

/**
 * The indexes that get an x-axis label: at most `max`, evenly stepped back from the last
 * one (so the newest value is always labelled).
 */
export function lineChartTickIndexes(count: number, max = 6): number[] {
  const n = Math.max(0, Math.floor(count));
  const m = Math.max(1, Math.floor(max) || 1);
  const step = Math.max(1, Math.ceil(n / m));
  const out: number[] = [];
  for (let i = n - 1; i >= 0; i -= step) out.unshift(i);
  return out;
}

/** The tooltip anchor of the x value at `x` percent, kept inside the plot near its edges. */
export function lineChartTip(x: number): SoneLineChartTip {
  const align = x < 15 ? "start" : x > 85 ? "end" : "center";
  return { at: x, align };
}

/**
 * The default label of an x value: a string as it is, a time as a short date in `locale`
 * (`time` scale or a `Date`), any other number as a number.
 */
export function chartXLabel(
  x: SoneChartX,
  scale: SoneLineChartXScale,
  locale: string,
): string {
  if (typeof x === "string" && scale !== "time") return x;
  if (x instanceof Date || scale === "time") {
    const t = chartTime(x);
    if (!Number.isFinite(t)) return String(x);
    try {
      return new Date(t).toLocaleDateString(locale, {
        month: "short",
        day: "numeric",
      });
    } catch {
      return new Date(t).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
      });
    }
  }
  return String(x);
}

/** The spoken summary of one x value: `Jan: Desktop 186, Mobile 80`. */
export function lineChartSummary(
  label: string,
  parts: readonly { readonly label: string; readonly value: string }[],
): string {
  return `${label}: ${parts.map((p) => `${p.label} ${p.value}`).join(", ")}`;
}

/** A value of one series at one x value, formatted. */
export interface SoneLineChartColumnValue {
  readonly key: string;
  readonly label: string;
  readonly tone: string;
  readonly value: string;
}

/** An x value as the chart draws, names and tabulates it. */
export interface SoneLineChartColumnModel extends SoneLineChartColumn {
  readonly key: string;
  /** Its position, in percent of the plot width. */
  readonly x: number;
  readonly label: string;
  /** The accessible name of its hit column: `Jan: Desktop 186, Mobile 80`. */
  readonly summary: string;
  readonly values: readonly SoneLineChartColumnValue[];
}

/** A labelled step of an axis; `pct` is its offset from the start of the axis. */
export interface SoneLineChartTick {
  readonly label: string;
  readonly pct: number;
  readonly align: "start" | "center" | "end";
}

/** Everything a line or area chart draws. */
export interface SoneLineChartModel {
  readonly axis: SoneChartAxis;
  readonly paths: readonly SoneLineChartPath[];
  readonly columns: readonly SoneLineChartColumnModel[];
  readonly yTicks: readonly SoneLineChartTick[];
  readonly xTicks: readonly SoneLineChartTick[];
  /** The longest y label, which sizes the value axis. */
  readonly widestY: string;
}

/** The inputs of `lineChartModel`: the props of the line and area charts. */
export interface SoneLineChartModelOptions<T> {
  readonly data: readonly T[];
  readonly series: readonly SoneLineChartSeriesLike[];
  /** The row key of the x value. */
  readonly xKey: string;
  readonly xScale?: SoneLineChartXScale;
  /** The label of an x value; default: `chartXLabel`. */
  readonly xFormat?: ((x: SoneChartX, index: number) => string) | null;
  /** At most this many x-axis labels. */
  readonly xTicks?: number;
  /** About this many value-axis steps. */
  readonly yTicks?: number;
  readonly yMin?: number | null;
  readonly yMax?: number | null;
  readonly curve?: SoneLineChartCurve;
  readonly area?: boolean;
  readonly stacked?: boolean;
  /** The locale of the default x labels. */
  readonly locale: string;
  readonly valueFormat: (value: number) => string;
}

const MISSING = "–";

/** The whole drawing of a line or area chart, shared by every framework. */
export function lineChartModel<T>(
  o: SoneLineChartModelOptions<T>,
): SoneLineChartModel {
  const scale = o.xScale ?? "category";
  const raw = o.data.map(
    (row) =>
      (row as Record<string, unknown> | null)?.[o.xKey] as
        SoneChartX | undefined,
  );
  const xs = lineChartXPositions(
    raw.map((x, i) => x ?? i),
    scale,
  );
  const label = (i: number): string => {
    const x = raw[i] ?? i;
    return o.xFormat ? o.xFormat(x, i) : chartXLabel(x, scale, o.locale);
  };
  const values = lineChartValues(o.data, o.series);
  const axis = lineChartAxis(values, {
    stacked: o.stacked,
    yMin: o.yMin,
    yMax: o.yMax,
    ticks: o.yTicks,
  });
  const paths = lineChartPaths(o.series, values, xs, axis, {
    curve: o.curve,
    area: o.area,
    stacked: o.stacked,
  });
  const hit = lineChartColumns(xs);
  const fmt = (v: number | null): string =>
    v === null ? MISSING : o.valueFormat(v);
  const columns = xs.map((x, i) => {
    const name = label(i);
    const cells = paths.map((p, si) => ({
      key: p.key,
      label: p.label,
      tone: p.tone,
      value: fmt(values[si][i]),
    }));
    return {
      ...hit[i],
      key: `${i}`,
      x,
      label: name,
      summary: lineChartSummary(name, cells),
      values: cells,
    };
  });
  const yTicks = axis.ticks.map((v) => ({
    label: o.valueFormat(v),
    pct: r2(100 - chartY(v, axis)),
    align: "center" as const,
  }));
  const xTicks = lineChartTickIndexes(xs.length, o.xTicks ?? 6).map((i) => ({
    label: columns[i].label,
    pct: xs[i],
    align: (xs[i] < 10 ? "start" : xs[i] > 90 ? "end" : "center") as
      "start" | "center" | "end",
  }));
  const widestY = yTicks.reduce(
    (w, t) => (t.label.length > w.length ? t.label : w),
    "",
  );
  return { axis, paths, columns, yTicks, xTicks, widestY };
}
