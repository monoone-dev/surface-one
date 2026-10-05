import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneMeterComponent } from "@surface-one/angular/meter";

const TEMPLATE = `<div class="demo-stack" style="max-width: 22rem; gap: var(--space-2)">
  <sone-meter label="Accuracy" [value]="4" [max]="4" detail="Best available" />
  <sone-meter label="Speed" [value]="2" [max]="4" />
  <sone-meter label="Battery use" [value]="1" [max]="4" detail="Light" />
  <sone-meter label="Storage" [value]="3" [max]="5" detail="About 2 GB" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-meter-demo",
  imports: [SoneMeterComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MeterDemo {}
