import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  input,
  signal,
  viewChildren,
} from "@angular/core";

import {
  chartColor,
  formatChartNumber,
  niceCeiling,
  scaleToPercent,
  type SoneChartTone,
} from "@surface-one/angular/chart-utils";

export interface SoneBarChartDatum {
  /** Stable identity (e.g. the ISO date). */
  readonly key: string;
  readonly value: number;
  /** The category as people read it (“Mar 3”); defaults to `key`. */
  readonly label?: string;
}

/** `baseline` — a zero draws a flat stub on the baseline; `gap` — it draws nothing. */
export type SoneBarChartZero = "baseline" | "gap";

export type SoneBarChartTick<T> = (datum: T, index: number) => string | null;
export type SoneBarChartTooltip<T> = (datum: T) => string;
export type SoneBarChartFormat = (value: number) => string;

const defaultFormat: SoneBarChartFormat = (n) => formatChartNumber(n);

/**
 * `<sone-bar-chart>` — a column chart for a short series (a day per bar). Bars are HTML
 * boxes, not a stretched SVG: crisp edges and real rounded corners at any width, and
 * hover, focus and tooltip positioning are plain CSS. One Tab stop with a roving focus
 * (Left/Right/Home/End); each bar is an image named by its tooltip, and a visually
 * hidden table carries the data for screen-reader browsing.
 */
@Component({
  selector: "sone-bar-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./bar-chart.component.html",
  styleUrl: "./bar-chart.component.scss",
  host: {
    "data-slot": "bar-chart",
    "[style.--_color]": "color()",
    "[attr.data-zero]": "zero()",
  },
})
export class SoneBarChartComponent<
  T extends SoneBarChartDatum = SoneBarChartDatum,
> {
  /** The bars, left to right (oldest first for a time series). */
  readonly data = input<readonly T[]>([]);

  /** The plot height in CSS pixels (ticks sit below it). */
  readonly height = input(132);

  /** The top of the value axis; defaults to `niceCeiling(values, 4)`. */
  readonly yMax = input<number | null | undefined>(undefined);

  /** The axis label under a bar, or `null` for none; no function, no axis row. */
  readonly tick = input<SoneBarChartTick<T> | null | undefined>(undefined);

  /** A bar's tooltip and accessible name; defaults to “label: value”. */
  readonly tooltip = input<SoneBarChartTooltip<T> | null | undefined>(
    undefined,
  );

  /** How a zero value draws: a flat stub (`baseline`) or nothing (`gap`). */
  readonly zero = input<SoneBarChartZero>("baseline");

  /** The bar colour. */
  readonly tone = input<SoneChartTone>("accent");

  /** Names the chart and captions its data table (“Meetings per day, last 30 days”). */
  readonly ariaLabel = input("");

  /** Formats values in the default tooltip and the data table. */
  readonly valueFormat = input<SoneBarChartFormat>(defaultFormat);

  /** The data table's category column header. */
  readonly categoryHeader = input($localize`Category`);

  /** The data table's value column header. */
  readonly valueHeader = input($localize`Value`);

  /** The bar under the pointer. */
  readonly hovered = signal<number | null>(null);
  /** The roving-focus bar; `null` = the last one (the newest day). */
  readonly active = signal<number | null>(null);
  readonly focusWithin = signal(false);
  readonly dismissed = signal(false);

  private readonly cols = viewChildren<ElementRef<HTMLElement>>("col");

  readonly color = computed(() => chartColor(this.tone()));

  readonly top = computed(() => {
    const y = this.yMax();
    return y !== null && y !== undefined && Number.isFinite(y) && y > 0
      ? y
      : niceCeiling(
          this.data().map((d) => d.value),
          4,
        );
  });

  readonly bars = computed(() => {
    const top = this.top();
    const tick = this.tick();
    const tooltip = this.tooltip();
    const format = this.valueFormat();
    return this.data().map((d, i) => {
      const label = d.label ?? d.key;
      return {
        key: d.key,
        label,
        value: format(d.value),
        pct: scaleToPercent(d.value, top),
        empty: !(d.value > 0),
        tick: tick ? tick(d, i) : null,
        tip: tooltip ? tooltip(d) : `${label}: ${format(d.value)}`,
      };
    });
  });

  readonly hasTicks = computed(() => !!this.tick());

  readonly current = computed(() => {
    const n = this.data().length;
    if (n === 0) return -1;
    const a = this.active();
    return a === null ? n - 1 : Math.min(Math.max(a, 0), n - 1);
  });

  /** The bar whose tooltip shows: the hovered one, else the focused one. */
  readonly shown = computed(() => {
    if (this.dismissed()) return null;
    const h = this.hovered();
    if (h !== null && h < this.data().length) return h;
    return this.focusWithin() ? this.current() : null;
  });

  readonly tip = computed(() => {
    const i = this.shown();
    const bars = this.bars();
    if (i === null || i < 0 || i >= bars.length) return null;
    const bar = bars[i];
    const n = bars.length;
    const mid = (i + 0.5) / n;
    const align = mid < 0.15 ? "start" : mid > 0.85 ? "end" : "center";
    const at = align === "start" ? i / n : align === "end" ? (i + 1) / n : mid;
    return { text: bar.tip, pct: bar.empty ? 0 : bar.pct, at: at * 100, align };
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
    const n = this.data().length;
    if (n === 0) return;
    if (event.key === "Escape") {
      if (this.shown() !== null) {
        this.dismissed.set(true);
        event.preventDefault();
      }
      return;
    }
    const host = event.currentTarget as HTMLElement;
    const rtl = getComputedStyle(host).direction === "rtl";
    const at = this.current();
    let to: number;
    switch (event.key) {
      case "ArrowLeft":
        to = at + (rtl ? 1 : -1);
        break;
      case "ArrowRight":
        to = at + (rtl ? -1 : 1);
        break;
      case "Home":
        to = 0;
        break;
      case "End":
        to = n - 1;
        break;
      default:
        return;
    }
    event.preventDefault();
    to = Math.min(Math.max(to, 0), n - 1);
    this.dismissed.set(false);
    this.hovered.set(null);
    this.active.set(to);
    this.cols()[to]?.nativeElement.focus();
  }
}
