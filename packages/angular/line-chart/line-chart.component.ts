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
import {
  SoneChartLegendComponent,
  SoneSwatchDirective,
} from "@surface-one/angular/chart-legend";
import {
  barChartCurrent,
  barChartShown,
  chartColor,
  formatChartNumber,
  lineChartModel,
  lineChartTip,
  type SoneChartX,
  type SoneLineChartCurve,
  type SoneLineChartSeriesLike,
  type SoneLineChartXScale,
} from "@surface-one/angular/chart-utils";
import { listNavigationIndex } from "@surface-one/angular/core";
import { activeLocale } from "@surface-one/angular/format";

/** A series of a line or area chart: the row key of its values, its name and colour. */
export type SoneLineChartSeries = SoneLineChartSeriesLike;

export type SoneLineChartXFormat = (x: SoneChartX, index: number) => string;
export type SoneLineChartFormat = (value: number) => string;

const optionalNumber = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : numberAttribute(v);

const defaultFormat: SoneLineChartFormat = (n) => formatChartNumber(n);

/**
 * `<sone-line-chart>` — one or more series over categories or time (shadcn/ui Line Chart):
 * a value axis with round ticks and grid lines, straight or smoothed (`curve="smooth"`,
 * monotone) lines that break at a missing value, dots, a legend and a tooltip. `area`
 * fills under the lines and `stacked` stacks them (what `<sone-area-chart>` draws). One Tab
 * stop with a roving focus over the x values (Left/Right/Home/End, Escape hides the
 * tooltip); each is an image named by its values, and a visually hidden table carries the
 * data for screen-reader browsing.
 */
@Component({
  selector: "sone-line-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneChartLegendComponent, SoneSwatchDirective],
  templateUrl: "./line-chart.component.html",
  styleUrl: "./line-chart.component.scss",
  host: {
    "data-slot": "line-chart",
    "[attr.data-area]": "area() ? '' : null",
  },
})
export class SoneLineChartComponent<T = Record<string, unknown>> {
  /** The rows, left to right: each holds the x value (`xKey`) and one value per series. */
  readonly data = input<readonly T[]>([]);
  /** The series: `{ key, label, tone }`, `key` naming the row property of its values. */
  readonly series = input<readonly SoneLineChartSeries[]>([]);
  /** The row property of the x value. */
  readonly xKey = input("x");
  /** `category` — evenly spaced; `time` — spaced by date (`Date`, epoch ms or ISO string). */
  readonly xScale = input<SoneLineChartXScale>("category");
  /** The label of an x value (axis, tooltip, table); default: the text, or a short date. */
  readonly xFormat = input<SoneLineChartXFormat | null>(null);
  /** At most this many x-axis labels (stepped back from the last one); 0 hides the axis. */
  readonly xTicks = input(6, { transform: numberAttribute });
  /** About this many value-axis steps. */
  readonly yTicks = input(4, { transform: numberAttribute });
  /** The bottom of the value axis; default: 0, or the lowest value when negative. */
  readonly yMin = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** The top of the value axis; default: a round step above the highest value. */
  readonly yMax = input<number | null, unknown>(null, {
    transform: optionalNumber,
  });
  /** The plot height in CSS pixels (the x labels sit below it). */
  readonly height = input(200, { transform: numberAttribute });
  /** `linear` — straight segments; `smooth` — a monotone curve. */
  readonly curve = input<SoneLineChartCurve>("linear");
  /** Fills under each line. */
  readonly area = input(false, { transform: booleanAttribute });
  /** Stacks the series on one another (with `area`, each fills down to the one below). */
  readonly stacked = input(false, { transform: booleanAttribute });
  /** Draws a dot on every value (the hovered or focused x value always shows its dots). */
  readonly dots = input(true, { transform: booleanAttribute });
  /** Shows the legend under the plot. */
  readonly legend = input(true, { transform: booleanAttribute });
  /** Names the chart and captions its data table (“Visitors, January to June”). */
  readonly ariaLabel = input("");
  /** Formats values on the axis, in the tooltip and in the data table. */
  readonly valueFormat = input<SoneLineChartFormat>(defaultFormat);
  /** The data table's category column header. */
  readonly categoryHeader = input($localize`Category`);

  /** The x value under the pointer. */
  readonly hovered = signal<number | null>(null);
  /** The roving-focus x value; `null` = the last one. */
  readonly active = signal<number | null>(null);
  readonly focusWithin = signal(false);
  readonly dismissed = signal(false);

  private readonly cols = viewChildren<ElementRef<HTMLElement>>("col");

  readonly model = computed(() =>
    lineChartModel({
      data: this.data(),
      series: this.series(),
      xKey: this.xKey(),
      xScale: this.xScale(),
      xFormat: this.xFormat(),
      xTicks: this.xTicks(),
      yTicks: this.yTicks(),
      yMin: this.yMin(),
      yMax: this.yMax(),
      curve: this.curve(),
      area: this.area(),
      stacked: this.stacked(),
      locale: activeLocale(),
      valueFormat: this.valueFormat(),
    }),
  );

  protected readonly paths = computed(() =>
    this.model().paths.map((p) => ({ ...p, color: chartColor(p.tone) })),
  );

  protected readonly legendItems = computed(() =>
    this.model().paths.map((p) => ({
      key: p.key,
      label: p.label,
      tone: p.tone,
    })),
  );

  readonly current = computed(() =>
    barChartCurrent(this.model().columns.length, this.active()),
  );

  /** The x value whose tooltip shows: the hovered one, else the focused one. */
  readonly shown = computed(() =>
    barChartShown({
      count: this.model().columns.length,
      hovered: this.hovered(),
      current: this.current(),
      focusWithin: this.focusWithin(),
      dismissed: this.dismissed(),
    }),
  );

  readonly tip = computed(() => {
    const i = this.shown();
    if (i === null) return null;
    const col = this.model().columns[i];
    return col ? { ...lineChartTip(col.x), column: col } : null;
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
    const host = event.currentTarget as HTMLElement;
    if (!next || !host.contains(next)) {
      this.focusWithin.set(false);
      this.dismissed.set(false);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const n = this.model().columns.length;
    if (n === 0) return;
    if (event.key === "Escape") {
      if (this.shown() !== null) {
        this.dismissed.set(true);
        event.preventDefault();
      }
      return;
    }
    // The plot runs left to right in every writing direction (a time axis does not flip).
    const to = listNavigationIndex(event.key, this.current(), n, {
      orientation: "horizontal",
      rtl: false,
      wrap: false,
    });
    if (to === null) return;
    event.preventDefault();
    this.dismissed.set(false);
    this.hovered.set(null);
    this.active.set(to);
    this.cols()[to]?.nativeElement.focus();
  }
}
