"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type Ref,
} from "react";

import { cx, definePart, flag } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export type MenuItemVariant = "default" | "destructive";

const checkedAttrs = (on: boolean | undefined) => ({
  "aria-checked": on ? "true" : "false",
  "data-state": on ? "checked" : "unchecked",
});

/**
 * The menu surface (`role="menu"` unless you pass another `role`). Opening,
 * closing and positioning stay with the owner.
 */
export const SoneMenu = definePart({
  name: "SoneMenu",
  tag: "div",
  className: "menu",
  slot: "menu",
  static: { role: "menu" },
});

/** A menu item (`role="menuitem"`; pass `role="option"` inside a listbox). */
export const SoneMenuItem = definePart<
  "button",
  { variant?: MenuItemVariant; inset?: boolean }
>({
  name: "SoneMenuItem",
  tag: "button",
  className: "menu-item",
  slot: "menu-item",
  static: { role: "menuitem" },
  props: ["variant", "inset"],
  attrs: (p) => ({
    "data-variant": p.variant ?? "default",
    "data-inset": flag(p.inset),
  }),
});

export const SoneMenuLabel = definePart<"p", { inset?: boolean }>({
  name: "SoneMenuLabel",
  tag: "p",
  className: "menu-label",
  slot: "menu-label",
  props: ["inset"],
  attrs: (p) => ({ "data-inset": flag(p.inset) }),
});

export const SoneMenuGroup = definePart({
  name: "SoneMenuGroup",
  tag: "div",
  className: "menu-group",
  slot: "menu-group",
  static: { role: "group" },
});

export const SoneMenuSeparator = definePart({
  name: "SoneMenuSeparator",
  tag: "div",
  className: "menu-separator",
  slot: "menu-separator",
  static: { role: "separator" },
});

export const SoneMenuShortcut = definePart({
  name: "SoneMenuShortcut",
  tag: "span",
  className: "menu-shortcut",
  slot: "menu-shortcut",
});

export const SoneMenuCheckboxItem = definePart<
  "button",
  { checked?: boolean; inset?: boolean }
>({
  name: "SoneMenuCheckboxItem",
  tag: "button",
  className: "menu-item menu-item-checkable",
  slot: "menu-checkbox-item",
  static: { role: "menuitemcheckbox" },
  props: ["checked", "inset"],
  attrs: (p) => ({ ...checkedAttrs(p.checked), "data-inset": flag(p.inset) }),
});

export const SoneMenuSwitchItem = definePart<"button", { checked?: boolean }>({
  name: "SoneMenuSwitchItem",
  tag: "button",
  className: "menu-item menu-item-switch",
  slot: "menu-switch-item",
  static: { role: "menuitemcheckbox" },
  props: ["checked"],
  attrs: (p) => checkedAttrs(p.checked),
});

export const SoneMenuRadioItem = definePart<
  "button",
  { checked?: boolean; inset?: boolean }
>({
  name: "SoneMenuRadioItem",
  tag: "button",
  className: "menu-item menu-item-checkable",
  slot: "menu-radio-item",
  static: { role: "menuitemradio" },
  props: ["checked", "inset"],
  attrs: (p) => ({ ...checkedAttrs(p.checked), "data-inset": flag(p.inset) }),
});

export const SoneMenuSubTrigger = definePart<
  "button",
  { open?: boolean; inset?: boolean }
>({
  name: "SoneMenuSubTrigger",
  tag: "button",
  className: "menu-item menu-sub-trigger",
  slot: "menu-sub-trigger",
  static: { role: "menuitem", "aria-haspopup": "menu" },
  props: ["open", "inset"],
  attrs: (p) => ({
    "aria-expanded": p.open ? "true" : "false",
    "data-state": p.open ? "open" : "closed",
    "data-inset": flag(p.inset),
  }),
});

const SUB_GAP_PX = 4;
const SUB_MARGIN_PX = 8;

export interface SoneMenuSubProps extends HTMLAttributes<HTMLDivElement> {
  /** The sub trigger the submenu is placed beside. */
  readonly anchor?: HTMLElement | null;
  readonly ref?: Ref<HTMLDivElement>;
}

/** A submenu, placed beside its `anchor` (the sub trigger) once it renders. */
export function SoneMenuSub({
  anchor = null,
  className,
  ref,
  ...rest
}: SoneMenuSubProps) {
  const el = useRef<HTMLDivElement | null>(null);
  const setRef = useMemo(() => mergeRefs(el, ref), [ref]);

  useLayoutEffect(() => {
    const node = el.current;
    if (!anchor || !node?.isConnected) return;
    const rect = anchor.getBoundingClientRect();
    const parent = anchor.closest<HTMLElement>('[data-slot="menu"]');
    const edge = parent?.getBoundingClientRect() ?? rect;
    const width = node.offsetWidth;
    const right = edge.right + SUB_GAP_PX;
    const left =
      right + width <= window.innerWidth - SUB_MARGIN_PX
        ? right
        : Math.max(SUB_MARGIN_PX, edge.left - width - SUB_GAP_PX);
    const maxHeight = window.innerHeight - 2 * SUB_MARGIN_PX;
    if (node.offsetHeight > maxHeight) {
      node.style.maxHeight = `${Math.floor(maxHeight)}px`;
    }
    const height = Math.min(node.offsetHeight, maxHeight);
    const top = Math.max(
      SUB_MARGIN_PX,
      Math.min(rect.top, window.innerHeight - SUB_MARGIN_PX - height),
    );
    node.style.left = `${Math.round(left)}px`;
    node.style.top = `${Math.round(top)}px`;
    node.dataset["placed"] = "";
    // Placed once, when it renders — as the Vue `onMounted`.
  }, []);

  return (
    <div
      {...rest}
      ref={setRef}
      className={cx("menu menu-sub", className)}
      data-slot="menu-sub-content"
      data-anchored={flag(!!anchor)}
    />
  );
}

export const SonePopover = definePart({
  name: "SonePopover",
  tag: "div",
  className: "popover",
  slot: "popover",
});

export const SonePopoverHeader = definePart({
  name: "SonePopoverHeader",
  tag: "div",
  className: "popover-header",
  slot: "popover-header",
});

export const SonePopoverTitle = definePart({
  name: "SonePopoverTitle",
  tag: "p",
  className: "popover-title",
  slot: "popover-title",
});

export const SonePopoverDescription = definePart({
  name: "SonePopoverDescription",
  tag: "p",
  className: "popover-description",
  slot: "popover-description",
});
