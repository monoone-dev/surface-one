// The timeline's geometry, with no framework in it: `sone-timeline` and the Vue and
// React twins (through @surface-one/core) lay lanes, chapters and ticks out the same way.
import { clockTime } from "@surface-one/angular/format";

import {
  type TimelineBlock,
  type TimelineChapter,
  type TimelineChapterItem,
  type TimelineData,
  type TimelineLegendLane,
  TIMELINE_PALETTE,
  timelineHue,
} from "./timeline.types";

/** The built-in strings of a timeline; `labels` overrides any of them. */
export interface TimelineLabels {
  title: string;
  description: string;
  lanes: string;
  chapters: string;
  chaptersHint: string;
  seekAxis: string;
  seekLanes: string;
  seekChapters: string;
  loading: string;
  needsGeneration: string;
  generate: string;
  unavailable: string;
  retry: string;
  pin: string;
  laneName: string;
}

/** One speaker block, placed on its lane in percent of the span. */
export interface TimelineBlockGeometry {
  lane: string;
  startS: number;
  endS: number;
  left: number;
  width: number;
  fill: string;
  edge: string;
  order: number;
}

export interface TimelineLaneGeometry extends TimelineLegendLane {
  blocks: TimelineBlockGeometry[];
}

/** One chapter on the ribbon, in percent of the span; `narrow` ones hide their label. */
export interface TimelineChapterGeometry {
  label: string;
  startS: number;
  endS: number;
  left: number;
  width: number;
  hue: number;
  fill: string;
  edge: string;
  order: number;
  narrow: boolean;
}

export interface TimelineAxisTick {
  pct: number;
  label: string;
}

/** Where a timeline stands: what the host's `data-state` says. */
export type TimelineState =
  "loading" | "needs-generation" | "unavailable" | "ready";

export function timelineClamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

/** The first hue index for each distinct name, in order of appearance. */
function hueIndex(names: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const n of names) {
    if (!map.has(n)) map.set(n, map.size % TIMELINE_PALETTE.length);
  }
  return map;
}

/**
 * The seconds the axis spans: `total`, or a little past the last block or chapter
 * when the content ends well before it (or `total` is unknown).
 */
export function timelineSpan(
  data: TimelineData | null | undefined,
  total: number,
): number {
  let content = 0;
  for (const b of data?.blocks ?? []) content = Math.max(content, b.endS);
  for (const c of data?.chapters ?? []) content = Math.max(content, c.endS);
  if (content <= 0) return total;
  if (total <= 0) return content * 1.06;
  if (content >= total * 0.9) return total;
  return Math.min(total, content * 1.06);
}

/** The speaker lanes, each with its colour, talk time and placed blocks. */
export function timelineLanes(
  blocks: readonly TimelineBlock[],
  span: number,
): TimelineLaneGeometry[] {
  if (blocks.length === 0 || span <= 0) return [];
  const hues = hueIndex(blocks.map((b) => b.lane));
  const byLane = new Map<string, TimelineLaneGeometry>();
  let order = 0;
  for (const b of blocks) {
    const start = timelineClamp(b.startS, 0, span);
    const end = timelineClamp(b.endS, start, span);
    const hue = hues.get(b.lane) ?? 0;
    let lane = byLane.get(b.lane);
    if (!lane) {
      lane = {
        lane: b.lane,
        hue,
        dot: timelineHue(hue).dot,
        totalS: 0,
        blocks: [],
      };
      byLane.set(b.lane, lane);
    }
    lane.totalS += Math.max(0, b.endS - b.startS);
    lane.blocks.push({
      lane: b.lane,
      startS: b.startS,
      endS: b.endS,
      left: (start / span) * 100,
      width: Math.max(0.4, ((end - start) / span) * 100),
      fill: timelineHue(hue).fill,
      edge: timelineHue(hue).edge,
      order: order++,
    });
  }
  return [...byLane.values()];
}

/** The chapters on the ribbon. */
export function timelineChapters(
  spans: readonly TimelineChapter[],
  span: number,
): TimelineChapterGeometry[] {
  if (spans.length === 0 || span <= 0) return [];
  const hues = hueIndex(spans.map((s) => s.label));
  return spans.map((s, i) => {
    const start = timelineClamp(s.startS, 0, span);
    const end = timelineClamp(s.endS, start, span);
    const width = Math.max(1, ((end - start) / span) * 100);
    const hue = hues.get(s.label) ?? 0;
    return {
      label: s.label,
      startS: s.startS,
      endS: s.endS,
      left: (start / span) * 100,
      width,
      hue,
      fill: timelineHue(hue).topic,
      edge: timelineHue(hue).edge,
      order: i,
      narrow: width < 8,
    };
  });
}

/** The chapter list's buttons. */
export function timelineChapterItems(
  chapters: readonly TimelineChapterGeometry[],
): TimelineChapterItem[] {
  return chapters.map((c) => ({
    label: c.label,
    startS: c.startS,
    dot: timelineHue(c.hue).dot,
    order: c.order,
  }));
}

/** The `order`s of the blocks under the playhead. */
export function timelineActiveBlocks(
  lanes: readonly TimelineLaneGeometry[],
  time: number,
): Set<number> {
  const out = new Set<number>();
  for (const lane of lanes) {
    for (const blk of lane.blocks) {
      if (time >= blk.startS && time < blk.endS) out.add(blk.order);
    }
  }
  return out;
}

/** The `order`s of the chapters under the playhead. */
export function timelineActiveChapters(
  chapters: readonly TimelineChapterGeometry[],
  time: number,
): Set<number> {
  const out = new Set<number>();
  for (const c of chapters) {
    if (time >= c.startS && time < c.endS) out.add(c.order);
  }
  return out;
}

/** The axis ticks: 4 steps for a minute or more, else 3. */
export function timelineTicks(span: number): TimelineAxisTick[] {
  if (span <= 0) return [];
  const steps = span >= 60 ? 4 : 3;
  const out: TimelineAxisTick[] = [];
  for (let i = 0; i <= steps; i++) {
    out.push({ pct: (i / steps) * 100, label: clockTime((span * i) / steps) });
  }
  return out;
}

/** What `seek` emits for an arrow / Home / End key on a seek slider, or `null`. */
export function timelineSeekKey(
  key: string,
  current: number,
  span: number,
): number | null {
  if (span <= 0) return null;
  const cur = timelineClamp(current, 0, span);
  switch (key) {
    case "ArrowLeft":
      return Math.max(0, cur - 5);
    case "ArrowRight":
      return Math.min(span, cur + 5);
    case "Home":
      return 0;
    case "End":
      return span;
    default:
      return null;
  }
}

/** `4:05` or `4:05–6:10` (the `clock` pipe). */
export function timelineClock(seconds: number, until?: number | null): string {
  return until === undefined
    ? clockTime(seconds)
    : `${clockTime(seconds)}–${clockTime(until)}`;
}
