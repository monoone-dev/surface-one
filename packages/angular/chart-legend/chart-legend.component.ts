import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from "@angular/core";
import { chartTone, formatChartNumber } from "@surface-one/angular/chart-utils";

import { SoneSwatchDirective, type SoneSwatchShape } from "./swatch.directive";

export interface SoneChartLegendItem {
  /** Stable id of the series; what `hidden` and `toggle` carry. */
  key: string;
  label: string;
  /** Swatch colour (see `soneSwatch`); defaults to `chart-<n>` by position. */
  tone?: string;
  /** Shown after the label; numbers are formatted for `locale`. */
  value?: string | number | null;
}

export type SoneChartLegendOrientation = "row" | "column";

/**
 * `<sone-chart-legend>` — the key of a chart: a swatch, a label and an optional
 * value per series. `toggleable` turns every item into a toggle button
 * (`aria-pressed` = the series is shown) that updates `hidden` (two-way) and
 * emits `toggle` with the item's key.
 */
@Component({
  selector: "sone-chart-legend",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneSwatchDirective],
  templateUrl: "./chart-legend.component.html",
  styleUrl: "./chart-legend.component.scss",
  host: {
    "data-slot": "chart-legend",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-toggleable]": "toggleable() ? '' : null",
  },
})
export class SoneChartLegendComponent {
  readonly items = input<readonly SoneChartLegendItem[]>([]);

  readonly orientation = input<SoneChartLegendOrientation>("row");

  readonly toggleable = input(false, { transform: booleanAttribute });

  /** Keys of the series that are switched off. */
  readonly hidden = model<readonly string[]>([]);

  readonly shape = input<SoneSwatchShape>("dot");

  /** Names the list (e.g. "Series"); optional. */
  readonly ariaLabel = input<string | null>(null);

  /** Locale for numeric values; defaults to the active `$localize` locale. */
  readonly locale = input<string | null>(null);

  /** The key of the item the user toggled. */
  readonly toggle = output<string>();

  protected readonly rows = computed(() => {
    const hidden = new Set(this.hidden());
    const locale = this.locale();
    return this.items().map((item, i) => ({
      key: item.key,
      label: item.label,
      tone: item.tone || chartTone(i),
      value:
        item.value === null || item.value === undefined || item.value === ""
          ? null
          : typeof item.value === "number"
            ? formatChartNumber(item.value, locale)
            : item.value,
      hidden: hidden.has(item.key),
    }));
  });

  protected onToggle(key: string): void {
    const current = this.hidden();
    this.hidden.set(
      current.includes(key)
        ? current.filter((k) => k !== key)
        : [...current, key],
    );
    this.toggle.emit(key);
  }
}
