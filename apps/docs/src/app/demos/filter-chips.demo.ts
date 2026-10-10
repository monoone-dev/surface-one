import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  type FilterChipOption,
  SoneFilterChipsComponent,
} from "@surface-one/angular/filter-chips";

const TEMPLATE = `<div class="demo-stack">
  <sone-filter-chips [options]="levels" [(value)]="level" ariaLabel="Filter by level" />
  <sone-filter-chips variant="tabs" [options]="views" [(value)]="view" ariaLabel="Reminder views" />
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-filter-chips-demo",
  imports: [SoneFilterChipsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class FilterChipsDemo {
  readonly level = signal("all");
  readonly view = signal("inbox");
  readonly levels: readonly FilterChipOption[] = [
    { value: "all", label: "All", count: 128 },
    { value: "error", label: "Errors", count: 3, tone: "danger" },
    { value: "warn", label: "Warnings", count: 11, tone: "warning" },
  ];
  readonly views: readonly FilterChipOption[] = [
    { value: "inbox", label: "Inbox", count: 4 },
    { value: "upcoming", label: "Upcoming" },
    { value: "done", label: "Done" },
  ];
}
