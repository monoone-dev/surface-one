import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneSparklineComponent } from "@surface-one/angular/sparkline";

const TEMPLATE = `<dl class="demo-stack" style="display: grid; grid-template-columns: auto minmax(0, 10rem); align-items: center; gap: var(--space-3) var(--space-4); max-width: 22rem; margin: 0">
  <dt>Meetings</dt>
  <dd style="margin: 0"><sone-sparkline [values]="meetings" type="bar" /></dd>
  <dt>Talk time</dt>
  <dd style="margin: 0"><sone-sparkline [values]="minutes" type="area" tone="chart-2" /></dd>
  <dt>Focus</dt>
  <dd style="margin: 0"><sone-sparkline [values]="minutes" tone="chart-3" /></dd>
  <dt>Streak</dt>
  <dd style="margin: 0">
    <sone-sparkline [values]="meetings" type="heat" [decorative]="false" summary="Meetings per day, last 30 days" />
  </dd>
</dl>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-sparkline-demo",
  imports: [SoneSparklineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SparklineDemo {
  readonly meetings = [
    0, 1, 0, 2, 3, 1, 0, 0, 2, 4, 3, 1, 0, 0, 1, 2, 5, 3, 2, 0, 0, 1, 3, 4, 2,
    1, 0, 0, 2, 3,
  ];

  readonly minutes = [
    12, 30, 18, 45, 52, 40, 22, 15, 38, 61, 55, 34, 20, 26, 41, 48, 72, 58, 44,
    30, 18, 27, 49, 63, 51, 36, 22, 19, 42, 57,
  ];
}
