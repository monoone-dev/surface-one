import {
  Teleport,
  defineComponent,
  h,
  inject,
  mergeProps,
  onBeforeUnmount,
  onMounted,
  provide,
  ref,
  watch,
  type InjectionKey,
  type PropType,
} from "vue";

import {
  createMenubar,
  createMenuTrigger,
  type FloatingAlign,
  type FloatingSide,
  type Menubar,
  type MenubarMenu,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, renderAs, toElement } from "../../utils/part";

const MENUBAR: InjectionKey<Menubar> = Symbol("SoneMenubar");

/**
 * `<SoneMenubar>` — the Vue twin of `[soneMenubar]` (spartan/ui Menubar, WAI-ARIA
 * menubar pattern): `role="menubar"`, one Tab stop (roving tabindex) over its
 * `SoneMenubarTrigger`s, ArrowLeft / ArrowRight, Home and End between them. Name it
 * with `aria-label`.
 */
export const SoneMenubar = defineComponent({
  name: "SoneMenubar",
  props: { ...asProp },
  setup(props, { slots }) {
    provide(MENUBAR, createMenubar());
    return () =>
      renderAs(
        props.as ?? "div",
        { class: "menubar", "data-slot": "menubar", role: "menubar" },
        slots,
      );
  },
});

/**
 * `<SoneMenubarTrigger>` — a top-level item of a `SoneMenubar` (`role="menuitem"`,
 * `aria-haspopup="menu"`, `aria-expanded`) that opens its `#menu` slot (a `SoneMenu`)
 * like a `SoneMenuTrigger`; inside it ArrowLeft / ArrowRight close it and open the
 * neighbouring menu, and once a menu is open, hovering another trigger switches to it.
 * The slot gets `close`.
 */
export const SoneMenubarTrigger = defineComponent({
  name: "SoneMenubarTrigger",
  inheritAttrs: false,
  props: {
    ...asProp,
    /** Shown or not — `v-model:open`. */
    open: { type: Boolean, default: false },
    /** The side of the trigger the menu opens on; it flips when that side lacks room. */
    side: { type: String as PropType<FloatingSide>, default: "bottom" },
    /** Alignment along the trigger's edge. */
    align: { type: String as PropType<FloatingAlign>, default: "start" },
    /** Gap between the trigger and the menu, in px. */
    offset: { type: Number, default: 4 },
  },
  emits: {
    "update:open": (_open: boolean) => true,
  },
  setup(props, { attrs, slots, emit, expose }) {
    const bar = inject(MENUBAR, null);
    const open = useModel(
      () => props.open,
      (value) => emit("update:open", value),
    );
    const trigger = ref<unknown>(null);
    const positioner = ref<HTMLElement | null>(null);
    const controls = ref<string | null>(null);
    let entry: MenubarMenu | null = null;

    const menu = createMenuTrigger({
      trigger: () => toElement(trigger.value),
      positioner: () => positioner.value,
      isOpen: () => open.value,
      setOpen: (value) => {
        if (open.value !== value) open.set(value);
      },
      side: () => props.side,
      align: () => props.align,
      offset: () => props.offset,
      keepOpenOnOutsideClick: () => false,
      controls: (id) => (controls.value = id),
      panelKeyDown: (event) =>
        !!entry &&
        !!bar?.panelKeyDown(
          entry,
          event,
          toElement(trigger.value)?.ownerDocument.activeElement ?? null,
        ),
    });

    let unregister: (() => void) | null = null;
    onMounted(() => {
      const element = toElement(trigger.value);
      if (bar && element) {
        entry = {
          element,
          isOpen: () => open.value,
          open: (focus) => menu.open(focus),
          close: () => menu.close(false),
        };
        unregister = bar.register(entry);
      }
      if (open.value) menu.attached();
      // After the DOM update: the positioner is on <body> (or gone).
      watch(open, (isOpen) => (isOpen ? menu.attached() : menu.detached()), {
        flush: "post",
      });
    });
    onBeforeUnmount(() => {
      menu.detached();
      unregister?.();
    });

    const close = (): void => menu.close(true);
    expose({
      close: (restoreFocus?: boolean) => menu.close(restoreFocus),
      reposition: () => menu.reposition(),
    });

    return () => {
      const tag = props.as ?? "button";
      const isOpen = open.value;
      return [
        renderAs(
          tag,
          mergeProps(tag === "button" ? { type: "button" } : {}, attrs, {
            ref: trigger,
            class: "menubar-trigger",
            "data-slot": "menubar-trigger",
            role: "menuitem",
            "aria-haspopup": "menu",
            "aria-expanded": isOpen ? "true" : "false",
            "aria-controls": isOpen ? (controls.value ?? undefined) : undefined,
            "data-state": isOpen ? "open" : "closed",
            onClick: menu.triggerClick,
            onKeydown: (event: KeyboardEvent) => {
              if (entry && bar?.triggerKeyDown(entry, event)) return;
              menu.triggerKeyDown(event);
            },
            onFocus: () => entry && bar?.focused(entry),
            onPointerenter: () => entry && bar?.pointerEnter(entry),
          }),
          // The `#menu` slot is ours, not the trigger component's.
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
