import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
} from "@angular/core";

import {
  chartColor,
  formatChartNumber,
  scaleToPercent,
  type SoneChartTone,
} from "@surface-one/angular/chart-utils";
import { SoneBarListLabelDirective } from "./bar-list-label.directive";

export interface SoneBarListItem {
  /** Stable identity for `@for` tracking. */
  readonly key: string;
  /** The row's text (also what a custom label template replaces). */
  readonly label: string;
  readonly value: number;
  /** The shown value; defaults to `valueFormat(value)`. */
  readonly valueLabel?: string;
  /** The bar colour; defaults to `accent`. */
  readonly tone?: SoneChartTone;
  /** A native tooltip on the label, e.g. the full text of a truncated one. */
  readonly title?: string;
}

/** `max` — bars relative to the largest value; `total` — each bar is its share of the sum. */
export type SoneBarListScale = "max" | "total";

export type SoneBarListFormat = (value: number) => string;

const defaultFormat: SoneBarListFormat = (n) => formatChartNumber(n);

/**
 * `<sone-bar-list>` — a ranked list of labelled horizontal bars with the value written
 * next to each (Tremor's BarList). A real `<ul>`: every row reads as “label value”, the
 * bar itself is decoration.
 */
@Component({
  selector: "sone-bar-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  templateUrl: "./bar-list.component.html",
  styleUrl: "./bar-list.component.scss",
  host: {
    "data-slot": "bar-list",
    "[attr.data-scale]": "scale()",
  },
})
export class SoneBarListComponent<T extends SoneBarListItem = SoneBarListItem> {
  /** The rows, drawn in the order given (sort them yourself for a ranking). */
  readonly items = input<readonly T[]>([]);

  /** What a full bar means: the largest value (`max`) or the sum of all values (`total`). */
  readonly scale = input<SoneBarListScale>("max");

  /** A fixed full-bar value instead of the one `scale` computes (e.g. a quota). */
  readonly max = input<number | null | undefined>(undefined);

  /** Formats `value` when an item has no `valueLabel`; default: a localized number. */
  readonly valueFormat = input<SoneBarListFormat>(defaultFormat);

  /** Names the list (“Tokens by model”). */
  readonly ariaLabel = input<string | null>(null);

  readonly labelTemplate = contentChild(SoneBarListLabelDirective);

  readonly full = computed(() => {
    const fixed = this.max();
    if (fixed !== null && fixed !== undefined && Number.isFinite(fixed)) {
      return fixed;
    }
    const values = this.items()
      .map((i) => i.value)
      .filter((v) => Number.isFinite(v) && v > 0);
    return this.scale() === "total"
      ? values.reduce((a, b) => a + b, 0)
      : values.reduce((a, b) => Math.max(a, b), 0);
  });

  readonly rows = computed(() => {
    const full = this.full();
    const format = this.valueFormat();
    return this.items().map((item) => ({
      item,
      pct: scaleToPercent(item.value, full),
      text: item.valueLabel ?? format(item.value),
      color: chartColor(item.tone ?? "accent"),
    }));
  });
}

/** `imports: [SONE_BAR_LIST_PARTS]` — the list and its label template. */
export const SONE_BAR_LIST_PARTS = [
  SoneBarListComponent,
  SoneBarListLabelDirective,
] as const;
