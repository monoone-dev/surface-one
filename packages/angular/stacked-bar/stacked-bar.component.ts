import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";
import {
  SoneChartLegendComponent,
  type SoneChartLegendItem,
} from "@surface-one/angular/chart-legend";
import {
  chartColor,
  chartTone,
  formatChartNumber,
} from "@surface-one/angular/chart-utils";

export interface SoneStackedBarSegment {
  key: string;
  label: string;
  value: number;
  /** Segment colour (see `soneSwatch`); defaults to `chart-<n>` by position. */
  tone?: string;
}

export type SoneStackedBarSize = "sm" | "md" | "lg";

export type SoneStackedBarValueFn = (value: number) => string;

/**
 * `<sone-stacked-bar>` — one bar split into the parts of a whole (storage by
 * kind, checks by state). With `max` above the sum, the rest shows as the empty
 * track. The bar is `role="img"` named by a generated summary
 * ("Storage: Playback 4.2 GB (40%), …; 7.6 GB of 20 GB"); `valueLabel` formats
 * the values (bytes, durations), `locale` the numbers and percentages.
 */
@Component({
  selector: "sone-stacked-bar",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneChartLegendComponent],
  templateUrl: "./stacked-bar.component.html",
  styleUrl: "./stacked-bar.component.scss",
  host: {
    "data-slot": "stacked-bar",
    "[attr.data-size]": "size()",
  },
})
export class SoneStackedBarComponent {
  readonly segments = input<readonly SoneStackedBarSegment[]>([]);

  /** The whole the parts are measured against; `null` (default) = their sum. */
  readonly max = input<number | null>(null);

  /** What the bar measures ("Storage"); starts the spoken summary. */
  readonly ariaLabel = input<string | null>(null);

  readonly showLegend = input(false, { transform: booleanAttribute });

  readonly size = input<SoneStackedBarSize>("md");

  /** Locale for numbers and percentages; defaults to the active `$localize` locale. */
  readonly locale = input<string | null>(null);

  /** Formats one value for the summary and the legend; default: a localized number. */
  readonly valueLabel = input<SoneStackedBarValueFn | null>(null);

  readonly emptyLabel = input(
    $localize`:Stacked bar with nothing to show:No data`,
  );

  private readonly format = computed<SoneStackedBarValueFn>(() => {
    const custom = this.valueLabel();
    const locale = this.locale();
    return custom ?? ((v: number) => formatChartNumber(v, locale));
  });

  private readonly parts = computed(() =>
    this.segments()
      .map((s, i) => ({
        ...s,
        value: Number.isFinite(s.value) ? Math.max(0, s.value) : 0,
        tone: s.tone || chartTone(i),
      }))
      .filter((s) => s.value > 0),
  );

  readonly total = computed(() =>
    this.parts().reduce((sum, s) => sum + s.value, 0),
  );

  /** What 100% of the track stands for. */
  private readonly scale = computed(() => {
    const max = this.max();
    const total = this.total();
    return max !== null && Number.isFinite(max) && max > total ? max : total;
  });

  protected readonly geometry = computed(() => {
    const scale = this.scale();
    if (scale <= 0) return [];
    const parts = this.parts();
    let run = 0;
    return parts.map((s, i) => {
      run += s.value;
      return {
        key: s.key,
        end: Math.min(100, (run / scale) * 100),
        color: chartColor(s.tone),
        z: parts.length - i,
        gap: i < parts.length - 1,
      };
    });
  });

  protected readonly legendItems = computed<SoneChartLegendItem[]>(() => {
    const format = this.format();
    return this.segments().map((s, i) => ({
      key: s.key,
      label: s.label,
      tone: s.tone || chartTone(i),
      value: format(Number.isFinite(s.value) ? Math.max(0, s.value) : 0),
    }));
  });

  readonly summary = computed(() => {
    const label = (this.ariaLabel() ?? "").trim();
    const prefix = label ? `${label}: ` : "";
    const parts = this.parts();
    const scale = this.scale();
    if (parts.length === 0 || scale <= 0) return prefix + this.emptyLabel();
    const format = this.format();
    const locale = this.locale();
    const pct = (v: number) =>
      formatChartNumber(v / scale, locale, {
        style: "percent",
        maximumFractionDigits: 0,
      });
    const list = parts
      .map(
        (s) =>
          $localize`:One part of a stacked bar, e.g. "Playback 4.2 GB (40%)":${s.label}:label: ${format(s.value)}:value: (${pct(s.value)}:percent:)`,
      )
      .join(", ");
    const max = this.max();
    const total = format(this.total());
    const whole =
      max !== null && Number.isFinite(max) && max > 0
        ? $localize`:Stacked bar total against its maximum, e.g. "7.6 GB of 20 GB":${total}:total: of ${format(max)}:max:`
        : $localize`:Stacked bar total, e.g. "7.6 GB in total":${total}:total: in total`;
    return `${prefix}${list}; ${whole}`;
  });
}
