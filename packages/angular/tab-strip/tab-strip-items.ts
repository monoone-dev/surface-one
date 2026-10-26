// The tab strip's tabs and keys, with no framework in it: the Angular `sone-tab-strip`,
// the Vue and React `SoneTabStrip` (through @surface-one/core) read it.

/** Activity on a tab: `busy` pulses, `waiting` asks for you, `done` and `error` mark the outcome. */
export type TabStripStatus = "busy" | "waiting" | "done" | "error";

export interface TabStripTab {
  readonly id: string;
  /** The visible label and the tab's accessible name. */
  readonly label: string;
  readonly status?: TabStripStatus | null;
  /** A short word after the label (`waits`, `4 min`). */
  readonly note?: string | null;
}

/** The id of a tab's button, which its panel names in `aria-labelledby`. */
export const tabStripTabId = (prefix: string, id: string): string =>
  `${prefix}-tab-${id}`;

/** The id of the panel a tab controls (`aria-controls`). */
export const tabStripPanelId = (prefix: string, id: string): string =>
  `${prefix}-${id}`;

/** The one tab in the Tab order: the active one, else the first. */
export const tabStripTabIndex = (
  tabs: readonly TabStripTab[],
  active: string | null | undefined,
  index: number,
): 0 | -1 => {
  const selected = tabs.findIndex((t) => t.id === active);
  return index === (selected < 0 ? 0 : selected) ? 0 : -1;
};

/** What a key on the tab at `index` does. */
export type TabStripKeyAction =
  | { readonly kind: "move"; readonly id: string }
  | {
      readonly kind: "close";
      readonly id: string;
      /** The tab that takes the focus once it is gone (the next, else the previous). */
      readonly next: string | null;
    };

/**
 * ←/→ (wrapping), Home and End move to a tab and select it; Delete, or ⌘W / Ctrl+W, closes
 * the focused one when the strip is closable. Anything else: null (let the key through).
 */
export function tabStripKeyAction(
  event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey">,
  tabs: readonly TabStripTab[],
  index: number,
  closable: boolean,
): TabStripKeyAction | null {
  const n = tabs.length;
  if (!n) return null;
  const at = (i: number) => tabs[(i + n) % n]!.id;
  switch (event.key) {
    case "ArrowRight":
      return { kind: "move", id: at(index + 1) };
    case "ArrowLeft":
      return { kind: "move", id: at(index - 1) };
    case "Home":
      return { kind: "move", id: at(0) };
    case "End":
      return { kind: "move", id: at(n - 1) };
  }
  const closeKey =
    event.key === "Delete" ||
    ((event.key === "w" || event.key === "W") &&
      (event.metaKey || event.ctrlKey));
  if (!closable || !closeKey) return null;
  const tab = tabs[index];
  if (!tab) return null;
  const next = tabs[index + 1] ?? tabs[index - 1] ?? null;
  return { kind: "close", id: tab.id, next: next?.id ?? null };
}
