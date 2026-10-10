import {
  DestroyRef,
  Directive,
  ElementRef,
  EnvironmentInjector,
  afterNextRender,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
} from "@angular/core";

import {
  SONE_TREE,
  createTypeaheadBuffer,
  isTypeaheadKey,
  typeaheadIndex,
  type SoneTreeHost,
  type SoneTreeItemRef,
} from "@surface-one/angular/core";

const EDITABLE =
  "input, textarea, select, [contenteditable]:not([contenteditable='false'])";

/** Keys that can expand or collapse rows, so the next render changes the row list. */
const STRUCTURE_KEYS = new Set(["ArrowLeft", "ArrowRight", "*"]);
/** Keys that move over the rendered rows. */
const NAV_KEYS = new Set([
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "*",
]);

/**
 * `[soneTree]` — the WAI-ARIA tree pattern over FLAT rows (`sone-tree-row`, or any
 * element with `[soneTreeItem]`): `role="tree"`, one Tab stop (roving tabindex),
 * ↑ / ↓ move, → expands or enters the first child, ← collapses or goes to the
 * parent, Home / End, typeahead, Enter / Space activate and `*` expands every
 * sibling. Rows keep rendering only what is expanded; the tree reads their order
 * from the DOM and their level from `aria-level`.
 *
 * Expand / collapse only change state; the rows they add or remove appear on the next
 * render. A navigation key that lands before it (key repeat, a fast typist) would walk
 * the stale rows, so it is held and replayed on the row once that render is done.
 */
@Directive({
  selector: "[soneTree]",
  exportAs: "soneTree",
  providers: [
    { provide: SONE_TREE, useExisting: forwardRef(() => SoneTreeDirective) },
  ],
  host: {
    role: "tree",
    "data-slot": "tree",
    "(keydown)": "onKeydown($event)",
    "(focusin)": "onFocusIn($event)",
  },
})
export class SoneTreeDirective implements SoneTreeHost {
  private readonly items = signal<readonly SoneTreeItemRef[]>([]);
  private readonly focused = signal<SoneTreeItemRef | null>(null);
  private readonly typeahead = createTypeaheadBuffer();
  // An environment injector makes afterNextRender schedule a render by itself, so a key
  // that changes nothing (→ on a leaf) cannot leave the hold waiting forever.
  private readonly injector = inject(EnvironmentInjector);
  /** A structure key was handled and its render has not happened yet. */
  private structurePending = false;

  constructor() {
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    // Capture phase: a held key must not reach the rows' own keydown handlers either.
    const hold = (event: Event): void =>
      this.holdUntilRendered(event as KeyboardEvent);
    host.addEventListener("keydown", hold, true);
    inject(DestroyRef).onDestroy(() =>
      host.removeEventListener("keydown", hold, true),
    );
  }

  /** The rows in document order. */
  readonly orderedItems = computed(() =>
    [...this.items()].sort((a, b) =>
      a.element.compareDocumentPosition(b.element) &
      Node.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    ),
  );

  /** The row Tab lands on: the last focused one, else the selected one, else the first. */
  readonly tabStop = computed(() => {
    const items = this.orderedItems();
    const focused = this.focused();
    if (focused && items.includes(focused)) return focused;
    return items.find((item) => item.selected()) ?? items[0] ?? null;
  });

  register(item: SoneTreeItemRef): () => void {
    this.items.update((items) => [...items, item]);
    return () => {
      this.items.update((items) => items.filter((i) => i !== item));
      if (this.focused() === item) this.focused.set(null);
    };
  }

  /** Moves focus to `item` (and makes it the Tab stop). */
  focusItem(item: SoneTreeItemRef): void {
    this.focused.set(item);
    item.element.focus();
  }

