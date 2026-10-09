// Pure chart maths — a byte-for-byte twin of packages/angular/core/chart.ts below this
// header (test/chart.test.ts keeps them in step); no Vue import, safe in plain Node.

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
