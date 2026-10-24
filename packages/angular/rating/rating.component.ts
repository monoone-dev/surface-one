import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  signal,
} from "@angular/core";
import { soneId, SoneValueAccessor } from "@surface-one/angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { NG_VALUE_ACCESSOR } from "@angular/forms";

import { RATING_STAR_PATH } from "./rating-star";

export type RatingSize = "sm" | "default" | "lg";

/** One star: its value (1-based) and how much of it is filled, 0–1. */
export interface SoneRatingStar {
  readonly value: number;
  readonly fill: number;
}

/**
 * Stars for a score. Read-only (`readonly`) it is one image named "4.5 out of 5"
 * and fills fractions; interactive it is a native radio group — arrow keys move
 * the score, every star is a labelled radio — and a ControlValueAccessor of
 * `number` (0 = no rating).
 */
@Component({
  selector: "sone-rating",
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./rating.component.html",
  styleUrl: "./rating.component.scss",
  host: {
    "data-slot": "rating",
    "[attr.data-size]": "size()",
    "[attr.data-readonly]": "readonly() ? '' : null",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneRatingComponent),
      multi: true,
    },
  ],
})
export class SoneRatingComponent extends SoneValueAccessor<number> {
  /** The score, 0 to `max`. Fractions show only when read-only. */
  readonly value = model(0);
  readonly max = input(5, { transform: numberAttribute });
  readonly size = input<RatingSize>("default");
  /** Show the score without letting it change. */
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Choosing the current score again clears it to 0. */
  readonly clearable = input(false, { transform: booleanAttribute });
  /** The group's accessible name (interactive) or a prefix of the image's (read-only). */
  readonly ariaLabel = input<string | null>(null);

  /** The star outline, 24 × 24. */
  readonly path = RATING_STAR_PATH;

  readonly name = soneId("sone-rating");
  readonly hover = signal<number | null>(null);
  readonly stars = computed<readonly SoneRatingStar[]>(() => {
    const max = Math.max(1, Math.round(this.max()));
    const shown = this.readonly()
      ? this.value()
      : (this.hover() ?? this.value());
    return Array.from({ length: max }, (_, i) => ({
      value: i + 1,
      fill: Math.min(Math.max(shown - i, 0), 1),
    }));
  });

  readonly summary = computed(() => {
    const score = Math.round(this.value() * 10) / 10;
    const text = $localize`:Read-only star rating, e.g. "4.5 out of 5":${score}:score: out of ${this.max()}:max:`;
    const label = this.ariaLabel();
    return label ? `${label}: ${text}` : text;
  });

  readonly groupLabel = computed(
    () => this.ariaLabel() ?? $localize`:Star rating group:Rating`,
  );

  starLabel(n: number): string {
    return n === 1
      ? $localize`:One star of a rating:1 star`
      : $localize`:Star count of a rating:${n}:count: stars`;
  }

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    const n = Number(v);
    this.value.set(Number.isFinite(n) ? n : 0);
  }

  select(n: number): void {
    if (this.isDisabled() || this.readonly()) return;
    const next = this.clearable() && n === this.value() ? 0 : n;
    this.value.set(next);
    this.onChange(next);
  }

  /** A click on the checked star does not fire `change`; clearing needs the click. */
  onClick(n: number): void {
    if (this.clearable() && n === this.value()) this.select(n);
  }

  touched(): void {
    this.onTouched();
  }

  preview(n: number | null): void {
    if (!this.isDisabled() && !this.readonly()) this.hover.set(n);
  }
}
