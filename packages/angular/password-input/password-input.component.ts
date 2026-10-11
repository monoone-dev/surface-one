import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  booleanAttribute,
  forwardRef,
  input,
  model,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { SoneValueAccessor } from "@surface-one/angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";

export type PasswordAutocomplete = "current-password" | "new-password" | "off";

/**
 * A password field with a show / hide toggle, on the Input Group. The toggle is
 * a toggle button: a constant name ("Show password") and `aria-pressed`.
 */
@Component({
  selector: "sone-password-input",
  imports: [SoneButtonDirective, SoneIconComponent, SONE_INPUT_GROUP_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./password-input.component.html",
  styleUrl: "./password-input.component.scss",
  host: {
    "data-slot": "password-input",
    "[attr.data-visible]": "visible() ? '' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SonePasswordInputComponent),
      multi: true,
    },
  ],
})
export class SonePasswordInputComponent extends SoneValueAccessor<string> {
  readonly value = model("");

  /** Shows the password as plain text (`[(visible)]`). */
  readonly visible = model(false);

  readonly autocomplete = input<PasswordAutocomplete>("current-password");
  readonly placeholder = input("");
  readonly inputId = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  /** Extra ids for `aria-describedby` on the input. */
  readonly ariaDescribedby = input<string | null>(null);

  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  /** The toggle's accessible name; its state is `aria-pressed`. */
  readonly toggleLabel = input($localize`Show password`);

  private readonly field =
    viewChild.required<ElementRef<HTMLInputElement>>("field");

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

  writeValue(v: unknown): void {
    this.value.set(v == null ? "" : String(v));
  }

  focus(): void {
    this.field().nativeElement.focus();
  }

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  onBlur(): void {
    this.onTouched();
  }

  toggle(): void {
    this.visible.update((v) => !v);
  }
}
