import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneCalendarComponent,
  type SoneCalendarValue,
} from "@surface-one/angular/calendar";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; flex-wrap: wrap">
  <sone-calendar [(value)]="date" ariaLabel="Delivery date" />
  <sone-calendar mode="range" [(value)]="stay" [weekStartsOn]="1" ariaLabel="Stay" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-calendar-demo",
  imports: [SoneCalendarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CalendarDemo {
  readonly date = signal<SoneCalendarValue>("2026-06-12");
  readonly stay = signal<SoneCalendarValue>({
    start: "2026-06-08",
    end: "2026-06-12",
  });
}
