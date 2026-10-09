import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

function unit(v: number): number {
  return Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : 0;
}

@Component({
  selector: "sone-level-meter",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "level-meter",
    "aria-hidden": "true",
    "[attr.data-mode]": 'history() ? "history" : "sway"',
    "[style.--level]": "clampedLevel()",
  },
  templateUrl: "./level-meter.component.html",
  styleUrl: "./level-meter.component.scss",
})
export class SoneLevelMeterComponent {
  /** The current input level, 0..1 — drives the synthetic sway. */
  readonly level = input(0);
  readonly bars = input(30);
  /**
   * Recent levels (0..1), oldest first. When set, each bar draws one real sample
   * (the newest at the end, missing ones as silence) instead of the sway.
   */
  readonly history = input<readonly number[] | null>(null);

  protected readonly clampedLevel = computed(() => unit(this.level()));
  protected readonly barIndexes = computed(() =>
    Array.from({ length: Math.max(0, Math.floor(this.bars())) }, (_, i) => i),
  );
  /** One value per bar, right-aligned to the newest sample; `null` in sway mode. */
  protected readonly samples = computed<number[] | null>(() => {
    const history = this.history();
    if (!history) return null;
    const count = this.barIndexes().length;
    const recent = history.slice(Math.max(0, history.length - count));
    return [
      ...Array.from({ length: count - recent.length }, () => 0),
      ...recent.map(unit),
    ];
  });
}
