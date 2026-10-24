import {
  computed,
  defineComponent,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  shallowRef,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from "vue";

import {
  TREE_EDITABLE_SELECTOR,
  createTypeaheadBuffer,
  treeKeydown,
  treeTabStop,
  type SoneTreeNavItem,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, renderAs, toElement } from "../../utils/part";

/** One row of a `SoneTree`: what the tree needs to move focus and expand / collapse it. */
export interface SoneTreeItemRef extends SoneTreeNavItem {
  element(): HTMLElement | null;
  selected(): boolean;
}

interface TreeContext {
  register(item: SoneTreeItemRef): () => void;
  /** The one row that carries `tabindex="0"` (roving tabindex). */
  readonly tabStop: ComputedRef<SoneTreeItemRef | null>;
  /** The rows have mounted (before that, as on the server, the selected row is the Tab stop). */
  readonly mounted: Ref<boolean>;
}

const TREE: InjectionKey<TreeContext> = Symbol("SoneTree");

/** The enclosing tree (`null` outside one). */
export function useSoneTree(): TreeContext | null {
  return inject(TREE, null);
}

/** `tabindex` of a row: the tree's Tab stop gets `0`, every other row `-1`. */
export function treeRowTabindex(
  tree: TreeContext | null,
  item: SoneTreeItemRef,
): "0" | "-1" {
  if (tree && !tree.mounted.value) return item.selected() ? "0" : "-1";
  return tree?.tabStop.value === item ? "0" : "-1";
}

/** Joins a row to the enclosing tree for as long as it is mounted. */
export function joinTree(
  tree: TreeContext | null,
  item: SoneTreeItemRef,
): void {
  if (!tree) return;
  const leave = tree.register(item);
  onBeforeUnmount(leave);
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

/**
 * `SoneTree` — the WAI-ARIA tree pattern over FLAT rows (`SoneTreeRow`, or any
 * element in a `SoneTreeItem`): `role="tree"`, one Tab stop (roving tabindex),
 * ↑ / ↓ move, → expands or enters the first child, ← collapses or goes to the
 * parent, Home / End, typeahead, Enter / Space activate and `*` expands every
 * sibling. Rows keep rendering only what is expanded; the tree reads their order
 * from the DOM and their level from `aria-level`. (Vue flushes the rows an expand
 * adds before the next key arrives, so no key is held as in Angular.)
 */
export const SoneTree = defineComponent({
  name: "SoneTree",
  props: asProp,
  setup(props, { slots, expose }) {
    const items = shallowRef<readonly SoneTreeItemRef[]>([]);
    const focused = shallowRef<SoneTreeItemRef | null>(null);
    const mounted = ref(false);
    onMounted(() => (mounted.value = true));
    const typeahead = createTypeaheadBuffer();

    /** The rows in document order. */
    const orderedItems = computed(() => [...items.value].sort(byDocumentOrder));
    const tabStop = computed(() =>
      treeTabStop(orderedItems.value, focused.value, (item) => item.selected()),
    );

    provide(TREE, {
      tabStop,
      mounted,
      register(item) {
        items.value = [...items.value, item];
        return () => {
          items.value = items.value.filter((i) => i !== item);
          if (focused.value === item) focused.value = null;
        };
      },
    });

    /** Moves focus to `item` (and makes it the Tab stop). */
    const focusItem = (item: SoneTreeItemRef): void => {
      focused.value = item;
      item.element()?.focus();
    };
    expose({ focusItem });

    /** The innermost row holding the target. */
    const itemFor = (target: EventTarget | null): SoneTreeItemRef | null => {
      if (!(target instanceof Node)) return null;
      let best: SoneTreeItemRef | null = null;
      for (const item of items.value) {
        const el = item.element();
        if (el?.contains(target) && (!best || best.element()?.contains(el))) {
          best = item;
        }
      }
      return best;
    };

    const onFocusin = (event: FocusEvent): void => {
      const item = itemFor(event.target);
      if (item) focused.value = item;
    };

    const onKeydown = (event: KeyboardEvent): void => {
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
      const ordered = orderedItems.value;
      const { handled, next } = treeKeydown(
        event,
        ordered,
        ordered.indexOf(item),
        typeahead,
      );
      if (!handled) return;
      event.preventDefault();
      if (next) focusItem(next);
    };

    return () =>
      renderAs(
        props.as ?? "div",
        { role: "tree", "data-slot": "tree", onKeydown, onFocusin },
        slots,
      );
  },
});

/**
 * `SoneTreeItem` — makes any element a row of the enclosing `SoneTree` (for rows
 * that are not `SoneTreeRow`, such as a "View all" link): `role="treeitem"`,
 * `aria-level`, `aria-expanded`, `aria-selected` and the roving tabindex. Enter /
 * Space click it; → / ← update `v-model:expanded`.
 */
export const SoneTreeItem = defineComponent({
  name: "SoneTreeItem",
  props: {
    ...asProp,
    /** 1-based nesting level. */
    level: { type: Number, default: 1 },
    hasChildren: { type: Boolean, default: false },
    expanded: { type: Boolean, default: false },
    selected: { type: Boolean, default: false },
  },
  emits: { "update:expanded": (_value: boolean) => true },
  setup(props, { slots, emit }) {
    const tree = useSoneTree();
    const el = ref<unknown>(null);
    const expanded = useModel(
      () => props.expanded,
      (v) => emit("update:expanded", v),
    );
    const item: SoneTreeItemRef = {
      element: () => toElement(el.value),
      level: () => props.level,
      expandable: () => props.hasChildren,
      expanded: () => expanded.value,
      selected: () => props.selected,
      label: () => (toElement(el.value)?.textContent ?? "").trim(),
      expand: () => {
        if (props.hasChildren) expanded.set(true);
      },
      collapse: () => {
        if (props.hasChildren) expanded.set(false);
      },
      activate: () => toElement(el.value)?.click(),
    };
    joinTree(tree, item);
    return () =>
      renderAs(
        props.as ?? "div",
        {
          ref: el,
          role: "treeitem",
          "data-slot": "tree-item",
          "aria-level": props.level,
          "aria-expanded": props.hasChildren
            ? expanded.value
              ? "true"
              : "false"
            : undefined,
          "aria-selected": props.selected ? "true" : "false",
          tabindex: treeRowTabindex(tree, item),
        },
        slots,
      );
  },
});
