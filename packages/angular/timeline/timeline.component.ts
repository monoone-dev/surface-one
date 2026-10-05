import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from "@angular/core";
import { SoneClockPipe, clockTime } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSkeletonDirective } from "@surface-one/angular/skeleton";
import { SONE_CARD_PARTS } from "@surface-one/angular/card";
import { SoneTimelineChaptersComponent } from "./timeline-chapters/timeline-chapters.component";
import { SoneTimelineLegendComponent } from "./timeline-legend/timeline-legend.component";
import {
  type TimelineChapterItem,
  type TimelineData,
  type TimelineLaneRename,
  type TimelineLaneSuggestion,
  type TimelineLegendLane,
  TIMELINE_PALETTE,
  timelineHue,
} from "./timeline.types";

interface BlockGeometry {
  lane: string;
  startS: number;
  endS: number;
  left: number;
  width: number;
  fill: string;
  edge: string;
  order: number;
}

interface LaneGeometry extends TimelineLegendLane {
  blocks: BlockGeometry[];
}

interface ChapterGeometry {
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

interface AxisTick {
  pct: number;
  label: string;
}

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

const DEFAULT_LABELS: TimelineLabels = {
  title: $localize`:Card title:Timeline`,
  description: $localize`Who spoke when & what was discussed`,
  lanes: $localize`Speakers`,
  chapters: $localize`Topics`,
  chaptersHint: $localize`Jump to a chapter`,
  seekAxis: $localize`Seek timeline`,
  seekLanes: $localize`Seek speaker timeline`,
  seekChapters: $localize`Seek topic timeline`,
  loading: $localize`Analysing speakers & topics…`,
  needsGeneration: $localize`Speaker & topic timeline runs an on-device model`,
  generate: $localize`Generate timeline`,
  unavailable: $localize`Timeline unavailable`,
  retry: $localize`:verb|Button that retries loading the timeline:Retry`,
  pin: $localize`Pin moment`,
  laneName: $localize`Speaker name`,
};

@Component({
  selector: "sone-timeline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SoneClockPipe,
    ...SONE_CARD_PARTS,
    SoneButtonDirective,
    SoneSkeletonDirective,
    SoneTimelineLegendComponent,
    SoneTimelineChaptersComponent,
  ],
  host: {
    "data-slot": "timeline",
    "[attr.data-state]": "state()",
  },
  templateUrl: "./timeline.component.html",
  styleUrl: "./timeline.component.scss",
})
export class SoneTimelineComponent {
  readonly data = input<TimelineData | null>(null);
  readonly total = input(0);
  readonly currentTime = input(0);
  protected readonly pinLabel = computed(
    () => $localize`Pin this moment at ${clockTime(this.currentTime())}:time:`,
  );
  readonly loading = input(false);
  readonly error = input(false);
  readonly needsGeneration = input(false);
  readonly suggestions = input<TimelineLaneSuggestion[]>([]);
  readonly labels = input<Partial<TimelineLabels>>({});

  readonly seek = output<number>();
  readonly retry = output<void>();
  readonly generate = output<void>();
  readonly pin = output<number>();
  readonly renameLane = output<TimelineLaneRename>();

  protected readonly text = computed<TimelineLabels>(() => ({
    ...DEFAULT_LABELS,
    ...this.labels(),
  }));

  readonly hoverPct = signal<number | null>(null);
  protected readonly hoverLabel = computed(() => {
    const pct = this.hoverPct();
    return pct === null ? "" : clockTime((pct / 100) * this.span());
  });

  protected readonly skeletonBars = [
    { left: 1, width: 18 },
    { left: 22, width: 30 },
    { left: 55, width: 14 },
    { left: 72, width: 26 },
  ];
  protected readonly skeletonRibbon = [
    { left: 1, width: 34 },
    { left: 38, width: 24 },
    { left: 64, width: 35 },
  ];

  private readonly contentEnd = computed(() => {
    const d = this.data();
    let max = 0;
    for (const b of d?.blocks ?? []) max = Math.max(max, b.endS);
    for (const c of d?.chapters ?? []) max = Math.max(max, c.endS);
    return max;
  });

  private readonly span = computed(() => {
    const total = this.total();
    const content = this.contentEnd();
    if (content <= 0) return total;
    if (total <= 0) return content * 1.06;
    if (content >= total * 0.9) return total;
    return Math.min(total, content * 1.06);
  });

