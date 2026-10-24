import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
  booleanAttribute,
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
} from "./timeline.types";
import {
  type TimelineAxisTick,
  type TimelineChapterGeometry,
  type TimelineLabels,
  type TimelineLaneGeometry,
  timelineActiveBlocks,
  timelineActiveChapters,
  timelineChapterItems,
  timelineChapters,
  timelineClamp as clamp,
  timelineLanes,
  timelineSeekKey,
  timelineSpan,
  timelineTicks,
} from "./timeline-layout";

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
  readonly loading = input(false, { transform: booleanAttribute });
  readonly error = input(false, { transform: booleanAttribute });
  readonly needsGeneration = input(false, { transform: booleanAttribute });
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

  private readonly span = computed(() =>
    timelineSpan(this.data(), this.total()),
  );

  readonly lanes = computed<TimelineLaneGeometry[]>(() =>
    timelineLanes(this.data()?.blocks ?? [], this.span()),
  );

  readonly chapters = computed<TimelineChapterGeometry[]>(() =>
    timelineChapters(this.data()?.chapters ?? [], this.span()),
  );

  protected readonly chapterItems = computed<TimelineChapterItem[]>(() =>
    timelineChapterItems(this.chapters()),
  );

  readonly activeBlockOrders = computed<Set<number>>(() =>
    timelineActiveBlocks(this.lanes(), this.currentTime()),
  );

  readonly activeChapterOrders = computed<Set<number>>(() =>
    timelineActiveChapters(this.chapters(), this.currentTime()),
  );

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

  readonly ticks = computed<TimelineAxisTick[]>(() =>
    timelineTicks(this.span()),
  );

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
    const next = timelineSeekKey(event.key, this.currentTime(), this.span());
    if (next === null) return;
    event.preventDefault();
    this.seek.emit(next);
  }
}
