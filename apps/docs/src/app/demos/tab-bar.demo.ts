import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneTabBarComponent,
  type TabBarItem,
} from "@surface-one/angular/tab-bar";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <sone-tab-bar ariaLabel="Demo app" [items]="items" [(value)]="tab" />
  <sone-tab-bar
    ariaLabel="Demo app, full width"
    [items]="items"
    [(value)]="tab"
    [floating]="false"
    labels="always"
  />
  <p class="text-hint">Active tab: {{ tab() }}</p>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-tab-bar-demo",
  imports: [SoneTabBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TabBarDemo {
  readonly tab = signal("home");
  readonly items: TabBarItem[] = [
    { value: "home", label: "Home", icon: "dashboards" },
    { value: "search", label: "Search", icon: "search" },
    { value: "inbox", label: "Inbox", icon: "bell" },
    { value: "profile", label: "Profile", icon: "user" },
  ];
}
