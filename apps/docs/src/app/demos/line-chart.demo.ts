import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  SoneLineChartComponent,
  type SoneLineChartSeries,
} from "@surface-one/angular/line-chart";

const TEMPLATE = `<div class="demo-stack" style="padding-top: var(--space-4)">
  <sone-line-chart
    [data]="visitors"
    [series]="series"
    xKey="month"
    curve="smooth"
    ariaLabel="Visitors, January to June 2026"
    categoryHeader="Month"
  />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-line-chart-demo",
  imports: [SoneLineChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class LineChartDemo {
  readonly visitors = [
    { month: "Jan", desktop: 186, mobile: 80 },
    { month: "Feb", desktop: 305, mobile: 200 },
    { month: "Mar", desktop: 237, mobile: 120 },
    { month: "Apr", desktop: 73, mobile: 190 },
    { month: "May", desktop: 209, mobile: 130 },
    { month: "Jun", desktop: 214, mobile: 140 },
  ];

  readonly series: SoneLineChartSeries[] = [
    { key: "desktop", label: "Desktop" },
    { key: "mobile", label: "Mobile" },
  ];
}
