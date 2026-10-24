// The WAI-ARIA tree keys over flat rows, with no framework in it: `[soneTree]` and the
// Vue and React twins (through @surface-one/core) move, expand and collapse the same way.
import { isTypeaheadKey, typeaheadIndex } from "./list-navigation";

/** What the tree keys need from a row (`SoneTreeItemRef` without its element). */
export interface SoneTreeNavItem {
  /** 1-based nesting level (`aria-level`). */
  level(): number;
  /** Has children that can be shown or hidden. */
  expandable(): boolean;
  expanded(): boolean;
  /** The text typeahead matches. */
  label(): string;
  /** Show the children (no-op when already expanded). */
  expand(): void;
  /** Hide the children (no-op when collapsed). */
  collapse(): void;
  /** Enter / Space: what a click on the row does. */
  activate(): void;
}

/** Keys typed into these stay theirs: a tree never moves while one has focus. */
export const TREE_EDITABLE_SELECTOR =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

export interface SoneTreeKeyEvent {
  readonly key: string;
  readonly altKey?: boolean;
  readonly ctrlKey?: boolean;
  readonly metaKey?: boolean;
}

/** What a key did: `handled` (prevent its default), and the row to focus next, if any. */
export interface SoneTreeKeyResult<T> {
  readonly handled: boolean;
  readonly next?: T;
}

/**
 * Handles one key on `items[index]` (the rows in document order): ↑ / ↓ move,
 * → expands or enters the first child, ← collapses or goes to the parent,
 * Home / End, Enter / Space activate, `*` expands every sibling and a printable
 * character runs typeahead (`typeahead` collects it into the query). Expanding,
 * collapsing and activating happen here; moving focus to `next` is the caller's.
 */
export function treeKeydown<T extends SoneTreeNavItem>(
  event: SoneTreeKeyEvent,
  items: readonly T[],
  index: number,
  typeahead: (char: string) => string,
): SoneTreeKeyResult<T> {
  const item = items[index];
  if (!item || event.altKey || event.ctrlKey || event.metaKey) {
    return { handled: false };
  }
  let next: T | undefined;
  switch (event.key) {
    case "ArrowDown":
      next = items[index + 1];
      break;
    case "ArrowUp":
      next = items[index - 1];
      break;
    case "Home":
      next = items[0];
      break;
    case "End":
      next = items[items.length - 1];
      break;
    case "ArrowRight":
      if (item.expandable() && !item.expanded()) {
        item.expand();
      } else if (item.expanded()) {
        const child = items[index + 1];
        if (child && child.level() > item.level()) next = child;
      }
      break;
    case "ArrowLeft":
      if (item.expandable() && item.expanded()) {
        item.collapse();
      } else {
        next = treeParentOf(items, index);
      }
      break;
    case "Enter":
    case " ":
      item.activate();
      return { handled: true };
    case "*":
      for (const sibling of treeSiblingsOf(items, index)) sibling.expand();
      break;
    default: {
      if (!isTypeaheadKey(event)) return { handled: false };
      const found = typeaheadIndex(
        items.map((i) => i.label()),
        index,
        typeahead(event.key),
      );
      if (found < 0) return { handled: false };
      next = items[found];
    }
  }
  return { handled: true, next };
}

/** The nearest row above `index` with a lower level. */
export function treeParentOf<T extends SoneTreeNavItem>(
  items: readonly T[],
  index: number,
): T | undefined {
  const level = items[index].level();
  for (let i = index - 1; i >= 0; i--) {
    if (items[i].level() < level) return items[i];
  }
  return undefined;
}

/** The expandable rows at the same level under the same parent as `index`. */
export function treeSiblingsOf<T extends SoneTreeNavItem>(
  items: readonly T[],
  index: number,
): T[] {
  const level = items[index].level();
  const parent = treeParentOf(items, index);
  const start = parent ? items.indexOf(parent) + 1 : 0;
  const siblings: T[] = [];
  for (let i = start; i < items.length; i++) {
    const l = items[i].level();
    if (l < level) break;
    if (l === level && items[i].expandable()) siblings.push(items[i]);
  }
  return siblings;
}

/** The row Tab lands on: the last focused one, else the selected one, else the first. */
export function treeTabStop<T>(
  items: readonly T[],
  focused: T | null,
  selected: (item: T) => boolean,
): T | null {
  if (focused && items.includes(focused)) return focused;
  return items.find(selected) ?? items[0] ?? null;
}
