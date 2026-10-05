import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  afterEveryRender,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  model,
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

  readonly value = model("");

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
    this.value.set(v == null ? "" : String(v));
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
    const v = this.value();
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
    this.onChange(v);
    this.onTouched();
  }
}
