import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneRailButtonComponent,
  SoneRailComponent,
  SoneRailGroupDirective,
} from "@surface-one/angular/rail";

const TEMPLATE = `<div
  style="display: flex; gap: var(--space-2); height: 22rem; padding: var(--space-2); border-radius: var(--island-radius); background: var(--app-backdrop)"
>
  <sone-rail ariaLabel="Demo app">
    <div soneRailGroup>
      @for (place of places; track place.id) {
        <sone-rail-button
          [icon]="place.icon"
          [label]="place.label"
          [badge]="place.badge"
          [current]="current() === place.id"
          (click)="current.set(place.id)"
        />
      }
    </div>
    <div soneRailGroup>
      <sone-rail-button
        icon="settings"
        label="Settings"
        [current]="current() === 'settings'"
        (click)="current.set('settings')"
      />
    </div>
  </sone-rail>
  <section
    style="flex: 1; padding: var(--space-4); border-radius: var(--island-radius); background: var(--surface-base); box-shadow: var(--island-shadow)"
  >
    <p class="text-hint">Current place: {{ current() }}</p>
  </section>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-rail-demo",
  imports: [SoneRailComponent, SoneRailGroupDirective, SoneRailButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class RailDemo {
  readonly current = signal("home");
  readonly places = [
    { id: "home", label: "Home", icon: "dashboards", badge: null },
    { id: "search", label: "Search", icon: "search", badge: null },
    { id: "runs", label: "Runs, one running", icon: "workflow", badge: "busy" },
    {
      id: "inbox",
      label: "Inbox, needs you",
      icon: "bell",
      badge: "attention",
    },
  ] as const;
}
