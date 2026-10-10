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
import { NgTemplateOutlet } from "@angular/common";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";

export type RatingSize = "sm" | "default" | "lg";

/** One star: its value (1-based) and how much of it is filled, 0–1. */
export interface SoneRatingStar {
  readonly value: number;
  readonly fill: number;
}

let nextRatingId = 0;

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
export class SoneRatingComponent implements ControlValueAccessor {
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
  readonly path =
    "M11.53 2.3a.53.53 0 0 1 .95 0l2.31 4.68a2.12 2.12 0 0 0 1.6 1.16l5.16.76a.53.53 0 0 1 .3.9l-3.74 3.64a2.12 2.12 0 0 0-.61 1.88l.88 5.14a.53.53 0 0 1-.77.56l-4.62-2.43a2.12 2.12 0 0 0-1.97 0L6.4 21.01a.53.53 0 0 1-.77-.56l.88-5.14a2.12 2.12 0 0 0-.61-1.88L2.16 9.8a.53.53 0 0 1 .3-.9l5.16-.76a2.12 2.12 0 0 0 1.6-1.16z";

  readonly name = `sone-rating-${nextRatingId++}`;
  readonly hover = signal<number | null>(null);
  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

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

  private onChange: (v: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    const n = Number(v);
    this.value.set(Number.isFinite(n) ? n : 0);
  }
  registerOnChange(fn: (v: number) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.cvaDisabled.set(d);
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
