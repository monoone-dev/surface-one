import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  SoneDonutChartComponent,
  type SoneDonutChartSegment,
} from "@surface-one/angular/donut-chart";

const TEMPLATE = `<div class="demo-stack" style="align-items: center">
  <sone-donut-chart
    [segments]="browsers"
    label="Visitors"
    ariaLabel="Visitors by browser, January to June 2026"
    categoryHeader="Browser"
    valueHeader="Visitors"
  />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-donut-chart-demo",
  imports: [SoneDonutChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DonutChartDemo {
  readonly browsers: SoneDonutChartSegment[] = [
    { key: "chrome", label: "Chrome", value: 275 },
    { key: "safari", label: "Safari", value: 200 },
    { key: "firefox", label: "Firefox", value: 187 },
    { key: "edge", label: "Edge", value: 173 },
    { key: "other", label: "Other", value: 90 },
  ];
}
