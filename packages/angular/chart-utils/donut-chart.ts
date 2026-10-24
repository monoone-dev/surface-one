// The model of `<sone-donut-chart>`: the share of each segment and its ring sector in a
// 100 × 100 box. Angular-free — the Vue, React and React Native twins share it through
// @surface-one/core.
import { chartTone, formatChartNumber } from "./chart";

/** What a donut chart reads from a segment (`SoneDonutChartSegment`). */
export interface SoneDonutChartSegmentLike {
  /** Stable identity. */
  readonly key: string;
  readonly label: string;
  readonly value: number;
  /** The colour (`chart-3`, `success`, `--brand`, a CSS colour); default: `chart-<n>`. */
  readonly tone?: string;
}

/** A segment as drawn: its share, its angles and its ring sector. */
export interface SoneDonutChartArc {
  readonly key: string;
  readonly label: string;
  /** The value, negative and missing values counted as 0. */
  readonly value: number;
  readonly tone: string;
  /** Its part of the total, 0–1. */
  readonly share: number;
  /** Clockwise from 12 o'clock, in degrees. */
  readonly start: number;
  readonly end: number;
  /** The ring sector in the 0–100 box; empty for a zero segment. */
  readonly path: string;
}

const r2 = (n: number): number => Math.round(n * 100) / 100;

/** A point on the circle of radius `r` around the centre of the box, `deg` clockwise from 12. */
function polar(r: number, deg: number): string {
  const rad = ((deg - 90) * Math.PI) / 180;
  return `${r2(50 + r * Math.cos(rad))} ${r2(50 + r * Math.sin(rad))}`;
}

/**
 * The ring sector from `start` to `end` degrees (clockwise from 12 o'clock) between the
 * radii `inner` and `outer` (the box is 100 wide, so `outer` ≤ 50). A full turn is drawn
 * as two half arcs (an SVG arc cannot end where it starts).
 */
export function donutSectorPath(
  start: number,
  end: number,
  inner: number,
  outer: number,
): string {
  const sweep = end - start;
  if (!(sweep > 0) || !(outer > 0)) return "";
  if (sweep >= 359.999) {
    const ring = (r: number, dir: 0 | 1) =>
      r > 0
        ? `M${polar(r, 0)}A${r} ${r} 0 1 ${dir} ${polar(r, 180)}A${r} ${r} 0 1 ${dir} ${polar(r, 360)}Z`
        : "";
    return ring(outer, 1) + ring(inner, 0);
  }
  const large = sweep > 180 ? 1 : 0;
  const outerArc = `M${polar(outer, start)}A${outer} ${outer} 0 ${large} 1 ${polar(outer, end)}`;
  if (inner <= 0) return `${outerArc}L50 50Z`;
  return `${outerArc}L${polar(inner, end)}A${inner} ${inner} 0 ${large} 0 ${polar(inner, start)}Z`;
}

/** The total of the segments, negative and missing values counted as 0. */
export function donutTotal(
  segments: readonly SoneDonutChartSegmentLike[],
): number {
  return segments.reduce(
    (sum, s) => sum + (Number.isFinite(s.value) && s.value > 0 ? s.value : 0),
    0,
  );
}

/**
 * The arcs of `segments` around the ring, clockwise from 12 o'clock. `thickness` is the
 * ring's width as a part of the radius (0.3 = the inner radius is 70 % of the outer;
 * 1 = a pie); `padAngle` (degrees) leaves a gap between neighbouring segments, never more
 * than half of a segment.
 */
export function donutArcs(
  segments: readonly SoneDonutChartSegmentLike[],
  options: { readonly thickness?: number; readonly padAngle?: number } = {},
): SoneDonutChartArc[] {
  const thickness = Math.min(
    Math.max(
      Number.isFinite(options.thickness) ? options.thickness! : 0.3,
      0.05,
    ),
    1,
  );
  const outer = 50;
  const inner = r2(outer * (1 - thickness));
  const total = donutTotal(segments);
  const drawn = segments.filter((s) => s.value > 0).length;
  const pad = drawn > 1 ? Math.max(options.padAngle ?? 1, 0) : 0;
  let at = 0;
  return segments.map((s, i) => {
    const value = Number.isFinite(s.value) && s.value > 0 ? s.value : 0;
    const share = total > 0 ? value / total : 0;
    const start = at;
    const end = at + share * 360;
    at = end;
    const gap = Math.min(pad, (end - start) / 2) / 2;
    return {
      key: s.key,
      label: s.label,
      value,
      tone: s.tone || chartTone(i),
      share,
      start: r2(start),
      end: r2(end),
      path:
        value > 0 ? donutSectorPath(start + gap, end - gap, inner, outer) : "",
    };
  });
}

/** The spoken name of a segment: `Chrome: 275 (39%)`. */
export function donutSegmentSummary(
  label: string,
  value: string,
  percent: string,
): string {
  return `${label}: ${value} (${percent})`;
}

/** A segment as every framework draws, names and tabulates it. */
export interface SoneDonutChartSlice extends SoneDonutChartArc {
  /** The formatted value. */
  readonly valueText: string;
  /** The formatted share: `39%`. */
  readonly percent: string;
  /** The accessible name and tooltip: `Chrome: 275 (39%)`. */
  readonly summary: string;
}

/** Everything a donut chart draws. */
export interface SoneDonutChartModel {
  /** Every segment, in order (zero ones too: the legend and the table list them). */
  readonly slices: readonly SoneDonutChartSlice[];
  /** The segments with a value: the drawn, focusable ones. */
  readonly drawn: readonly SoneDonutChartSlice[];
  readonly total: number;
  readonly totalText: string;
}

/** The whole drawing of a donut chart, shared by every framework. */
export function donutChartModel(o: {
  readonly segments: readonly SoneDonutChartSegmentLike[];
  readonly thickness?: number;
  readonly padAngle?: number;
  readonly locale: string;
  readonly valueFormat: (value: number) => string;
}): SoneDonutChartModel {
  const slices = donutArcs(o.segments, {
    thickness: o.thickness,
    padAngle: o.padAngle,
  }).map((arc) => {
    const valueText = o.valueFormat(arc.value);
    const percent = formatChartNumber(arc.share, o.locale, {
      style: "percent",
      maximumFractionDigits: 0,
    });
    return {
      ...arc,
      valueText,
      percent,
      summary: donutSegmentSummary(arc.label, valueText, percent),
    };
  });
  const total = donutTotal(o.segments);
  return {
    slices,
    drawn: slices.filter((s) => s.value > 0),
    total,
    totalText: o.valueFormat(total),
  };
}
