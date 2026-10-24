"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ElementType,
  type FocusEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type Ref,
  type RefObject,
} from "react";

import {
  TREE_EDITABLE_SELECTOR,
  createTypeaheadBuffer,
  treeKeydown,
  treeTabStop,
  type SoneTreeNavItem,
} from "@surface-one/core";

import { useControllable } from "../../utils/controllable";
import { mergeRefs } from "../../utils/refs";

/** One row of a `SoneTree`: what the tree needs to move focus and expand / collapse it. */
export interface SoneTreeItemRef extends SoneTreeNavItem {
  element(): HTMLElement | null;
  selected(): boolean;
}

interface TreeContextValue {
  register(item: SoneTreeItemRef): () => void;
  /** A row's selection changed: the Tab stop may move. */
  refresh(): void;
  /** The one row that carries `tabindex="0"` (roving tabindex). */
  readonly tabStop: SoneTreeItemRef | null;
  /** The rows have mounted (before that, as on the server, the selected row is the Tab stop). */
  readonly mounted: boolean;
}

const TreeContext = createContext<TreeContextValue | null>(null);

/** The enclosing tree (`null` outside one). */
export function useSoneTree(): TreeContextValue | null {
  return useContext(TreeContext);
}

/** `tabIndex` of a row: the tree's Tab stop gets `0`, every other row `-1`. */
export function treeRowTabIndex(
  tree: TreeContextValue | null,
  item: SoneTreeItemRef,
  selected: boolean,
): 0 | -1 {
  if (tree && !tree.mounted) return selected ? 0 : -1;
  return tree?.tabStop === item ? 0 : -1;
}

/** A stable row record whose methods read the latest render's values. */
export function useTreeItemRef(
  tree: TreeContextValue | null,
  selected: boolean,
  read: () => Omit<SoneTreeItemRef, "element">,
): { item: SoneTreeItemRef; element: RefObject<HTMLElement | null> } {
  const element = useRef<HTMLElement | null>(null);
  const latest = useRef(read);
  latest.current = read;
  const item = useMemo<SoneTreeItemRef>(
    () => ({
      element: () => element.current,
      level: () => latest.current().level(),
      expandable: () => latest.current().expandable(),
      expanded: () => latest.current().expanded(),
      selected: () => latest.current().selected(),
      label: () => latest.current().label(),
      expand: () => latest.current().expand(),
      collapse: () => latest.current().collapse(),
      activate: () => latest.current().activate(),
    }),
    [],
  );
  const register = tree?.register;
  const refresh = tree?.refresh;
  useLayoutEffect(() => register?.(item), [register, item]);
  // The tree reads `selected` through the record, after its own render: tell it.
  const seen = useRef(selected);
  useLayoutEffect(() => {
    if (seen.current === selected) return;
    seen.current = selected;
    refresh?.();
  }, [selected, refresh]);
  return { item, element };
}

/** Document order; rows that have not mounted yet go last. */
function byDocumentOrder(a: SoneTreeItemRef, b: SoneTreeItemRef): number {
  const ea = a.element();
  const eb = b.element();
  if (!ea || !eb) return ea ? -1 : eb ? 1 : 0;
  return ea.compareDocumentPosition(eb) & Node.DOCUMENT_POSITION_FOLLOWING
    ? -1
    : 1;
}

/** What `handleRef` exposes. */
export interface SoneTreeHandle {
  /** Moves focus to `item` (and makes it the Tab stop). */
  focusItem(item: SoneTreeItemRef): void;
}