  protected onFocusIn(event: FocusEvent): void {
    const item = this.itemFor(event.target);
    if (item) this.focused.set(item);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    const target = event.target;
    // Keys typed into a field, or meant for a control with its own popup (a row
    // menu), stay theirs.
    if (
      !(target instanceof Element) ||
      target.closest(EDITABLE) ||
      target.closest("[aria-haspopup]")
    )
      return;
    const item = this.itemFor(target);
    if (!item) return;
    const items = this.orderedItems();
    const index = items.indexOf(item);
    let next: SoneTreeItemRef | undefined;
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
          next = this.parentOf(items, index);
        }
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        item.activate();
        return;
      case "*":
        for (const sibling of this.siblingsOf(items, index)) sibling.expand();
        break;
      default:
        if (isTypeaheadKey(event)) {
          const found = typeaheadIndex(
            items.map((i) => i.label()),
            index,
            this.typeahead(event.key),
          );
          if (found >= 0) next = items[found];
          else return;
        } else {
          return;
        }
    }
    event.preventDefault();
    if (next) this.focusItem(next);
  }

  private holdUntilRendered(event: KeyboardEvent): void {
    const row = event.target;
    if (
      !(row instanceof HTMLElement) ||
      row.getAttribute("role") !== "treeitem" ||
      !NAV_KEYS.has(event.key) ||
      event.altKey ||
      event.ctrlKey ||
      event.metaKey
    )
      return;
    if (this.structurePending) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const key = event.key;
      afterNextRender(
        () => {
          if (row.isConnected) {
            row.dispatchEvent(
              new KeyboardEvent("keydown", {
                key,
                bubbles: true,
                cancelable: true,
              }),
            );
          }
        },
        { injector: this.injector },
      );
      return;
    }
    if (STRUCTURE_KEYS.has(event.key)) {
      this.structurePending = true;
      afterNextRender(() => (this.structurePending = false), {
        injector: this.injector,
      });
    }
  }

  private itemFor(target: EventTarget | null): SoneTreeItemRef | null {
    if (!(target instanceof Node)) return null;
    // The innermost row holding the target.
    let best: SoneTreeItemRef | null = null;
    for (const item of this.items()) {
      if (
        item.element.contains(target) &&
        (!best || best.element.contains(item.element))
      ) {
        best = item;
      }
    }
    return best;
  }

  private parentOf(
    items: readonly SoneTreeItemRef[],
    index: number,
  ): SoneTreeItemRef | undefined {
    const level = items[index].level();
    for (let i = index - 1; i >= 0; i--) {
      if (items[i].level() < level) return items[i];
    }
    return undefined;
  }

  private siblingsOf(
    items: readonly SoneTreeItemRef[],
    index: number,
  ): SoneTreeItemRef[] {
    const level = items[index].level();
    const parent = this.parentOf(items, index);
    const start = parent ? items.indexOf(parent) + 1 : 0;
    const siblings: SoneTreeItemRef[] = [];
    for (let i = start; i < items.length; i++) {
      const l = items[i].level();
      if (l < level) break;
      if (l === level && items[i].expandable()) siblings.push(items[i]);
    }
    return siblings;
  }
}

/**
 * `[soneTreeItem]` — makes any element a row of the enclosing `[soneTree]` (for
 * rows that are not `sone-tree-row`, such as a "View all" link): `role="treeitem"`,
 * `aria-level`, `aria-expanded`, `aria-selected` and the roving tabindex. Enter /
 * Space click it; →/← emit `expandedChange`.
 */
@Directive({
  selector: "[soneTreeItem]",
  host: {
    role: "treeitem",
    "data-slot": "tree-item",
    "[attr.aria-level]": "level()",
    "[attr.aria-expanded]":
      "hasChildren() ? (expanded() ? 'true' : 'false') : null",
    "[attr.aria-selected]": "selected() ? 'true' : 'false'",
    "[attr.tabindex]": "tree?.tabStop() === this ? '0' : '-1'",
  },
})
export class SoneTreeItemDirective implements SoneTreeItemRef {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly tree = inject(SONE_TREE, { optional: true });

  /** 1-based nesting level. */
  readonly level = input(1);
  readonly hasChildren = input(false, { transform: booleanAttribute });
  readonly expanded = model(false);
  readonly selected = input(false, { transform: booleanAttribute });

  constructor() {
    const unregister = this.tree?.register(this);
    inject(DestroyRef).onDestroy(() => unregister?.());
  }

  expandable(): boolean {
    return this.hasChildren();
  }

  label(): string {
    return (this.element.textContent ?? "").trim();
  }

  expand(): void {
    if (this.hasChildren()) this.expanded.set(true);
  }

  collapse(): void {
    if (this.hasChildren()) this.expanded.set(false);
  }

  activate(): void {
    this.element.click();
  }
}

export const SONE_TREE_PARTS = [
  SoneTreeDirective,
  SoneTreeItemDirective,
] as const;

// Re-exported so a consumer of the tree needs one import.
export type { SoneTreeItemRef } from "@surface-one/angular/core";
