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

// Deliberately not theme tokens: these hues must stay distinguishable from
// each other, not follow the skin's accent.
export const TIMELINE_PALETTE: readonly {
  fill: string;
  topic: string;
  dot: string;
  edge: string;
}[] = [
  {
    fill: "hsl(244 90% 70% / 0.85)",
    topic: "hsl(244 80% 64% / 0.45)",
    dot: "hsl(244 90% 72%)",
    edge: "hsl(244 90% 80% / 0.7)",
  },
  {
    fill: "hsl(190 85% 58% / 0.82)",
    topic: "hsl(190 80% 52% / 0.42)",
    dot: "hsl(190 85% 60%)",
    edge: "hsl(190 85% 70% / 0.7)",
  },
  {
    fill: "hsl(330 85% 66% / 0.82)",
    topic: "hsl(330 78% 60% / 0.42)",
    dot: "hsl(330 85% 68%)",
    edge: "hsl(330 85% 78% / 0.7)",
  },
  {
    fill: "hsl(150 70% 52% / 0.8)",
    topic: "hsl(150 65% 46% / 0.4)",
    dot: "hsl(150 70% 56%)",
    edge: "hsl(150 70% 66% / 0.7)",
  },
  {
    fill: "hsl(38 92% 60% / 0.82)",
    topic: "hsl(38 88% 54% / 0.42)",
    dot: "hsl(38 92% 62%)",
    edge: "hsl(38 92% 72% / 0.7)",
  },
  {
    fill: "hsl(280 80% 70% / 0.82)",
    topic: "hsl(280 74% 64% / 0.42)",
    dot: "hsl(280 80% 72%)",
    edge: "hsl(280 80% 80% / 0.7)",
  },
  {
    fill: "hsl(8 88% 66% / 0.82)",
    topic: "hsl(8 82% 60% / 0.42)",
    dot: "hsl(8 88% 66%)",
    edge: "hsl(8 88% 76% / 0.7)",
  },
  {
    fill: "hsl(95 60% 56% / 0.8)",
    topic: "hsl(95 55% 50% / 0.4)",
    dot: "hsl(95 60% 58%)",
    edge: "hsl(95 60% 66% / 0.7)",
  },
];

export function timelineHue(i: number): (typeof TIMELINE_PALETTE)[number] {
  return TIMELINE_PALETTE[i % TIMELINE_PALETTE.length];
}