export interface SoneTreeProps extends HTMLAttributes<HTMLElement> {
  /** The element to render instead of a `<div>`. */
  readonly as?: ElementType;
  readonly handleRef?: Ref<SoneTreeHandle>;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `SoneTree` — the WAI-ARIA tree pattern over FLAT rows (`SoneTreeRow`, or any
 * `SoneTreeItem`): `role="tree"`, one Tab stop (roving tabindex), ↑ / ↓ move, →
 * expands or enters the first child, ← collapses or goes to the parent, Home / End,
 * typeahead, Enter / Space activate and `*` expands every sibling. Rows keep rendering
 * only what is expanded; the tree reads their order from the DOM and their level from
 * `aria-level`. (React renders the rows an expand adds before the next key arrives,
 * so no key is held as in Angular.)
 */
export function SoneTree({
  as = "div",
  handleRef,
  onKeyDown,
  onFocus,
  children,
  ...rest
}: SoneTreeProps): ReactElement {
  const [, refresh] = useReducer((n: number) => n + 1, 0);
  const items = useRef<readonly SoneTreeItemRef[]>([]);
  const [focused, setFocused] = useState<SoneTreeItemRef | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const typeahead = useMemo(() => createTypeaheadBuffer(), []);

  const ordered = (): SoneTreeItemRef[] =>
    [...items.current].sort(byDocumentOrder);
  const register = useCallback((item: SoneTreeItemRef) => {
    items.current = [...items.current, item];
    refresh();
    return () => {
      items.current = items.current.filter((i) => i !== item);
      setFocused((f) => (f === item ? null : f));
      refresh();
    };
  }, []);
  const tabStop = mounted
    ? treeTabStop(ordered(), focused, (item) => item.selected())
    : null;

  const focusItem = (item: SoneTreeItemRef): void => {
    setFocused(item);
    item.element()?.focus();
  };
  useImperativeHandle(handleRef, () => ({ focusItem }));

  /** The innermost row holding the target. */
  const itemFor = (target: EventTarget | null): SoneTreeItemRef | null => {
    if (!(target instanceof Node)) return null;
    let best: SoneTreeItemRef | null = null;
    for (const item of items.current) {
      const el = item.element();
      if (el?.contains(target) && (!best || best.element()?.contains(el))) {
        best = item;
      }
    }
    return best;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>): void => {
    onKeyDown?.(event);
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
      target.closest(TREE_EDITABLE_SELECTOR) ||
      target.closest("[aria-haspopup]")
    )
      return;
    const item = itemFor(target);
    if (!item) return;
    const rows = ordered();
    const { handled, next } = treeKeydown(
      event,
      rows,
      rows.indexOf(item),
      typeahead,
    );
    if (!handled) return;
    event.preventDefault();
    if (next) focusItem(next);
  };

  const context = useMemo<TreeContextValue>(
    () => ({ register, refresh, tabStop, mounted }),
    [register, tabStop, mounted],
  );

  return createElement(
    as,
    {
      ...rest,
      role: "tree",
      "data-slot": "tree",
      onKeyDown: handleKeyDown,
      // React's onFocus bubbles, as `focusin` does.
      onFocus: (event: FocusEvent<HTMLElement>) => {
        onFocus?.(event);
        const item = itemFor(event.target);
        if (item) setFocused(item);
      },
    },
    <TreeContext.Provider value={context}>{children}</TreeContext.Provider>,
  );
}

export interface SoneTreeItemProps extends HTMLAttributes<HTMLElement> {
  /** The element to render instead of a `<div>`. */
  readonly as?: ElementType;
  /** 1-based nesting level. */
  readonly level?: number;
  readonly hasChildren?: boolean;
  /** Shown children (controlled), with `onExpandedChange`; or `defaultExpanded`. */
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly selected?: boolean;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `SoneTreeItem` — makes any element a row of the enclosing `SoneTree` (for rows that
 * are not `SoneTreeRow`, such as a "View all" link): `role="treeitem"`, `aria-level`,
 * `aria-expanded`, `aria-selected` and the roving tabindex. Enter / Space click it;
 * → / ← call `onExpandedChange`.
 */
export function SoneTreeItem({
  as = "div",
  level = 1,
  hasChildren = false,
  expanded: expandedProp,
  defaultExpanded = false,
  onExpandedChange,
  selected = false,
  ref,
  ...rest
}: SoneTreeItemProps): ReactElement {
  const tree = useSoneTree();
  const [expanded, setExpanded] = useControllable(
    expandedProp,
    defaultExpanded,
    onExpandedChange,
  );
  const { item, element } = useTreeItemRef(tree, selected, () => ({
    level: () => level,
    expandable: () => hasChildren,
    expanded: () => expanded,
    selected: () => selected,
    label: () => (element.current?.textContent ?? "").trim(),
    expand: () => {
      if (hasChildren) setExpanded(true);
    },
    collapse: () => {
      if (hasChildren) setExpanded(false);
    },
    activate: () => element.current?.click(),
  }));
  return createElement(as, {
    ...rest,
    ref: mergeRefs(element, ref),
    role: "treeitem",
    "data-slot": "tree-item",
    "aria-level": level,
    "aria-expanded": hasChildren ? (expanded ? "true" : "false") : undefined,
    "aria-selected": selected ? "true" : "false",
    tabIndex: treeRowTabIndex(tree, item, selected),
  });
}
