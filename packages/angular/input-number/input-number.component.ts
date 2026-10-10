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
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

export type InputNumberSize = "sm" | "default";

const optionalNumber = (v: unknown): number | null =>
  v === null || v === undefined || v === "" ? null : numberAttribute(v);

/**
 * A number field with − and + buttons — a quantity in a cart, a count in a form.
 * The field is a WAI-ARIA spinbutton: ↑ / ↓ step, Page Up / Page Down step × 10,
 * Home / End jump to `min` / `max`; typed text is parsed and clamped on blur or
 * Enter. A ControlValueAccessor of `number | null`, or `[(value)]`.
 */
@Component({
  selector: "sone-input-number",
  imports: [SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./input-number.component.html",
  styleUrl: "./input-number.component.scss",
  host: {
    "data-slot": "input-number",
    "[attr.data-size]": "size()",
    "[attr.data-invalid]": "invalid() ? 'true' : null",
    "[attr.data-disabled]": "isDisabled() ? 'true' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneInputNumberComponent),
      multi: true,
    },
  ],
})
export class SoneInputNumberComponent implements ControlValueAccessor {
  readonly value = model<number | null>(null);
  readonly min = input(null, { transform: optionalNumber });
  readonly max = input(null, { transform: optionalNumber });
  readonly step = input(1, { transform: numberAttribute });
  readonly size = input<InputNumberSize>("default");
  readonly placeholder = input("");
  readonly inputId = input<string | null>(null);
  /** The field's accessible name, when no `<label for>` names it. */
  readonly ariaLabel = input<string | null>(null);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly decrementLabel = input(
    $localize`:Button that lowers a number field by one step:Decrease`,
  );
  readonly incrementLabel = input(
    $localize`:Button that raises a number field by one step:Increase`,
  );

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  /** Text being typed; `null` shows the formatted value. */
  readonly draft = signal<string | null>(null);

  readonly text = computed(() => {
    const d = this.draft();
    if (d !== null) return d;
    const v = this.value();
    return v === null ? "" : String(v);
  });
  readonly atMin = computed(() => {
    const v = this.value();
    const min = this.min();
    return v !== null && min !== null && v <= min;
  });
  readonly atMax = computed(() => {
    const v = this.value();
    const max = this.max();
    return v !== null && max !== null && v >= max;
  });

  private onChange: (v: number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    const n = v === null || v === undefined || v === "" ? null : Number(v);
    this.value.set(n === null || Number.isFinite(n) ? n : null);
    this.draft.set(null);
  }
  registerOnChange(fn: (v: number | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.cvaDisabled.set(d);
  }

  /** Clamps to min/max and rounds to the step's decimals. */
  clamp(n: number): number {
    const min = this.min();
    const max = this.max();
    let v = n;
    if (min !== null) v = Math.max(v, min);
    if (max !== null) v = Math.min(v, max);
    const decimals = (String(this.step()).split(".")[1] ?? "").length;
    return Number(v.toFixed(decimals));
  }

  stepBy(times: number): void {
    if (this.isDisabled()) return;
    const base = this.value() ?? this.min() ?? 0;
    this.commit(this.clamp(base + this.step() * times));
  }

  onInput(e: Event): void {
    this.draft.set((e.target as HTMLInputElement).value);
  }

  onKeydown(e: KeyboardEvent): void {
    const keys: Record<string, () => void> = {
      ArrowUp: () => this.stepBy(1),
      ArrowDown: () => this.stepBy(-1),
      PageUp: () => this.stepBy(10),
      PageDown: () => this.stepBy(-10),
      Home: () => {
        const min = this.min();
        if (min !== null) this.commit(min);
      },
      End: () => {
        const max = this.max();
        if (max !== null) this.commit(max);
      },
      Enter: () => this.parseDraft(),
    };
    const run = keys[e.key];
    if (!run) return;
    if (e.key !== "Enter") e.preventDefault();
    run();
  }

  onBlur(): void {
    this.parseDraft();
    this.onTouched();
  }

  private parseDraft(): void {
    const d = this.draft();
    if (d === null) return;
    const trimmed = d.trim().replace(",", ".");
    const n = Number(trimmed);
    if (trimmed === "") this.commit(null);
    else if (Number.isFinite(n)) this.commit(this.clamp(n));
    this.draft.set(null);
  }

  private commit(v: number | null): void {
    this.draft.set(null);
    if (v === this.value()) return;
    this.value.set(v);
    this.onChange(v);
  }
}
