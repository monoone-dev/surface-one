"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  type HTMLAttributes,
  type Ref,
} from "react";

import {
  menuCheckedAttrs as checkedAttrs,
  placeSubmenu,
} from "@surface-one/core";

import { cx, definePart, flag } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export type MenuItemVariant = "default" | "destructive";

/**
 * The menu surface (`role="menu"` unless you pass another `role`). Pass it as the
 * `menu` of a `SoneMenuTrigger` to open, place and drive it from a menu button;
 * elsewhere, opening, closing and positioning stay with the owner.
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
    if (anchor && node?.isConnected) placeSubmenu(node, anchor);
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
