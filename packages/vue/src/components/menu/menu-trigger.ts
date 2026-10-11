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
  createMenuTrigger,
  type FloatingAlign,
  type FloatingSide,
} from "@surface-one/core";

import { useModel } from "../../utils/model";
import { asProp, renderAs, toElement } from "../../utils/part";

/**
 * `<SoneMenuTrigger>` — a menu button, the Vue twin of `[soneMenuTrigger]` (spartan/ui
 * `brnMenuTrigger`, WAI-ARIA menu button pattern). It renders the trigger (a
 * `<button>` unless `as` says otherwise) and, while open, the `#menu` slot in an
 * `.overlay-positioner` on `<body>`, placed next to the trigger (flipped when that side
 * lacks room) and re-placed on scroll and resize. Enter / Space / ArrowDown open it on
 * the first item, ArrowUp on the last; Arrow keys, Home / End and typeahead move over
 * the items, Enter / Space activate, and it closes on activation, Escape, Tab or a
 * click outside. The slot gets `close` (focus goes back to the trigger).
 */
export const SoneMenuTrigger = defineComponent({
  name: "SoneMenuTrigger",
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
    const trigger = ref<unknown>(null);
    const positioner = ref<HTMLElement | null>(null);
    const controls = ref<string | null>(null);

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
      keepOpenOnOutsideClick: () => props.keepOpenOnOutsideClick,
      controls: (id) => (controls.value = id),
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
      /** Closes the menu; with `restoreFocus`, focus goes back to the trigger. */
      close: (restoreFocus?: boolean) => menu.close(restoreFocus),
      /** Re-measures and re-places the open menu (after its content changed size). */
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
            "aria-haspopup": "menu",
            "aria-expanded": isOpen ? "true" : "false",
            "aria-controls": isOpen ? (controls.value ?? undefined) : undefined,
            "data-state": isOpen ? "open" : "closed",
            onClick: menu.triggerClick,
            onKeydown: menu.triggerKeyDown,
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
