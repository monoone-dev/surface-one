import { defineComponent, h, ref, type PropType } from "vue";

import {
  TREE_ROW_CARET_PATH,
  treeRowIconShapes,
  type TreeRowIcon,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { toElement } from "../../utils/part";
import {
  joinTree,
  treeRowTabindex,
  useSoneTree,
  type SoneTreeItemRef,
} from "../tree/tree";

export type { TreeRowIcon } from "@surface-one/core";

/**
 * `<sone-tree-row>` — one row of a FLAT, depth-tagged tree: nesting is drawn (the
 * indentation follows `depth`), not built, so the owner renders one `v-for` over the
 * visible lines. The row owns its whole box; trailing content goes in the default slot.
 *
 * Inside a `SoneTree` the row becomes a `role="treeitem"` with `aria-level` /
 * `aria-expanded` / `aria-selected` and the tree's roving tabindex; its own buttons
 * leave the Tab order. Outside a tree it is a pair of buttons.
 */
export const SoneTreeRow = defineComponent({
  name: "SoneTreeRow",
  props: {
    label: { type: String, required: true },
    depth: { type: Number, default: 0 },
    selected: { type: Boolean, default: false },
    icon: { type: String as PropType<TreeRowIcon>, default: "folder" },
    emoji: { type: String as PropType<string | null>, default: null },
    count: { type: Number as PropType<number | null>, default: null },
    expandable: { type: Boolean, default: false },
    expanded: { type: Boolean, default: false },
    /** `aria-level` inside a `SoneTree` (default: `depth + 1`). */
    level: { type: Number as PropType<number | null>, default: null },
    /** Whether the row has children, for `aria-expanded` (default: `expandable`). */
    hasChildren: {
      type: Boolean as PropType<boolean | null>,
      default: null,
    },
  },
  emits: {
    activate: () => true,
    toggleExpand: () => true,
  },
  setup(props, { slots, emit }) {
    const messages = useSoneMessages();
    const tree = useSoneTree();
    const el = ref<unknown>(null);
    const level = (): number => props.level ?? props.depth + 1;
    const hasChildren = (): boolean => props.hasChildren ?? props.expandable;
    const item: SoneTreeItemRef = {
      element: () => toElement(el.value),
      level,
      expandable: hasChildren,
      expanded: () => props.expanded,
      selected: () => props.selected,
      label: () => props.label,
      expand: () => {
        if (hasChildren() && !props.expanded) emit("toggleExpand");
      },
      collapse: () => {
        if (hasChildren() && props.expanded) emit("toggleExpand");
      },
      activate: () => emit("activate"),
    };
    joinTree(tree, item);

    const icon = () =>
      h(
        "span",
        { class: "row-icon", "data-icon": props.icon, "aria-hidden": "true" },
        props.emoji
          ? h("span", { class: "row-emoji" }, props.emoji)
          : h(
              "svg",
              { viewBox: "0 0 16 16", width: "15", height: "15", fill: "none" },
              treeRowIconShapes(props.icon).map((s) => h(s.tag, s.attrs)),
            ),
      );

    return () => {
      const m = messages.value;
      const inTree = !!tree;
      return h(
        "sone-tree-row",
        {
          ref: el,
          // The server prints `class=""` for an undefined class: leave the key out.
          ...(props.selected ? { class: "is-selected" } : {}),
          "data-slot": "sidebar-menu-item",
          "data-sidebar": "menu-item",
          "data-depth": props.depth,
          style: { "--tree-row-depth": props.depth },
          ...(inTree
            ? {
                role: "treeitem",
                "aria-level": level(),
                "aria-expanded": hasChildren()
                  ? String(props.expanded)
                  : undefined,
                "aria-selected": String(props.selected),
                tabindex: treeRowTabindex(tree, item),
              }
            : {}),
        },
        h(
          "div",
          {
            class: "row-box",
            "data-slot": "sidebar-menu-button",
            "data-sidebar": "menu-button",
            "data-size": "default",
            "data-active": props.selected ? "true" : undefined,
          },
          [
            props.expandable
              ? h(
                  "button",
                  {
                    type: "button",
                    class: ["caret", { "is-open": props.expanded }],
                    tabindex: inTree ? "-1" : undefined,
                    "aria-expanded": String(props.expanded),
                    "aria-label": props.expanded
                      ? m.treeCollapse(props.label)
                      : m.treeExpand(props.label),
                    onClick: () => emit("toggleExpand"),
                  },
                  h(
                    "svg",
                    {
                      viewBox: "0 0 24 24",
                      width: "16",
                      height: "16",
                      "aria-hidden": "true",
                    },
                    h("path", {
                      d: TREE_ROW_CARET_PATH,
                      stroke: "currentColor",
                      "stroke-width": "2",
                      "stroke-linecap": "round",
                      "stroke-linejoin": "round",
                      fill: "none",
                    }),
                  ),
                )
              : h("span", {
                  class: "caret caret--leaf",
                  "aria-hidden": "true",
                }),
            h(
              "button",
              {
                type: "button",
                class: "row-main",
                tabindex: inTree ? "-1" : undefined,
                "aria-pressed": inTree ? undefined : String(props.selected),
                onClick: () => emit("activate"),
              },
              [
                icon(),
                h(
                  "span",
                  { class: "row-label", title: props.label },
                  props.label,
                ),
                props.count !== null && props.count > 0
                  ? h(
                      "span",
                      {
                        class: "row-count",
                        "data-slot": "sidebar-menu-badge",
                        "data-sidebar": "menu-badge",
                      },
                      String(props.count),
                    )
                  : null,
              ],
            ),
            slots.default?.(),
          ],
        ),
      );
    };
  },
});
