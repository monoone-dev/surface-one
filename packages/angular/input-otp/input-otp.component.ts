import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
  numberAttribute,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";

/** Digits only — the default `pattern` (shadcn's `REGEXP_ONLY_DIGITS`). */
export const SONE_OTP_DIGITS = "^\\d+$";
/** Latin letters and digits (shadcn's `REGEXP_ONLY_DIGITS_AND_CHARS`). */
export const SONE_OTP_ALPHANUMERIC = "^[a-zA-Z0-9]+$";

/**
 * shadcn's InputOTP approach: ONE real `<input autocomplete="one-time-code">`
 * lies transparent over the slots, so paste, SMS / password-manager autofill,
 * IME and screen readers all see a normal text field; the slots only draw it.
 * The caret is kept at the end — a code is typed or pasted, then erased.
 */
@Component({
  selector: "sone-input-otp",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./input-otp.component.html",
  styleUrl: "./input-otp.component.scss",
  host: {
    "data-slot": "input-otp",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
    "[attr.data-invalid]": "invalid() ? '' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneInputOtpComponent),
      multi: true,
    },
  ],
})
export class SoneInputOtpComponent implements ControlValueAccessor {
  /** How many characters the code has. */
  readonly length = input(6, { transform: numberAttribute });

  /** What ONE character may be: a RegExp or its source (`SONE_OTP_DIGITS`, `SONE_OTP_ALPHANUMERIC`). */
  readonly pattern = input<RegExp | string>(SONE_OTP_DIGITS);

  /** Slots per group, a separator between groups — `[3, 3]`. Ignored unless it adds up to `length`. */
  readonly groups = input<readonly number[] | null>(null);

  readonly disabled = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);
  readonly inputId = input<string | null>(null);
  readonly name = input<string | null>(null);

  readonly value = model("");

  /** Every slot is filled by the user (typed, pasted or autofilled). */
  readonly complete = output<string>();

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly focused = signal(false);

  private readonly field =
    viewChild.required<ElementRef<HTMLInputElement>>("field");

  readonly size = computed(() => {
    const n = Math.trunc(this.length());
    return Number.isFinite(n) && n > 0 ? n : 6;
  });

  private readonly charTest = computed(() => {
    const p = this.pattern();
    const re = typeof p === "string" ? new RegExp(p) : p;
    return new RegExp(re.source, re.flags.replace(/[gy]/g, ""));
  });

  readonly inputMode = computed(() =>
    ["^\\d+$", "^[0-9]+$", "^\\d*$", "^[0-9]*$"].includes(
      this.charTest().source,
    )
      ? "numeric"
      : "text",
  );

  /** Slot indexes per group. */
  readonly layout = computed(() => {
    const n = this.size();
    const g = (this.groups() ?? []).map((x) => Math.trunc(x));
    const ok =
      g.length > 0 && g.every((x) => x > 0) && g.reduce((a, b) => a + b) === n;
    const sizes = ok ? g : [n];
    let at = 0;
    return sizes.map((count) => Array.from({ length: count }, () => at++));
  });

  readonly chars = computed(() => Array.from(this.value()));

  readonly activeIndex = computed(() =>
    Math.min(this.chars().length, this.size() - 1),
  );

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    this.value.set(this.clean(v == null ? "" : String(v)));
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.cvaDisabled.set(d);
  }

  focus(): void {
    this.field().nativeElement.focus();
  }

  onInput(e: Event): void {
    const el = e.target as HTMLInputElement;
    const v = this.clean(el.value);
    if (el.value !== v) el.value = v;
    this.value.set(v);
    this.onChange(v);
    this.caretToEnd();
    if (v.length === this.size()) this.complete.emit(v);
  }

  onFocus(): void {
    this.focused.set(true);
    this.caretToEnd();
  }

  onBlur(): void {
    this.focused.set(false);
    this.onTouched();
  }

  /** Keeps the (invisible) caret at the end, where the active slot is drawn. */
  caretToEnd(): void {
    const el = this.field().nativeElement;
    const end = el.value.length;
    if (el.selectionStart !== end || el.selectionEnd !== end) {
      el.setSelectionRange(end, end);
    }
  }

  private clean(raw: string): string {
    const test = this.charTest();
    return Array.from(raw)
      .filter((ch) => test.test(ch))
      .slice(0, this.size())
      .join("");
  }
}
