import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneInputNumberComponent } from "@surface-one/angular/input-number";

const TEMPLATE = `<div class="demo-stack" style="max-width: 20rem">
  <div soneField>
    <label soneFieldLabel for="demo-qty">Quantity</label>
    <sone-input-number inputId="demo-qty" [(value)]="qty" [min]="1" [max]="10" />
    <p soneFieldDescription>{{ qty() }} × €24.00 = €{{ ((qty() ?? 0) * 24).toFixed(2) }}</p>
  </div>
  <div soneField>
    <label soneFieldLabel for="demo-weight">Weight (kg)</label>
    <sone-input-number inputId="demo-weight" size="sm" [(value)]="weight" [min]="0" [step]="0.5" />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-input-number-demo",
  imports: [SoneInputNumberComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class InputNumberDemo {
  readonly qty = signal<number | null>(2);
  readonly weight = signal<number | null>(1.5);
}
