import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  SoneButtonDirective,
  SoneButtonGroupDirective,
} from "@surface-one/angular/button";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <button soneBtn type="button">Default</button>
    <button soneBtn type="button" variant="secondary">Secondary</button>
    <button soneBtn type="button" variant="outline">Outline</button>
    <button soneBtn type="button" variant="ghost">Ghost</button>
    <button soneBtn type="button" variant="destructive">Destructive</button>
    <button soneBtn type="button" variant="link">Link</button>
  </div>
  <div class="demo-row">
    <button soneBtn type="button" size="xs">Extra small</button>
    <button soneBtn type="button" size="sm">Small</button>
    <button soneBtn type="button">Default</button>
    <button soneBtn type="button" size="lg">Large</button>
    <button soneBtn type="button" disabled>Disabled</button>
  </div>
  <div soneButtonGroup>
    <button soneBtn type="button" variant="outline">Day</button>
    <button soneBtn type="button" variant="outline">Week</button>
    <button soneBtn type="button" variant="outline">Month</button>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-button-demo",
  imports: [SoneButtonDirective, SoneButtonGroupDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ButtonDemo {}
