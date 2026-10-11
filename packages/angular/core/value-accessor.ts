import { computed, signal } from "@angular/core";
import type { ControlValueAccessor } from "@angular/forms";

/**
 * The shared plumbing of a SurfaceOne form control (`ControlValueAccessor`): the
 * `onChange` / `onTouched` callbacks, `registerOn*`, `setDisabledState` and an
 * `isDisabled` signal that merges the forms API's disabled state with the
 * component's own. A subclass still provides `NG_VALUE_ACCESSOR`, writes the value
 * in `writeValue` and says what else disables it in `disabledByComponent()`
 * (usually its `disabled` input).
 *
 * ```ts
 * export class SoneSwitchComponent extends SoneValueAccessor<boolean> {
 *   readonly disabled = input(false, { transform: booleanAttribute });
 *   protected disabledByComponent() { return this.disabled(); }
 *   writeValue(v: unknown) { … }
 * }
 * ```
 */
export abstract class SoneValueAccessor<T> implements ControlValueAccessor {
  /** Disabled by the forms API (`formControl.disable()`, `[disabled]` on `ngModel`). */
  protected readonly cvaDisabled = signal(false);
  /** Disabled by the forms API or by the component itself. */
  readonly isDisabled = computed(
    () => this.disabledByComponent() || this.cvaDisabled(),
  );

  protected onChange: (value: T) => void = () => undefined;
  protected onTouched: () => void = () => undefined;

  /** What disables the control apart from the forms API — a signal read, so it stays reactive. */
  protected abstract disabledByComponent(): boolean;

  abstract writeValue(value: unknown): void;

  registerOnChange(fn: (value: T) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }
}
