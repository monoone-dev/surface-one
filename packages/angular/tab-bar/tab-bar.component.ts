import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  model,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { SoneIconComponent } from "@surface-one/angular/icon";

import {
  tabBarCurrent,
  tabBarItemKind,
  tabBarShowsLabel,
  type TabBarItem,
  type TabBarLabels,
} from "./tab-bar-items";

/**
 * `<sone-tab-bar>` — mobile-style bottom navigation for the web (the twin of the React
 * Native `SoneTabBar`): a `nav` of `items`, each a link (`href`, `aria-current="page"`
 * while active) or a button (`aria-current="true"`), with an icon and the active tab's
 * label (`labels="always"` shows every label; a hidden one still names the tab). The
 * active tab is `[(value)]`. `floating` (the default) is a centred pill that sticks to
 * the bottom of the scrolling page; without it a full-width bar with a top hairline.
 * Both clear the home indicator (`env(safe-area-inset-bottom)`).
 */
@Component({
  selector: "sone-tab-bar",
  imports: [NgTemplateOutlet, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./tab-bar.component.html",
  styleUrl: "./tab-bar.component.scss",
  host: {
    "data-slot": "tab-bar",
    "[attr.data-floating]": "floating() ? '' : null",
    "[attr.data-labels]": "labels()",
  },
})
export class SoneTabBarComponent {
  readonly items = input.required<readonly TabBarItem[]>();
  /** The active tab's value — `[(value)]`. */
  readonly value = model<string | null>(null);
  /** Names the navigation landmark. */
  readonly ariaLabel = input($localize`:A bottom tab bar's navigation:Tab bar`);
  /** `active` shows the active tab's label only; `always` every label. */
  readonly labels = input<TabBarLabels>("active");
  /** A centred pill (the default); `false` is a full-width bar. */
  readonly floating = input(true, { transform: booleanAttribute });

  protected readonly kind = tabBarItemKind;
  protected readonly current = tabBarCurrent;
  protected showsLabel(active: boolean): boolean {
    return tabBarShowsLabel(this.labels(), active);
  }

  protected select(item: TabBarItem): void {
    if (!item.disabled) this.value.set(item.value);
  }
}
