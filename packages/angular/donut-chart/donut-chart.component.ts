import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  computed,
  input,
  numberAttribute,
  signal,
  viewChildren,
} from "@angular/core";
import { SoneChartLegendComponent } from "@surface-one/angular/chart-legend";
import {
  barChartCurrent,
  barChartShown,
  chartColor,
  donutChartModel,
  formatChartNumber,
  type SoneDonutChartSegmentLike,
} from "@surface-one/angular/chart-utils";
import { listNavigationIndex } from "@surface-one/angular/core";
import { activeLocale } from "@surface-one/angular/format";

/** A segment of a donut chart: `{ key, label, value, tone }`. */
export type SoneDonutChartSegment = SoneDonutChartSegmentLike;
export type SoneDonutChartFormat = (value: number) => string;

const defaultFormat: SoneDonutChartFormat = (n) => formatChartNumber(n);

/**
 * `<sone-donut-chart>` — the parts of a whole as a ring (shadcn/ui Pie Chart, donut with
 * text): one segment per part, clockwise from 12 o'clock, the total (or the hovered or
 * focused segment) in the centre and a legend. One Tab stop with a roving focus over the
 * segments (arrow keys, Home/End, Escape returns the centre to the total); each segment is
 * an image named “Chrome: 275 (39%)”, and a visually hidden table carries the data.
 */
@Component({
  selector: "sone-donut-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneChartLegendComponent],
  templateUrl: "./donut-chart.component.html",
  styleUrl: "./donut-chart.component.scss",
  host: { "data-slot": "donut-chart" },
})
export class SoneDonutChartComponent {
  /** The parts, clockwise from 12 o'clock; zero and negative values draw nothing. */
  readonly segments = input<readonly SoneDonutChartSegment[]>([]);
  /** The ring's diameter in CSS pixels (it shrinks to fit a narrower container). */
  readonly size = input(200, { transform: numberAttribute });
  /** The ring's width as a part of its radius: 0.3 by default, 1 draws a pie. */
  readonly thickness = input(0.3, { transform: numberAttribute });
  /** The gap between neighbouring segments, in degrees. */
  readonly padAngle = input(1, { transform: numberAttribute });
  /** The caption under the centre value. */
  readonly label = input($localize`Total`);
  /** The centre value at rest; default: the formatted total. */
  readonly centerValue = input<string | null>(null);
  /** Shows the legend under the ring. */
  readonly legend = input(true, { transform: booleanAttribute });
  /** Names the chart and captions its data table (“Visitors by browser”). */
  readonly ariaLabel = input("");
  /** Formats values in the centre, the names and the data table. */
  readonly valueFormat = input<SoneDonutChartFormat>(defaultFormat);
  /** The data table's column headers. */
  readonly categoryHeader = input($localize`Category`);
  readonly valueHeader = input($localize`Value`);
  readonly shareHeader = input($localize`Share`);

  /** The segment under the pointer (an index into the drawn segments). */
  readonly hovered = signal<number | null>(null);
  /** The roving-focus segment; `null` = the first one. */
  readonly active = signal<number | null>(null);
  readonly focusWithin = signal(false);
  readonly dismissed = signal(false);

  private readonly segs = viewChildren<ElementRef<SVGPathElement>>("seg");

  readonly model = computed(() =>
    donutChartModel({
      segments: this.segments(),
      thickness: this.thickness(),
      padAngle: this.padAngle(),
      locale: activeLocale(),
      valueFormat: this.valueFormat(),
    }),
  );

  protected readonly drawn = computed(() =>
    this.model().drawn.map((s) => ({ ...s, color: chartColor(s.tone) })),
  );

  protected readonly legendItems = computed(() =>
    this.model().slices.map((s) => ({
      key: s.key,
      label: s.label,
      tone: s.tone,
      value: s.valueText,
    })),
  );

  /** A pie has no hole to write in. */
  protected readonly showCenter = computed(() => this.thickness() < 0.75);

  readonly current = computed(() =>
    this.active() === null
      ? Math.min(0, this.drawn().length - 1)
      : barChartCurrent(this.drawn().length, this.active()),
  );

  /** The segment the centre speaks of: the hovered one, else the focused one. */
  readonly shown = computed(() =>
    barChartShown({
      count: this.drawn().length,
      hovered: this.hovered(),
      current: this.current(),
      focusWithin: this.focusWithin(),
      dismissed: this.dismissed(),
    }),
  );

  protected readonly center = computed(() => {
    const i = this.shown();
    const slice = i === null ? null : this.drawn()[i];
    if (slice) return { value: slice.valueText, label: slice.label };
    return {
      value: this.centerValue() ?? this.model().totalText,
      label: this.label(),
    };
  });

  onPointerEnter(i: number): void {
    this.dismissed.set(false);
    this.hovered.set(i);
  }

  onFocusIn(i: number): void {
    this.active.set(i);
    this.focusWithin.set(true);
  }

  onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const host = event.currentTarget as Element;
    if (!next || !host.contains(next)) {
      this.focusWithin.set(false);
      this.dismissed.set(false);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const n = this.drawn().length;
    if (n === 0) return;
    if (event.key === "Escape") {
      if (this.shown() !== null) {
        this.dismissed.set(true);
        event.preventDefault();
      }
      return;
    }
    // Around the ring: Right/Down go clockwise, Left/Up back.
    const key =
      event.key === "ArrowDown"
        ? "ArrowRight"
        : event.key === "ArrowUp"
          ? "ArrowLeft"
          : event.key;
    const to = listNavigationIndex(key, this.current(), n, {
      orientation: "horizontal",
      rtl: false,
      wrap: true,
    });
    if (to === null) return;
    event.preventDefault();
    this.dismissed.set(false);
    this.hovered.set(null);
    this.active.set(to);
    this.segs()[to]?.nativeElement.focus();
  }
}
