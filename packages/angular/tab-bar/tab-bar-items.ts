// The tab bar's items, with no framework in it: the Angular `sone-tab-bar`, the Vue and
// React `SoneTabBar` (through @surface-one/core) read it.
import type { ShellIcon } from "@surface-one/angular/icon";

export interface TabBarItem {
  readonly value: string;
  /** The visible label and the tab's accessible name. */
  readonly label: string;
  /** A SurfaceOne glyph. */
  readonly icon?: ShellIcon;
  /** Makes the tab a link (`aria-current="page"` while it is the value). */
  readonly href?: string;
  readonly disabled?: boolean;
}

/** `active` shows the label of the active tab only (the others keep it for screen readers); `always` of every tab. */
export type TabBarLabels = "active" | "always";

/** Whether a tab shows its label. */
export const tabBarShowsLabel = (
  labels: TabBarLabels,
  active: boolean,
): boolean => labels === "always" || active;

/** What a tab renders as: a link for an enabled item with an `href`, else a button. */
export const tabBarItemKind = (item: TabBarItem): "link" | "button" =>
  item.href && !item.disabled ? "link" : "button";

/** The tab's `aria-current`: `page` for the active link, `true` for the active button. */
export const tabBarCurrent = (
  item: TabBarItem,
  active: boolean,
): "page" | "true" | null =>
  active ? (tabBarItemKind(item) === "link" ? "page" : "true") : null;
