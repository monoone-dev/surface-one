import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneCheckboxDirective } from "@surface-one/angular/checkbox";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

const TEMPLATE = `<div soneFieldGroup variant="choices" style="max-width: 26rem">
  <div soneField orientation="horizontal">
    <input soneCheckbox id="demo-terms" [(indeterminate)]="partial" [checked]="terms()" (change)="terms.set(!terms())" />
    <div soneFieldContent>
      <label soneFieldLabel for="demo-terms">Accept terms and conditions</label>
      <p soneFieldDescription>{{ partial() ? 'Partly read' : terms() ? 'Accepted' : 'Not accepted' }}.</p>
    </div>
  </div>
  <div soneField orientation="horizontal">
    <input soneCheckbox id="demo-updates" checked />
    <label soneFieldLabel for="demo-updates">Email me product updates</label>
  </div>
  <div soneField orientation="horizontal" disabled>
    <input soneCheckbox id="demo-locked" checked disabled />
    <label soneFieldLabel for="demo-locked">Keep a backup (managed)</label>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-checkbox-demo",
  imports: [SoneCheckboxDirective, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CheckboxDemo {
  readonly terms = signal(false);
  readonly partial = signal(true);
}
