import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";

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
export class SoneSliderComponent implements ControlValueAccessor {
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly ariaLabel = input<string | null>(null);
  readonly disabled = input(false);

  readonly value = model(0);

  private readonly cvaDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  protected readonly fill = computed(() => {
    const min = this.min();
    const span = this.max() - min;
    if (!Number.isFinite(span) || span <= 0) return "0%";
    const frac = (this.value() - min) / span;
    return `${Math.min(Math.max(Number.isFinite(frac) ? frac : 0, 0), 1) * 100}%`;
  });

  private onChange: (v: number) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    const n = Number(v);
    this.value.set(v == null || !Number.isFinite(n) ? this.min() : n);
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

  onInput(e: Event): void {
    const v = Number((e.target as HTMLInputElement).value);
    this.value.set(v);
    this.onChange(v);
  }

  onBlur(): void {
    this.onTouched();
  }
}
