import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneSliderComponent } from "@surface-one/angular/slider";

const TEMPLATE = `<div class="demo-stack" style="max-width: 22rem">
  <div style="display: grid; gap: var(--space-2)">
    <span style="color: var(--text-secondary)">Volume: {{ volume() }}%</span>
    <sone-slider [(value)]="volume" ariaLabel="Volume" />
  </div>
  <div style="display: grid; gap: var(--space-2)">
    <span style="color: var(--text-secondary)">Rating: {{ rating() }} of 10</span>
    <sone-slider [(value)]="rating" [min]="0" [max]="10" [step]="1" ariaLabel="Rating" />
  </div>
  <sone-slider [value]="60" [disabled]="true" ariaLabel="Brightness (locked)" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-slider-demo",
  imports: [SoneSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SliderDemo {
  readonly volume = signal(40);
  readonly rating = signal(7);
}
