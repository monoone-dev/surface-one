import { defineComponent, h, onMounted, ref, type PropType } from "vue";

import { definePart, flag } from "../../utils/part";

export type MenuItemVariant = "default" | "destructive";

const inset = { inset: { type: Boolean, default: false } } as const;
const checked = { checked: { type: Boolean, default: false } } as const;

const checkedAttrs = (on: boolean) => ({
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
export const SoneMenuItem = definePart({
  name: "SoneMenuItem",
  tag: "button",
  className: "menu-item",
  slot: "menu-item",
  static: { role: "menuitem" },
  props: {
    variant: { type: String as PropType<MenuItemVariant>, default: "default" },
    ...inset,
  },
  attrs: (p) => ({ "data-variant": p.variant, "data-inset": flag(p.inset) }),
});

export const SoneMenuLabel = definePart({
  name: "SoneMenuLabel",
  tag: "p",
  className: "menu-label",
  slot: "menu-label",
  props: inset,
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

export const SoneMenuCheckboxItem = definePart({
  name: "SoneMenuCheckboxItem",
  tag: "button",
  className: "menu-item menu-item-checkable",
  slot: "menu-checkbox-item",
  static: { role: "menuitemcheckbox" },
  props: { ...checked, ...inset },
  attrs: (p) => ({ ...checkedAttrs(p.checked), "data-inset": flag(p.inset) }),
});

export const SoneMenuSwitchItem = definePart({
  name: "SoneMenuSwitchItem",
  tag: "button",
  className: "menu-item menu-item-switch",
  slot: "menu-switch-item",
  static: { role: "menuitemcheckbox" },
  props: checked,
  attrs: (p) => checkedAttrs(p.checked),
});

export const SoneMenuRadioItem = definePart({
  name: "SoneMenuRadioItem",
  tag: "button",
  className: "menu-item menu-item-checkable",
  slot: "menu-radio-item",
  static: { role: "menuitemradio" },
  props: { ...checked, ...inset },
  attrs: (p) => ({ ...checkedAttrs(p.checked), "data-inset": flag(p.inset) }),
});

export const SoneMenuSubTrigger = definePart({
  name: "SoneMenuSubTrigger",
  tag: "button",
  className: "menu-item menu-sub-trigger",
  slot: "menu-sub-trigger",
  static: { role: "menuitem", "aria-haspopup": "menu" },
  props: { open: { type: Boolean, default: false }, ...inset },
  attrs: (p) => ({
    "aria-expanded": p.open ? "true" : "false",
    "data-state": p.open ? "open" : "closed",
    "data-inset": flag(p.inset),
  }),
});

const SUB_GAP_PX = 4;
const SUB_MARGIN_PX = 8;

/** A submenu, placed beside its `anchor` (the sub trigger) once it renders. */
export const SoneMenuSub = defineComponent({
  name: "SoneMenuSub",
  props: {
    anchor: { type: Object as PropType<HTMLElement | null>, default: null },
  },
  setup(props, { slots }) {
    const el = ref<HTMLElement | null>(null);

    onMounted(() => {
      const anchor = props.anchor;
      const node = el.value;
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
    });

    return () =>
      h(
        "div",
        {
          ref: el,
          class: "menu menu-sub",
          "data-slot": "menu-sub-content",
          "data-anchored": flag(!!props.anchor),
        },
        slots.default?.(),
      );
  },
});

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
