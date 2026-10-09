import { Directive, booleanAttribute, computed, input } from "@angular/core";

export type SoneStatGroupLayout = "grid" | "inline";

export type SoneStatVariant = "card" | "inset" | "plain";

export type SoneStatSize = "sm" | "md" | "lg";

export type SoneStatLabelPosition = "top" | "bottom";

/**
 * `dl[soneStatGroup]` — a row or grid of key figures. The `<dl>` keeps each
 * label paired with its value for screen readers; every `[soneStat]` inside is
 * a `<div>` that groups one `dt` with its `dd`s.
 */
@Directive({
  selector: "dl[soneStatGroup]",
  host: {
    "data-slot": "stat-group",
    "[attr.data-layout]": "layout()",
    "[attr.data-columns]": "cols()",
    "[attr.data-separated]": "separated() ? '' : null",
    "[style.--stat-columns]": "cols()",
  },
})
export class SoneStatGroupDirective {
  /** `grid` fills the width in equal tracks; `inline` is a wrapping row of figures. */
  readonly layout = input<SoneStatGroupLayout>("grid");

  /** A fixed number of grid columns; `null` (the default) auto-fits ~10rem tracks. */
  readonly columns = input<number | null>(null);

  /** Hairlines between the figures (a joined panel in `grid`, rules in `inline`). */
  readonly separated = input(false, { transform: booleanAttribute });

  protected readonly cols = computed(() => {
    const n = this.columns();
    return n !== null && Number.isFinite(n) && n >= 1 ? Math.floor(n) : null;
  });
}

/**
 * `div[soneStat]` — one figure: a `dt[soneStatLabel]`, a `dd[soneStatValue]` and
 * optional `dd[soneStatHint]` / `dd[soneStatTrend]`. The DOM keeps `dt` first;
 * `labelPosition="bottom"` only moves it visually. Set `--i` (`[style.--i]="$index"`)
 * to stagger the entry animation.
 */
@Directive({
  selector: "[soneStat]",
  host: {
    "data-slot": "stat",
    "[attr.data-variant]": "variant()",
    "[attr.data-size]": "size()",
    "[attr.data-label-position]": "labelPosition()",
  },
})
export class SoneStatDirective {
  readonly variant = input<SoneStatVariant>("card");

  readonly size = input<SoneStatSize>("md");

  /** Where the label sits visually; the DOM order (dt before dd) never changes. */
  readonly labelPosition = input<SoneStatLabelPosition>("top");
}

/** `dt[soneStatLabel]` — what the figure counts. */
@Directive({
  selector: "dt[soneStatLabel]",
  host: { "data-slot": "stat-label" },
})
export class SoneStatLabelDirective {}

/** `dd[soneStatValue]` — the figure itself, in tabular monospaced numerals. */
@Directive({
  selector: "dd[soneStatValue]",
  host: { "data-slot": "stat-value" },
})
export class SoneStatValueDirective {}

/** `dd[soneStatHint]` — a quiet line of context under the value. */
@Directive({
  selector: "dd[soneStatHint]",
  host: { "data-slot": "stat-hint" },
})
export class SoneStatHintDirective {}
