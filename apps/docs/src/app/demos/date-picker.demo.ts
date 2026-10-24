import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneDatePickerComponent } from "@surface-one/angular/date-picker";
import type { SoneCalendarValue } from "@surface-one/angular/calendar";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; flex-wrap: wrap; min-height: 24rem">
  <div soneField style="width: 15rem">
    <label soneFieldLabel for="demo-due-date">Due date</label>
    <sone-date-picker triggerId="demo-due-date" [(value)]="due" />
  </div>
  <div soneField style="width: 18rem">
    <label soneFieldLabel for="demo-trip">Trip</label>
    <sone-date-picker triggerId="demo-trip" mode="range" [(value)]="trip" [weekStartsOn]="1" placeholder="Pick the dates" />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-date-picker-demo",
  imports: [SoneDatePickerComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DatePickerDemo {
  readonly due = signal<SoneCalendarValue>("2026-06-12");
  readonly trip = signal<SoneCalendarValue>(null);
}
