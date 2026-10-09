import { InjectionToken, type Signal } from "@angular/core";

/**
 * One row of a `[soneTree]`: what the tree needs to move focus and expand /
 * collapse it. `sone-tree-row` and `[soneTreeItem]` implement it; the token lives
 * here so the row needs no import of the tree.
 */
export interface SoneTreeItemRef {
  readonly element: HTMLElement;
  /** 1-based nesting level (`aria-level`). */
  level(): number;
  /** Has children that can be shown or hidden. */
  expandable(): boolean;
  expanded(): boolean;
  selected(): boolean;
  /** The text typeahead matches. */
  label(): string;
  /** Show the children (no-op when already expanded). */
  expand(): void;
  /** Hide the children (no-op when collapsed). */
  collapse(): void;
  /** Enter / Space: what a click on the row does. */
  activate(): void;
}

export interface SoneTreeHost {
  register(item: SoneTreeItemRef): () => void;
  /** The one item that carries `tabindex="0"` (roving tabindex). */
  readonly tabStop: Signal<SoneTreeItemRef | null>;
}

export const SONE_TREE = new InjectionToken<SoneTreeHost>("SONE_TREE");
