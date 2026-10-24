import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_RADIO_GROUP_PARTS } from "@surface-one/angular/radio-group";

const TEMPLATE = `<fieldset soneRadioGroup [(value)]="density" style="max-width: 26rem">
  <legend soneFieldLegend variant="label">Density</legend>
  <div soneField orientation="horizontal">
    <input soneRadio id="demo-density-default" value="default" />
    <label soneFieldLabel for="demo-density-default">Default</label>
  </div>
  <div soneField orientation="horizontal">
    <input soneRadio id="demo-density-comfortable" value="comfortable" />
    <label soneFieldLabel for="demo-density-comfortable">Comfortable</label>
  </div>
  <div soneField orientation="horizontal">
    <input soneRadio id="demo-density-compact" value="compact" disabled />
    <label soneFieldLabel for="demo-density-compact">Compact (soon)</label>
  </div>
  <p soneFieldDescription>Rows are {{ density() }}.</p>
</fieldset>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-radio-group-demo",
  imports: [...SONE_RADIO_GROUP_PARTS, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class RadioGroupDemo {
  readonly density = signal<string | null>("comfortable");
}
