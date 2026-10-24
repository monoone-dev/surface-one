import {
  Teleport,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  useId,
  watch,
  withDirectives,
  type PropType,
} from "vue";

import {
  createRowMenu,
  type RowMenuAlign,
  type RowMenuSide,
} from "@surface-one/core";

export type { RowMenuAlign, RowMenuSide } from "@surface-one/core";

import { vSoneTooltip } from "../../directives/tooltip";

/** What a `SoneRowMenu` template ref exposes. */
export interface SoneRowMenuExposed {
  readonly isOpen: boolean;
  /** Closes the menu. */
  close(): void;
}

const ELLIPSIS = () =>
  h(
    "svg",
    {
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    [
      h("circle", { cx: "12", cy: "12", r: "1" }),
      h("circle", { cx: "19", cy: "12", r: "1" }),
      h("circle", { cx: "5", cy: "12", r: "1" }),
    ],
  );

/**
 * `<sone-row-menu>` — the ⋯ menu of a row (a tree row, a table row) or, `prominent`, of a
 * page. The default slot holds the menu items (`SoneMenuItem`, `SoneMenuGroup`, …); the
 * panel floats on <body>, fixed next to the trigger and inside every scrolling ancestor.
 * Enter / Space / ArrowDown open it on the first item, ArrowUp on the last; Arrow keys,
 * Home / End move, and it closes on an activated item, Escape, Tab or a click outside.
 * `#glyph` replaces the ⋯ icon.
 */
export const SoneRowMenu = defineComponent({
  name: "SoneRowMenu",
  props: {
    /** The trigger's accessible name (and its native tooltip without `tooltip`). */
    label: { type: String, required: true },
    disabled: { type: Boolean, default: false },
    /** A page-level trigger: a small ghost button, always visible. */
    prominent: { type: Boolean, default: false },
    side: { type: String as PropType<RowMenuSide>, default: "bottom" },
    /** For `side="right"`: a selector of the ancestor whose right edge the panel opens from. */
    sideEdge: { type: String as PropType<string | null>, default: null },
    align: { type: String as PropType<RowMenuAlign>, default: "end" },
    clipToScrollParents: { type: Boolean, default: true },
    /** A styled tooltip on the trigger (it also names the panel). */
    tooltip: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    openChange: (open: boolean) => typeof open === "boolean",
  },
  setup(props, { slots, emit, expose }) {
    const panelId = `sone-row-menu-${useId()}`;
    const open = ref(false);
    const host = ref<HTMLElement | null>(null);
    const trigger = ref<HTMLElement | null>(null);
    const panel = ref<HTMLElement | null>(null);

    const menu = createRowMenu({
      host: () => host.value,
      trigger: () => trigger.value,
      panel: () => panel.value,
      isOpen: () => open.value,
      setOpen: (value) => {
        open.value = value;
        emit("openChange", value);
      },
      disabled: () => props.disabled,
      side: () => props.side,
      align: () => props.align,
      sideEdge: () => props.sideEdge,
      clipToScrollParents: () => props.clipToScrollParents,
    });

    onMounted(() => {
      // After the DOM update: the panel is on <body> (or gone).
      watch(open, (isOpen) => (isOpen ? menu.attached() : menu.detached()), {
        flush: "post",
      });
    });
    onBeforeUnmount(menu.detached);

    const exposed: SoneRowMenuExposed = {
      get isOpen() {
        return open.value;
      },
      close: menu.close,
    };
    expose(exposed);

    return () => {
      const isOpen = open.value;
      const state = isOpen ? "open" : "closed";
      const button = h(
        "button",
        {
          ref: trigger,
          type: "button",
          class: { "row-menu-trigger": true, "is-open": isOpen },
          "data-slot": "row-menu-trigger",
          "data-state": state,
          disabled: props.disabled,
          "aria-haspopup": "menu",
          "aria-expanded": isOpen ? "true" : "false",
          "aria-controls": panelId,
          "aria-label": props.label,
          // `v-sone-tooltip` takes the place of the native `title`.
          title: props.tooltip ? undefined : props.label,
          onClick: menu.triggerClick,
          onKeydown: menu.triggerKeyDown,
        },
        slots["glyph"]?.() ?? ELLIPSIS(),
      );
      const hostClass = [isOpen && "is-open", props.prominent && "is-prominent"]
        .filter(Boolean)
        .join(" ");
      return h(
        "sone-row-menu",
        {
          ref: host,
          // Left out when empty: the server prints `class=""` for an undefined one.
          ...(hostClass && { class: hostClass }),
          "data-slot": "row-menu",
          "data-state": state,
        },
        [
          props.tooltip
            ? withDirectives(button, [[vSoneTooltip, props.tooltip]])
            : button,
          isOpen
            ? h(
                Teleport,
                { to: "body" },
                h(
                  "div",
                  {
                    ref: panel,
                    id: panelId,
                    class: "menu row-menu-panel",
                    "data-slot": "menu",
                    "data-state": "open",
                    "data-side": props.side,
                    role: "menu",
                    tabindex: "-1",
                    "aria-label": props.tooltip ?? props.label,
                    onClick: menu.panelClick,
                    onKeydown: menu.panelKeyDown,
                  },
                  slots.default?.(),
                ),
              )
            : null,
        ],
      );
    };
  },
});
