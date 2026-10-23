import {
  ChangeDetectionStrategy,
  Component,
  type ElementRef,
  booleanAttribute,
  forwardRef,
  input,
  linkedSignal,
  output,
  viewChild,
} from "@angular/core";
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { SoneValueAccessor } from "@surface-one/angular/core";

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
export class SoneSwitchComponent extends SoneValueAccessor<boolean> {
  readonly ariaLabel = input<string | null>(null);
  readonly size = input<SwitchSize>("default");
  readonly inputId = input<string | null>(null);
  readonly invalid = input(false, { transform: booleanAttribute });

  readonly checked = input(false, { transform: booleanAttribute });
  readonly checkedChange = output<boolean>();
  readonly disabled = input(false, { transform: booleanAttribute });

  readonly state = linkedSignal(() => this.checked());
  private readonly box = viewChild<ElementRef<HTMLInputElement>>("box");

  protected disabledByComponent(): boolean {
    return this.disabled();
  }

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

  onInput(e: Event): void {
    const v = (e.target as HTMLInputElement).checked;
    this.state.set(v);
    this.onChange(v);
    this.onTouched();
    this.checkedChange.emit(v);
  }
}
