"use client";

import {
  createElement,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  TREE_ROW_CARET_PATH,
  treeRowIconShapes,
  type TreeRowIcon,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";
import { treeRowTabIndex, useSoneTree, useTreeItemRef } from "../tree/tree";

export type { TreeRowIcon } from "@surface-one/core";

export interface SoneTreeRowProps extends HTMLAttributes<HTMLElement> {
  readonly label: string;
  readonly depth?: number;
  readonly selected?: boolean;
  readonly icon?: TreeRowIcon;
  readonly emoji?: string | null;
  readonly count?: number | null;
  readonly expandable?: boolean;
  readonly expanded?: boolean;
  /** `aria-level` inside a `SoneTree` (default: `depth + 1`). */
  readonly level?: number | null;
  /** Whether the row has children, for `aria-expanded` (default: `expandable`). */
  readonly hasChildren?: boolean | null;
  /** The row was clicked (or Enter / Space pressed on it in a tree). */
  readonly onActivate?: () => void;
  /** The caret was clicked (or → / ← asked to expand / collapse it in a tree). */
  readonly onToggleExpand?: () => void;
  /** Trailing content inside the row box. */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-tree-row>` — one row of a FLAT, depth-tagged tree: nesting is drawn (the
 * indentation follows `depth`), not built, so the owner maps over the visible lines.
 * The row owns its whole box; trailing content goes in `children`.
 *
 * Inside a `SoneTree` the row becomes a `role="treeitem"` with `aria-level` /
 * `aria-expanded` / `aria-selected` and the tree's roving tabindex; its own buttons
 * leave the Tab order. Outside a tree it is a pair of buttons.
 */
export function SoneTreeRow({
  label,
  depth = 0,
  selected = false,
  icon = "folder",
  emoji = null,
  count = null,
  expandable = false,
  expanded = false,
  level: levelProp = null,
  hasChildren: hasChildrenProp = null,
  onActivate,
  onToggleExpand,
  className,
  style,
  children,
  ref,
  ...rest
}: SoneTreeRowProps): ReactElement {
  const m = useSoneMessages();
  const tree = useSoneTree();
  const inTree = !!tree;
  const level = levelProp ?? depth + 1;
  const hasChildren = hasChildrenProp ?? expandable;
  const { item, element } = useTreeItemRef(tree, selected, () => ({
    level: () => level,
    expandable: () => hasChildren,
    expanded: () => expanded,
    selected: () => selected,
    label: () => label,
    expand: () => {
      if (hasChildren && !expanded) onToggleExpand?.();
    },
    collapse: () => {
      if (hasChildren && expanded) onToggleExpand?.();
    },
    activate: () => onActivate?.(),
  }));

  const host: Record<string, unknown> = {
    ...rest,
    ref: mergeRefs(element, ref),
    className: cx(selected ? "is-selected" : undefined, className),
    "data-slot": "sidebar-menu-item",
    "data-sidebar": "menu-item",
    "data-depth": depth,
    style: { "--tree-row-depth": depth, ...style } as CSSProperties,
    ...(inTree
      ? {
          role: "treeitem",
          "aria-level": level,
          "aria-expanded": hasChildren ? String(expanded) : undefined,
          "aria-selected": String(selected),
          tabIndex: treeRowTabIndex(tree, item, selected),
        }
      : {}),
  };
  return createElement(
    "sone-tree-row",
    host,
    <div
      className="row-box"
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size="default"
      data-active={selected ? "true" : undefined}
    >
      {expandable ? (
        <button
          type="button"
          className={cx("caret", expanded ? "is-open" : undefined)}
          tabIndex={inTree ? -1 : undefined}
          aria-expanded={expanded ? "true" : "false"}
          aria-label={expanded ? m.treeCollapse(label) : m.treeExpand(label)}
          onClick={() => onToggleExpand?.()}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path
              d={TREE_ROW_CARET_PATH}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </button>
      ) : (
        <span className="caret caret--leaf" aria-hidden="true" />
      )}
      <button
        type="button"
        className="row-main"
        tabIndex={inTree ? -1 : undefined}
        aria-pressed={inTree ? undefined : selected ? "true" : "false"}
        onClick={() => onActivate?.()}
      >
        <span className="row-icon" data-icon={icon} aria-hidden="true">
          {emoji ? (
            <span className="row-emoji">{emoji}</span>
          ) : (
            <svg viewBox="0 0 16 16" width="15" height="15" fill="none">
              {treeRowIconShapes(icon).map((s, i) =>
                createElement(s.tag, { key: i, ...svgProps(s.attrs) }),
              )}
            </svg>
          )}
        </span>
        <span className="row-label" title={label}>
          {label}
        </span>
        {count !== null && count > 0 ? (
          <span
            className="row-count"
            data-slot="sidebar-menu-badge"
            data-sidebar="menu-badge"
          >
            {count}
          </span>
        ) : null}
      </button>
      {children}
    </div>,
  );
}

/** SVG attributes as React props (`stroke-width` → `strokeWidth`). */
function svgProps(attrs: Readonly<Record<string, string>>) {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(attrs))
    out[k.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())] = v;
  return out;
}
