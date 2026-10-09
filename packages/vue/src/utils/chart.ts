// Pure chart maths — below these two lines a byte-for-byte twin of chart-utils.ts in
// packages/angular/chart-utils (test/chart.test.ts keeps them in step); plain Node safe.

/** The colour roles every SurfaceOne chart accepts (`tone`). */
export type SoneChartTone =
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | `chart-${1 | 2 | 3 | 4 | 5 | 6 | 7 | 8}`;

const NICE_STEPS = [1, 2, 2.5, 5, 10] as const;

/** The smallest 1 / 2 / 2.5 / 5 × 10ⁿ that is ≥ `x` (`x` > 0). */
function niceUp(x: number): number {
  const exp = Math.floor(Math.log10(x));
  const base = 10 ** exp;
  const f = x / base;
  const step = NICE_STEPS.find((s) => f <= s * (1 + 1e-9)) ?? 10;
  return Number((step * base).toPrecision(12));
}

/**
 * The top of a value axis: the largest finite value, at least `floor`, rounded up to a
 * "nice" 1 / 2 / 2.5 / 5 × 10ⁿ step — so a quiet week does not draw one meeting as a
 * full-height bar. `niceCeiling([3, 1])` → 5, `niceCeiling([37])` → 50,
 * `niceCeiling([180])` → 200. Never returns 0 (safe to divide by).
 */
export function niceCeiling(values: readonly number[], floor = 4): number {
  let max = Number.isFinite(floor) ? floor : 0;
  for (const v of values) if (Number.isFinite(v) && v > max) max = v;
  return max > 0 ? niceUp(max) : 1;
}

/** `value` as a 0–100 share of `max`, clamped; 0 when `max` is not a positive number. */
export function scaleToPercent(value: number, max: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;
  return Math.min(Math.max((value / max) * 100, 0), 100);
}

/** A date's LOCAL calendar day as `YYYY-MM-DD` (not `toISOString()`, which is UTC). */
export function localIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export interface FillDaySeriesOptions<T> {
  /** The last day of the series (default: now). Only its local calendar date is used. */
  readonly today?: Date;
  /** The row for a day with no data: `(date) => ({ date, count: 0 })`. */
  readonly empty: (date: string) => T;
}

/**
 * Exactly `days` rows, oldest first, ending on `today`'s local date: the row from `rows`
 * whose `date` (`YYYY-MM-DD`) matches, else `empty(date)`. Days are stepped with
 * calendar arithmetic (`new Date(y, m, d - k)`), never `- k * 86_400_000` ms — a
 * daylight-saving day is 23 or 25 hours long, and the millisecond walk skips or repeats a
 * date across it.
 */
export function fillDaySeries<T extends { readonly date: string }>(
  rows: readonly T[],
  days: number,
  opts: FillDaySeriesOptions<T>,
): T[] {
  const count = Number.isFinite(days) ? Math.max(0, Math.floor(days)) : 0;
  const today = opts.today ?? new Date();
  const byDate = new Map(rows.map((r) => [r.date, r]));
  return Array.from({ length: count }, (_, i) => {
    const date = localIsoDate(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - (count - 1 - i),
      ),
    );
    return byDate.get(date) ?? opts.empty(date);
  });
}

/** How `<sone-sparkline>` draws a series. */
export type SoneSparklineType = "line" | "area" | "bar" | "heat";

/** One cell of a `heat` sparkline: its slot in the 0–100 box and its ramp step (0 = none, 1–5). */
export interface SoneSparklineCell {
  readonly x: number;
  readonly width: number;
  readonly level: 0 | 1 | 2 | 3 | 4 | 5;
}

/** The drawing of a sparkline in a 0–100 × 0–100 box (y grows downwards). */
export interface SoneSparklineGeometry {
  /** The polyline through the values (`line`, `area`). */
  readonly line: string;
  /** The polyline closed along the bottom (`area`). */
  readonly area: string;
  /** Every bar as one path (`bar`). */
  readonly bars: string;
  /** The cells (`heat`). */
  readonly cells: readonly SoneSparklineCell[];
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * The paths of a sparkline: values clamped into `min..max`, laid out in a 100 × 100
 * viewBox meant to be stretched (`preserveAspectRatio="none"`). A bar never drops below
 * a 4 % stub, so an empty day still reads as a day.
 */
export function sparklineGeometry(
  values: readonly number[],
  type: SoneSparklineType,
  min: number,
  max: number,
): SoneSparklineGeometry {
  const none: SoneSparklineGeometry = {
    line: "",
    area: "",
    bars: "",
    cells: [],
  };
  const n = values.length;
  if (n === 0) return none;
  const lo = Number.isFinite(min) ? min : 0;
  const hi = Number.isFinite(max) && max > lo ? max : lo + 1;
  const frac = (v: number): number =>
    Number.isFinite(v) ? Math.min(Math.max((v - lo) / (hi - lo), 0), 1) : 0;

  if (type === "line" || type === "area") {
    const ys = values.map((v) => r2(100 - frac(v) * 100));
    const pts =
      n === 1
        ? [`0 ${ys[0]}`, `100 ${ys[0]}`]
        : ys.map((y, i) => `${r2((i / (n - 1)) * 100)} ${y}`);
    const line = `M${pts.join("L")}`;
    return {
      ...none,
      line,
      area: type === "area" ? `${line}L100 100L0 100Z` : "",
    };
  }

  const slot = 100 / n;
  if (type === "bar") {
    const gap = slot * 0.2;
    const w = r2(slot - gap);
    const bars = values
      .map((v, i) => {
        const x = r2(i * slot + gap / 2);
        const top = r2(100 - Math.max(frac(v) * 100, 4));
        return `M${x} 100V${top}H${r2(x + w)}V100Z`;
      })
      .join("");
    return { ...none, bars };
  }

  const gap = slot * 0.15;
  const cells = values.map((v, i) => {
    const f = frac(v);
    const level = (
      f <= 0 ? 0 : Math.min(Math.max(Math.ceil(f * 5), 1), 5)
    ) as SoneSparklineCell["level"];
    return { x: r2(i * slot + gap / 2), width: r2(slot - gap), level };
  });
  return { ...none, cells };
}
