import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  booleanAttribute,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { SoneValueAccessor } from "@surface-one/angular/core";

@Component({
  selector: "sone-slider",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./slider.component.html",
  styleUrl: "./slider.component.scss",
  host: {
    "data-slot": "slider",
    "data-orientation": "horizontal",
    "[attr.data-disabled]": 'isDisabled() ? "" : null',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneSliderComponent),
      multi: true,
    },
  ],
})
export class SoneSliderComponent extends SoneValueAccessor<number> {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly ariaLabel = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly value = model(0);

  protected readonly fill = computed(() => {
    const min = this.min();
    const span = this.max() - min;
    if (!Number.isFinite(span) || span <= 0) return "0%";
    const frac = (this.value() - min) / span;
    return `${Math.min(Math.max(Number.isFinite(frac) ? frac : 0, 0), 1) * 100}%`;
  });

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    const n = Number(v);
    this.value.set(v == null || !Number.isFinite(n) ? this.min() : n);
  }

  onInput(e: Event): void {
    const v = Number((e.target as HTMLInputElement).value);
    this.value.set(v);
    this.onChange(v);
  }

  onBlur(): void {
    this.onTouched();
  }
}
