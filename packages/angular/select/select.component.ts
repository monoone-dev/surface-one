import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  afterEveryRender,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  linkedSignal,
  model,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";

export type NativeSelectSize = "default" | "sm";

@Component({
  selector: "sone-select",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.scss",
  host: {
    "data-slot": "native-select-wrapper",
    "[attr.data-size]": "size()",
    "[attr.data-disabled]": "isDisabled() ? 'true' : null",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneSelectComponent),
      multi: true,
    },
  ],
})
export class SoneSelectComponent implements ControlValueAccessor {
  readonly ariaLabel = input<string | null>(null);
  readonly size = input<NativeSelectSize>("default");
  readonly selectId = input<string | null>(null);
  readonly name = input<string | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });
  /** Extra ids for `aria-describedby` on the inner `<select>`. */
  readonly ariaDescribedby = input<string | null>(null);

  /**
   * The selected value for `[(value)]`. `valueChange` fires only when the user
   * picks an option — a forms write (`writeValue` from `formControl` / `ngModel`)
   * updates the display without emitting it.
   */
  readonly value = model("");

  /** Fires ONLY when the user picks an option — never on any programmatic write. */
  readonly selectionChange = output<string>();

  /** What the `<select>` shows: follows `value`, and a forms write sets it without emitting. */
  readonly current = linkedSignal(() => this.value());

  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly cvaDisabled = signal(false);

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly selectEl =
    viewChild.required<ElementRef<HTMLSelectElement>>("select");

  constructor() {
    afterEveryRender({ write: () => this.syncSelectedOption() });
  }

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    this.current.set(v == null ? "" : String(v));
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

  /** Re-asserts `value()` when late-projected options made the `<select>`
   *  drift to its first option; a value with no matching option is left alone. */
  private syncSelectedOption(): void {
    const el = this.selectEl().nativeElement;
    const v = this.current();
    if (el.value === v) {
      return;
    }
    if (Array.from(el.options).some((o) => o.value === v)) {
      el.value = v;
    }
  }

  onChangeEvent(e: Event): void {
    const v = (e.target as HTMLSelectElement).value;
    this.value.set(v);
    this.current.set(v);
    this.onChange(v);
    this.onTouched();
    this.selectionChange.emit(v);
  }
}