  readonly lanes = computed<LaneGeometry[]>(() => {
    const blocks = this.data()?.blocks ?? [];
    const total = this.span();
    if (blocks.length === 0 || total <= 0) return [];
    const hues = hueIndex(blocks.map((b) => b.lane));
    const byLane = new Map<string, LaneGeometry>();
    let order = 0;
    for (const b of blocks) {
      const start = clamp(b.startS, 0, total);
      const end = clamp(b.endS, start, total);
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
        left: (start / total) * 100,
        width: Math.max(0.4, ((end - start) / total) * 100),
        fill: timelineHue(hue).fill,
        edge: timelineHue(hue).edge,
        order: order++,
      });
    }
    return [...byLane.values()];
  });

  readonly chapters = computed<ChapterGeometry[]>(() => {
    const spans = this.data()?.chapters ?? [];
    const total = this.span();
    if (spans.length === 0 || total <= 0) return [];
    const hues = hueIndex(spans.map((s) => s.label));
    return spans.map((s, i) => {
      const start = clamp(s.startS, 0, total);
      const end = clamp(s.endS, start, total);
      const width = Math.max(1, ((end - start) / total) * 100);
      const hue = hues.get(s.label) ?? 0;
      return {
        label: s.label,
        startS: s.startS,
        endS: s.endS,
        left: (start / total) * 100,
        width,
        hue,
        fill: timelineHue(hue).topic,
        edge: timelineHue(hue).edge,
        order: i,
        narrow: width < 8,
      };
    });
  });

  protected readonly chapterItems = computed<TimelineChapterItem[]>(() =>
    this.chapters().map((c) => ({
      label: c.label,
      startS: c.startS,
      dot: timelineHue(c.hue).dot,
      order: c.order,
    })),
  );

  readonly activeBlockOrders = computed<Set<number>>(() => {
    const t = this.currentTime();
    const out = new Set<number>();
    for (const lane of this.lanes()) {
      for (const blk of lane.blocks) {
        if (t >= blk.startS && t < blk.endS) out.add(blk.order);
      }
    }
    return out;
  });

  readonly activeChapterOrders = computed<Set<number>>(() => {
    const t = this.currentTime();
    const out = new Set<number>();
    for (const c of this.chapters()) {
      if (t >= c.startS && t < c.endS) out.add(c.order);
    }
    return out;
  });

  readonly ready = computed(
    () =>
      !this.loading() &&
      (this.lanes().length > 0 || this.chapters().length > 0),
  );

  readonly unavailable = computed(
    () =>
      !this.loading() &&
      !this.needsGeneration() &&
      (this.error() ||
        (this.lanes().length === 0 && this.chapters().length === 0)),
  );

  protected readonly state = computed(() => {
    if (this.loading()) return "loading";
    if (this.needsGeneration()) return "needs-generation";
    if (this.unavailable()) return "unavailable";
    return "ready";
  });

  readonly ticks = computed<AxisTick[]>(() => {
    const total = this.span();
    if (total <= 0) return [];
    const steps = total >= 60 ? 4 : 3;
    const out: AxisTick[] = [];
    for (let i = 0; i <= steps; i++) {
      out.push({
        pct: (i / steps) * 100,
        label: clockTime((total * i) / steps),
      });
    }
    return out;
  });

  readonly playheadPct = computed(() => {
    const total = this.span();
    return total <= 0 ? 0 : clamp((this.currentTime() / total) * 100, 0, 100);
  });

  readonly showPlayhead = computed(
    () => this.ready() && this.currentTime() > 0,
  );

  protected readonly totalRounded = computed(() => Math.round(this.span()));
  protected readonly currentRounded = computed(() =>
    Math.round(clamp(this.currentTime(), 0, this.span())),
  );

  protected onBlock(event: MouseEvent, startS: number): void {
    event.stopPropagation();
    this.seek.emit(startS);
  }

  protected seekFromTrack(event: MouseEvent): void {
    const total = this.span();
    if (total <= 0) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (rect.width <= 0) return;
    this.seek.emit(
      clamp((event.clientX - rect.left) / rect.width, 0, 1) * total,
    );
  }

  protected onScrubMove(event: MouseEvent): void {
    if (this.span() <= 0) return;
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    if (rect.width <= 0) return;
    this.hoverPct.set(
      clamp(((event.clientX - rect.left) / rect.width) * 100, 0, 100),
    );
  }

  protected onScrubLeave(): void {
    this.hoverPct.set(null);
  }

  protected onPin(event: MouseEvent): void {
    event.stopPropagation();
    this.pin.emit(Math.max(0, this.currentTime()));
  }

  protected onAxisKey(event: KeyboardEvent): void {
    const total = this.span();
    if (total <= 0) return;
    const cur = clamp(this.currentTime(), 0, total);
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = Math.max(0, cur - 5);
        break;
      case "ArrowRight":
        next = Math.min(total, cur + 5);
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = total;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.seek.emit(next);
  }
}

function hueIndex(names: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const n of names) {
    if (!map.has(n)) map.set(n, map.size % TIMELINE_PALETTE.length);
  }
  return map;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}
