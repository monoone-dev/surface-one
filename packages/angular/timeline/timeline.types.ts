export interface TimelineBlock {
  lane: string;
  startS: number;
  endS: number;
}

export interface TimelineChapter {
  label: string;
  startS: number;
  endS: number;
}

export interface TimelineData {
  blocks: TimelineBlock[];
  chapters: TimelineChapter[];
}

export interface TimelineLaneSuggestion {
  lane: string;
  label: string;
}

export interface TimelineLaneRename {
  oldLabel: string;
  newLabel: string;
}

export interface TimelineLegendLane {
  lane: string;
  hue: number;
  dot: string;
  totalS: number;
}

export interface TimelineChapterItem {
  label: string;
  startS: number;
  dot: string;
  order: number;
}

/**
 * One entry per categorical chart colour (`--chart-1` … `--chart-8` in
 * `@surface-one/tokens`), so lanes and chapters follow the skin and the colour
 * mode while staying distinguishable from each other. Every value is a CSS
 * colour expression (`var(--chart-N)` or a `color-mix()` of it): bind it to a
 * style, never parse it as a literal colour.
 */
export const TIMELINE_PALETTE: readonly {
  fill: string;
  topic: string;
  dot: string;
  edge: string;
}[] = Array.from({ length: 8 }, (_, i) => {
  const c = `var(--chart-${i + 1})`;
  return {
    fill: `color-mix(in oklch, ${c} 85%, transparent)`,
    topic: `color-mix(in oklch, ${c} 42%, transparent)`,
    dot: c,
    edge: `color-mix(in oklch, ${c} 70%, transparent)`,
  };
});

export function timelineHue(i: number): (typeof TIMELINE_PALETTE)[number] {
  return TIMELINE_PALETTE[i % TIMELINE_PALETTE.length];
}
