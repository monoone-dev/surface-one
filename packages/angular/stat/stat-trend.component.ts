import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from "@angular/core";

export type SoneStatTrendTone = "auto" | "positive" | "negative" | "neutral";

export type SoneStatTrendDirection = "up" | "down" | "flat";

/**
 * `dd[soneStatTrend]` — the change since the last period. `delta`'s sign picks the
 * arrow and, with `tone="auto"`, the colour (up = positive); set `tone` when up is
 * bad (costs, errors). The visible text is projected — write the magnitude
 * (`12%`); screen readers hear the direction first ("up 12%").
 */
@Component({
  selector: "dd[soneStatTrend]",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./stat-trend.component.html",
  host: {
    "data-slot": "stat-trend",
    "[attr.data-tone]": "resolvedTone()",
    "[attr.data-direction]": "direction()",
  },
})
export class SoneStatTrendComponent {
  /** The change; its sign sets the arrow. `null` hides the arrow. */
  readonly delta = input<number | null>(null);

  readonly tone = input<SoneStatTrendTone>("auto");

  readonly upLabel = input(
    $localize`:Read before a figure that went up, e.g. "up 12%":up`,
  );

  readonly downLabel = input(
    $localize`:Read before a figure that went down, e.g. "down 3%":down`,
  );

  readonly flatLabel = input(
    $localize`:Read before a figure that did not change, e.g. "unchanged 0%":unchanged`,
  );

  readonly direction = computed<SoneStatTrendDirection | null>(() => {
    const d = this.delta();
    if (d === null || d === undefined || !Number.isFinite(d)) return null;
    return d > 0 ? "up" : d < 0 ? "down" : "flat";
  });

  readonly resolvedTone = computed<Exclude<SoneStatTrendTone, "auto">>(() => {
    const tone = this.tone();
    if (tone !== "auto") return tone;
    const dir = this.direction();
    return dir === "up" ? "positive" : dir === "down" ? "negative" : "neutral";
  });

  protected readonly spoken = computed(() => {
    const dir = this.direction();
    if (dir === null) return "";
    return dir === "up"
      ? this.upLabel()
      : dir === "down"
        ? this.downLabel()
        : this.flatLabel();
  });
}
