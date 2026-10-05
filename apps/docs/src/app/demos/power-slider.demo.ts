import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SonePowerSliderComponent,
  type PowerRung,
} from "@surface-one/angular/power-slider";

const TEMPLATE = `<div class="demo-stack" style="max-width: 26rem">
  <div style="display: grid; gap: var(--space-2)">
    <sone-power-slider [rungs]="rungs" [(value)]="power" ariaLabel="Processing power" />
    <span style="color: var(--text-secondary)">Committed: {{ power() }}</span>
  </div>
  <sone-power-slider [rungs]="rungs" value="battery" [disabled]="true" ariaLabel="Processing power (locked)" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-power-slider-demo",
  imports: [SonePowerSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PowerSliderDemo {
  readonly rungs: readonly PowerRung[] = [
    { id: "battery", name: "Battery saver" },
    { id: "balanced", name: "Balanced" },
    { id: "sharp", name: "Sharp" },
    { id: "max", name: "Maximum" },
  ];
  readonly power = signal("balanced");
}
