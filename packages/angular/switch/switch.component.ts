import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  booleanAttribute,
  computed,
  forwardRef,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";

export type SwitchSize = "default" | "sm";

// Intentionally still a native checkbox, not `role="switch"`: e2e specs find
// it by `getByRole("checkbox", { name })`, so a role change must land with those specs.
@Component({
  selector: "sone-switch",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./switch.component.html",
  styleUrl: "./switch.component.scss",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneSwitchComponent),
      multi: true,
    },
  ],
})
export class SoneSwitchComponent implements ControlValueAccessor {
  readonly ariaLabel = input<string | null>(null);
  readonly size = input<SwitchSize>("default");
  readonly inputId = input<string | null>(null);
  readonly invalid = input(false);

  readonly checked = input(false, { transform: booleanAttribute });
  readonly checkedChange = output<boolean>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly state = linkedSignal(() => this.checked());
  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private readonly box = viewChild<ElementRef<HTMLInputElement>>("box");

  private onChange: (v: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    const val = !!v;
    this.state.set(val);
    // A confirm-then-revert inside one CD cycle is a net no-change to the
    // signal, so the [checked] binding never rewrites the NATIVE property
    // the click already flipped; sync it directly instead.
    const el = this.box()?.nativeElement;
    if (el && el.checked !== val) {
      el.checked = val;
    }
  }
  registerOnChange(fn: (v: boolean) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(d: boolean): void {
    this.cvaDisabled.set(d);
  }

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).checked;
    this.state.set(v);
    this.onChange(v);
    this.onTouched();
    this.checkedChange.emit(v);
  }
}
