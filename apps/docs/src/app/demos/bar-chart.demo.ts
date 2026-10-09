import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  SoneBarChartComponent,
  type SoneBarChartDatum,
} from "@surface-one/angular/bar-chart";
import { fillDaySeries } from "@surface-one/angular/chart-utils";

interface Day {
  readonly date: string;
  readonly count: number;
}

const TEMPLATE = `<div class="demo-stack" style="padding-top: var(--space-8)">
  <sone-bar-chart
    [data]="days"
    [tick]="tick"
    [tooltip]="tooltip"
    ariaLabel="Meetings per day, last 30 days"
    categoryHeader="Day"
    valueHeader="Meetings"
  />
</div>`;

export const code = TEMPLATE;

/** Sparse rows as a backend returns them: only the days that had meetings. */
const ROWS: Day[] = [
  { date: "2026-09-11", count: 1 },
  { date: "2026-09-13", count: 2 },
  { date: "2026-09-14", count: 3 },
  { date: "2026-09-15", count: 1 },
  { date: "2026-09-18", count: 2 },
  { date: "2026-09-19", count: 4 },
  { date: "2026-09-20", count: 3 },
  { date: "2026-09-21", count: 1 },
  { date: "2026-09-24", count: 1 },
  { date: "2026-09-25", count: 2 },
  { date: "2026-09-26", count: 5 },
  { date: "2026-09-27", count: 3 },
  { date: "2026-09-28", count: 2 },
  { date: "2026-10-01", count: 1 },
  { date: "2026-10-02", count: 3 },
  { date: "2026-10-03", count: 4 },
  { date: "2026-10-04", count: 2 },
  { date: "2026-10-05", count: 1 },
  { date: "2026-10-08", count: 2 },
  { date: "2026-10-09", count: 3 },
];

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function dayLabel(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${MONTHS[m - 1]} ${d}`;
}

@Component({
  selector: "docs-bar-chart-demo",
  imports: [SoneBarChartComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BarChartDemo {
  readonly days: SoneBarChartDatum[] = fillDaySeries(ROWS, 30, {
    today: new Date(2026, 9, 9),
    empty: (date) => ({ date, count: 0 }),
  }).map((d) => ({ key: d.date, value: d.count, label: dayLabel(d.date) }));

  /** Every 7th day from the newest one backwards, so the last tick is today. */
  readonly tick = (d: SoneBarChartDatum, i: number): string | null =>
    (this.days.length - 1 - i) % 7 === 0 ? (d.label ?? null) : null;

  readonly tooltip = (d: SoneBarChartDatum): string =>
    `${d.label} · ${d.value === 1 ? "1 meeting" : `${d.value} meetings`}`;
}
