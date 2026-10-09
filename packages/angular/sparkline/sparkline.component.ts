import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from "@angular/core";

import {
  niceCeiling,
  sparklineGeometry,
  type SoneChartTone,
  type SoneSparklineType,
} from "@surface-one/angular/core";

const fmt = (n: number): string => String(Math.round(n * 100) / 100);

/**
 * `<sone-sparkline>` — a word-sized chart with no axes: a line, an area, bars or a heat
 * strip in one stretched `<svg>`. Decorative by default (next to a number that already
 * says it); pass `[decorative]="false"` to make it an image with a spoken summary.
 */
@Component({
  selector: "sone-sparkline",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./sparkline.component.html",
  styleUrl: "./sparkline.component.scss",
  host: {
    "data-slot": "sparkline",
    "[attr.data-type]": "type()",
    "[attr.data-chart-tone]": "tone()",
    "[attr.role]": "decorative() ? null : 'img'",
    "[attr.aria-label]": "decorative() ? null : label()",
    "[attr.aria-hidden]": "decorative() ? 'true' : null",
  },
})
export class SoneSparklineComponent {
  /** The series, oldest first. */
  readonly values = input<readonly number[]>([]);

  /** `line` | `area` | `bar` | `heat` (cells on the sequential ramp). */
  readonly type = input<SoneSparklineType>("line");

  /** The bottom of the scale. */
  readonly min = input(0);

  /** The top of the scale; defaults to `niceCeiling(values, 4)`. */
  readonly max = input<number | null | undefined>(undefined);

  /** The colour (`heat` uses the sequential ramp instead). */
  readonly tone = input<SoneChartTone>("accent");

  /** Hidden from assistive technology (default); `false` makes it `role="img"`. */
  readonly decorative = input(true, { transform: booleanAttribute });

  /** The spoken text when not decorative; defaults to “n values, peak x, total y”. */
  readonly summary = input<string | null>(null);

  readonly top = computed(() => {
    const max = this.max();
    return max !== null && max !== undefined && Number.isFinite(max)
      ? max
      : niceCeiling(this.values(), 4);
  });

  readonly geometry = computed(() =>
    sparklineGeometry(this.values(), this.type(), this.min(), this.top()),
  );

  readonly label = computed(() => {
    const own = this.summary();
    if (own) return own;
    const values = this.values().filter((v) => Number.isFinite(v));
    const peak = values.reduce((a, b) => Math.max(a, b), -Infinity);
    const total = values.reduce((a, b) => a + b, 0);
    return $localize`${values.length}:count: values, peak ${values.length ? fmt(peak) : "0"}:peak:, total ${fmt(total)}:total:`;
  });
}
