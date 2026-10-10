import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  provide,
  ref,
  shallowRef,
  withDirectives,
  type InjectionKey,
  type PropType,
  type Ref,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import {
  vSoneTooltip,
  type TooltipAlign,
  type TooltipSide,
} from "../../directives/tooltip";
import { definePart, flag } from "../../utils/part";

export type DockPosition = "top" | "bottom" | "left" | "right";
export type DockAlign = "start" | "center" | "end";
export type DockSize = "sm" | "default";

/** Tooltips open towards the canvas, away from the edge the dock sits on. */
const TOOLTIP_SIDE: Record<DockPosition, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** One registered tool, as the dock sees it. */
interface DockItemRef {
  readonly el: Ref<HTMLButtonElement | null>;
  readonly disabled: () => boolean;
  readonly active: () => boolean | undefined;
}

/** What a dock item reads from the dock it sits in (the Angular `SONE_DOCK`). */
interface SoneDockContext {
  readonly orientation: () => "horizontal" | "vertical";
  readonly tooltipSide: () => TooltipSide;
  /** The item that holds the dock's single Tab stop. */
  readonly tabStop: () => DockItemRef | null;
  register(item: DockItemRef): void;
  unregister(item: DockItemRef): void;
  focused(item: DockItemRef): void;
}

const SONE_DOCK: InjectionKey<SoneDockContext> = Symbol("SoneDock");

/** The registered items in document order (registration order until they are mounted). */
function inDocumentOrder(items: readonly DockItemRef[]): DockItemRef[] {
  return [...items].sort((a, b) => {
    const x = a.el.value;
    const y = b.el.value;
    if (!x || !y) return 0;
    // 4: Node.DOCUMENT_POSITION_FOLLOWING (no `Node` global on the server).
    return x.compareDocumentPosition(y) & 4 ? -1 : 1;
  });
}

/**
 * `<sone-dock>` — a toolbar of drawing tools docked to one edge of a canvas.
 * `position` picks the edge (and with it the direction: a row on top or bottom, a
 * column on the sides); `floating` (the default) pins it inside the nearest
 * positioned ancestor. A WAI-ARIA toolbar: one Tab stop, arrow keys along its
 * direction, Home / End.
 */
export const SoneDock = defineComponent({
  name: "SoneDock",
  props: {
    /** The edge it docks to. */
    position: { type: String as PropType<DockPosition>, default: "bottom" },
    /** Where along that edge: centred, or at its start or end. */
    align: { type: String as PropType<DockAlign>, default: "center" },
    size: { type: String as PropType<DockSize>, default: "default" },
    /** Pin to the edge of the nearest positioned ancestor (`position: relative`). */
    floating: { type: Boolean, default: true },
    ariaLabel: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    const items = shallowRef<readonly DockItemRef[]>([]);
    const current = shallowRef<DockItemRef | null>(null);

    const orientation = computed(() =>
      props.position === "left" || props.position === "right"
        ? "vertical"
        : "horizontal",
    );

    const enabled = (): DockItemRef[] =>
      inDocumentOrder(items.value).filter((i) => !i.disabled());

    /** The last focused tool, else the active one, else the first. */
    const tabStop = computed<DockItemRef | null>(() => {
      const list = enabled();
      const at = current.value;
      if (at && list.includes(at)) return at;
      return list.find((i) => i.active()) ?? list[0] ?? null;
    });

    provide(SONE_DOCK, {
      orientation: () => orientation.value,
      tooltipSide: () => TOOLTIP_SIDE[props.position],
      tabStop: () => tabStop.value,
      register: (item) => (items.value = [...items.value, item]),
      unregister: (item) =>
        (items.value = items.value.filter((i) => i !== item)),
      focused: (item) => (current.value = item),
    });

    const onKeydown = (e: KeyboardEvent): void => {
      const vertical = orientation.value === "vertical";
      const rtl =
        !vertical &&
        (e.currentTarget as HTMLElement)
          .closest("[dir]")
          ?.getAttribute("dir") === "rtl";
      const prev = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
      const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
      const list = enabled();
      if (!list.length) return;
      const at = list.findIndex((i) => i.el.value === e.target);
      let to: number;
      if (e.key === prev) to = at <= 0 ? list.length - 1 : at - 1;
      else if (e.key === next) to = at === list.length - 1 ? 0 : at + 1;
      else if (e.key === "Home") to = 0;
      else if (e.key === "End") to = list.length - 1;
      else return;
      e.preventDefault();
      const item = list[to]!;
      current.value = item;
      item.el.value?.focus();
    };

    return () =>
      h(
        "sone-dock",
        {
          "data-slot": "dock",
          role: "toolbar",
          "aria-label": props.ariaLabel ?? messages.value.dockLabel,
          "aria-orientation": orientation.value,
          "data-position": props.position,
          "data-align": props.align,
          "data-orientation": orientation.value,
          "data-size": props.size,
          "data-floating": flag(props.floating),
          onKeydown,
        },
        slots.default?.(),
      );
  },
});

