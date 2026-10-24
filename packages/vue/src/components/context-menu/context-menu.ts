import {
  Teleport,
  defineComponent,
  h,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";

import {
  createContextMenuTrigger,
  type FloatingAlign,
  type FloatingSide,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, renderAs, toElement } from "../../utils/part";

/**
 * `<SoneContextMenuTrigger>` — the Vue twin of `[soneContextMenuTrigger]` (spartan/ui
 * `brnContextMenuTrigger`, Radix ContextMenu): an area (a `<div>` unless `as` says
 * otherwise) that opens the `#menu` slot (a `SoneMenu`) where it is asked for — a right
 * click at the pointer, a long press at the finger, the ContextMenu key or Shift+F10 at
 * the area on its first item. The menu behaves as a `SoneMenuTrigger`'s: Arrow keys,
 * typeahead, closes on activation, Escape, Tab or a click outside. The slot gets
 * `close`. Give the area `tabindex="0"` so the keyboard can reach it.
 */
export const SoneContextMenuTrigger = defineComponent({
  name: "SoneContextMenuTrigger",
  inheritAttrs: false,
  props: {
    ...asProp,
    /** Shown or not — `v-model:open`. */
    open: { type: Boolean, default: false },
    /** Leave the browser's own context menu alone. */
    disabled: { type: Boolean, default: false },
    /** The side of the pointer the menu opens on; it flips when that side lacks room. */
    side: { type: String as PropType<FloatingSide>, default: "bottom" },
    /** Alignment at the pointer. */
    align: { type: String as PropType<FloatingAlign>, default: "start" },
    /** Gap between the pointer and the menu, in px. */
    offset: { type: Number, default: 4 },
    /** Keep the menu open on a click outside it (Escape still closes it). */
    keepOpenOnOutsideClick: { type: Boolean, default: false },
  },
  emits: {
    "update:open": (_open: boolean) => true,
  },
  setup(props, { attrs, slots, emit, expose }) {
    const open = useModel(
      () => props.open,
      (value) => emit("update:open", value),
    );
    const area = ref<unknown>(null);
    const positioner = ref<HTMLElement | null>(null);

    const menu = createContextMenuTrigger({
      trigger: () => toElement(area.value),
      positioner: () => positioner.value,
      isOpen: () => open.value,
      setOpen: (value) => {
        if (open.value !== value) open.set(value);
      },
      side: () => props.side,
      align: () => props.align,
      offset: () => props.offset,
      keepOpenOnOutsideClick: () => props.keepOpenOnOutsideClick,
      disabled: () => props.disabled,
    });

    onMounted(() => {
      if (open.value) menu.attached();
      // After the DOM update: the positioner is on <body> (or gone).
      watch(open, (isOpen) => (isOpen ? menu.attached() : menu.detached()), {
        flush: "post",
      });
    });
    onBeforeUnmount(menu.detached);

    const close = (): void => menu.close(true);
    expose({
      /** Opens the menu at a viewport point, or at the area for `null`. */
      openAt: menu.openAt,
      /** Closes the menu; with `restoreFocus`, focus goes back to the area. */
      close: (restoreFocus?: boolean) => menu.close(restoreFocus),
      reposition: () => menu.reposition(),
    });

    return () => {
      const isOpen = open.value;
      return [
        renderAs(
          props.as ?? "div",
          mergeProps(attrs, {
            ref: area,
            "data-slot": "context-menu-trigger",
            "data-disabled": props.disabled ? "" : undefined,
            "data-state": isOpen ? "open" : "closed",
            onContextmenu: menu.contextMenu,
            onPointerdown: menu.pointerDown,
            onPointermove: menu.pointerMove,
            onPointerup: menu.pointerEnd,
            onPointercancel: menu.pointerEnd,
            onPointerleave: menu.pointerEnd,
            onClick: () => menu.click(),
            onKeydown: menu.keyDown,
          }),
          // The `#menu` slot is ours, not the area's.
          { default: slots.default },
        ),
        isOpen
          ? h(
              Teleport,
              { to: "body" },
              h(
                "div",
                {
                  ref: positioner,
                  class: "overlay-positioner",
                  "data-slot": "overlay-positioner",
                },
                slots["menu"]?.({ close }),
              ),
            )
          : null,
      ];
    };
  },
});