/**
 * `button[soneDockItem]` — one tool of a dock: an icon button named by `label`,
 * which is also its tooltip (with the `shortcut`, if any). `active` makes it a
 * toggle (`aria-pressed`): the current drawing tool. Leave it unset for a plain
 * action (zoom, undo).
 */
export const SoneDockItem = defineComponent({
  name: "SoneDockItem",
  props: {
    /** The accessible name and the tooltip. */
    label: { type: String, required: true },
    /** A key that picks the tool (`V`, `Shift+R`) — shown in the tooltip, announced as `aria-keyshortcuts`. */
    shortcut: { type: String as PropType<string | null>, default: null },
    /** `true` / `false`: a toggle; unset: a plain button. */
    active: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    disabled: { type: Boolean, default: false },
    tooltipDisabled: { type: Boolean, default: false },
    tooltipAlign: {
      type: String as PropType<TooltipAlign>,
      default: "center",
    },
  },
  setup(props, { slots }) {
    const dock = inject(SONE_DOCK, null);
    const el = ref<HTMLButtonElement | null>(null);
    const item: DockItemRef = {
      el,
      disabled: () => props.disabled,
      active: () => props.active,
    };
    dock?.register(item);
    onBeforeUnmount(() => dock?.unregister(item));

    const tooltip = computed(() =>
      props.shortcut ? `${props.label} (${props.shortcut})` : props.label,
    );

    return () =>
      withDirectives(
        h(
          "button",
          {
            ref: el,
            class: "dock-item",
            "data-slot": "dock-item",
            type: "button",
            "aria-label": props.label,
            "aria-pressed":
              props.active === undefined ? undefined : String(!!props.active),
            "aria-keyshortcuts": props.shortcut ?? undefined,
            "data-tooltip": tooltip.value,
            "data-active": flag(!!props.active),
            tabindex: dock ? (dock.tabStop() === item ? 0 : -1) : undefined,
            disabled: props.disabled,
            onFocus: () => dock?.focused(item),
          },
          slots.default?.(),
        ),
        [
          [
            vSoneTooltip,
            {
              text: tooltip.value,
              side: dock?.tooltipSide() ?? "bottom",
              align: props.tooltipAlign,
              disabled: props.tooltipDisabled,
            },
          ],
        ],
      );
  },
});

/** `[soneDockGroup]` — a labelled run of related tools (`role="group"`). */
export const SoneDockGroup = definePart({
  name: "SoneDockGroup",
  tag: "div",
  className: "dock-group",
  slot: "dock-group",
  static: { role: "group" },
  props: {
    label: { type: String as PropType<string | null>, default: null },
  },
  attrs: (p) => ({ "aria-label": p.label ?? undefined }),
});

/** `[soneDockSeparator]` — a rule between groups of tools, across the dock's direction. */
export const SoneDockSeparator = defineComponent({
  name: "SoneDockSeparator",
  setup() {
    const dock = inject(SONE_DOCK, null);
    return () =>
      h("div", {
        class: "dock-separator",
        "data-slot": "dock-separator",
        role: "separator",
        "aria-orientation":
          dock?.orientation() === "vertical" ? "horizontal" : "vertical",
      });
  },
});
