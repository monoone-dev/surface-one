import {
  computed,
  defineComponent,
  h,
  inject,
  onBeforeUnmount,
  onMounted,
  provide,
  useId,
  withDirectives,
  type InjectionKey,
  type PropType,
} from "vue";

import { createSidebarRail } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { vSoneTooltip } from "../../directives/tooltip";
import { asProp, definePart, flag, renderAs } from "../../utils/part";
import type { SeparatorOrientation } from "../separator/separator";
import {
  SONE_SIDEBAR,
  provideSoneSidebar,
  type SoneSidebarConfig,
} from "./sidebar-state";

export type SoneSidebarSide = "left" | "right";
export type SoneSidebarVariant = "sidebar" | "floating" | "inset";
export type SoneSidebarCollapsible = "offcanvas" | "icon" | "none";
export type SoneSidebarGroupTone = "default" | "danger";
export type SoneSidebarGroupLabelVariant = "default" | "destructive";
export type SoneSidebarMenuOrientation = "vertical" | "horizontal";
export type SoneSidebarMenuButtonSize = "default" | "sm" | "lg";
export type SoneSidebarMenuButtonVariant =
  "default" | "outline" | "destructive";
export type SoneSidebarMenuSubButtonSize = "sm" | "md";

/** What a menu button reads from the `SoneSidebar` it sits in. */
interface SidebarOwner {
  readonly iconCollapsed: () => boolean;
}

const SIDEBAR_OWNER: InjectionKey<SidebarOwner> = Symbol("SoneSidebarOwner");

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/**
 * `[soneSidebarWrapper]` — the layout around a `SoneSidebar` and its `SoneSidebarInset`
 * (shadcn's SidebarProvider). It holds the sidebar state for its subtree — or uses the
 * one an ancestor provides with `provideSoneSidebar()` — sets `--sidebar-width` and
 * toggles the sidebar on ⌘B / Ctrl+B (`keyboardShortcut`), except inside an editable
 * field or after another handler called `preventDefault()`. The stored open state and
 * width are read on mount, so server and client render the same markup.
 */
export const SoneSidebarWrapper = defineComponent({
  name: "SoneSidebarWrapper",
  props: {
    ...asProp,
    /** A fixed width (`"18rem"`) instead of the dragged one. */
    sidebarWidth: { type: String as PropType<string | null>, default: null },
    sidebarWidthIcon: {
      type: String as PropType<string | null>,
      default: null,
    },
    /** The config of the state this wrapper creates (ignored when an ancestor provides one). */
    config: {
      type: Object as PropType<Partial<SoneSidebarConfig>>,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    const sidebar =
      inject(SONE_SIDEBAR, null) ?? provideSoneSidebar(props.config);

    const onKeydown = (event: KeyboardEvent): void => {
      if (event.defaultPrevented || event.isComposing) return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
        return;
      if (event.key.toLowerCase() !== sidebar.keyboardShortcut) return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      sidebar.toggleSidebar();
    };
    onMounted(() => document.addEventListener("keydown", onKeydown));
    onBeforeUnmount(() => document.removeEventListener("keydown", onKeydown));

    return () => {
      const width = props.sidebarWidth ?? sidebar.widthCss.value;
      const style: Record<string, string> = {};
      if (width !== null) style["--sidebar-width"] = width;
      if (props.sidebarWidthIcon !== null)
        style["--sidebar-width-icon"] = props.sidebarWidthIcon;
      return renderAs(
        props.as ?? "div",
        {
          "data-slot": "sidebar-wrapper",
          "data-state": sidebar.state.value,
          "data-resizing": flag(sidebar.resizing.value),
          // Like Angular, render no style attribute at all when there is nothing to set.
          style: Object.keys(style).length > 0 ? style : undefined,
        },
        slots,
      );
    };
  },
});

/**
 * `<sone-sidebar>` — the sidebar panel. With `collapsible` `"offcanvas"` or `"icon"` it
 * follows the wrapper's state (and slides away or shrinks to its icons); the default
 * `"none"` is a static column, such as the section rail of a settings dialog.
 */
export const SoneSidebar = defineComponent({
  name: "SoneSidebar",
  props: {
    side: { type: String as PropType<SoneSidebarSide>, default: "left" },
    variant: {
      type: String as PropType<SoneSidebarVariant>,
      default: "sidebar",
    },
    collapsible: {
      type: String as PropType<SoneSidebarCollapsible>,
      default: "none",
    },
  },
  setup(props, { slots }) {
    const sidebar = inject(SONE_SIDEBAR, null);
    const follows = computed(() => props.collapsible !== "none" && !!sidebar);
    const collapsed = () => sidebar?.state.value === "collapsed";
    provide(SIDEBAR_OWNER, {
      iconCollapsed: () => props.collapsible === "icon" && collapsed(),
    });
    return () => {
      const layered = follows.value;
      return h(
        "sone-sidebar",
        {
          "data-slot": "sidebar",
          "data-state": layered ? sidebar!.state.value : undefined,
          "data-collapsible": layered
            ? collapsed()
              ? props.collapsible
              : ""
            : undefined,
          "data-variant": layered ? props.variant : undefined,
          "data-side": layered ? props.side : undefined,
        },
        layered
          ? h(
              "div",
              { "data-slot": "sidebar-container", "data-side": props.side },
              h(
                "div",
                { "data-slot": "sidebar-inner", "data-sidebar": "sidebar" },
                slots.default?.(),
              ),
            )
          : slots.default?.(),
      );
    };
  },
});

export const SoneSidebarHeader = definePart({
  name: "SoneSidebarHeader",
  tag: "div",
  slot: "sidebar-header",
  static: { "data-sidebar": "header" },
});

export const SoneSidebarContent = definePart({
  name: "SoneSidebarContent",
  tag: "div",
  slot: "sidebar-content",
  static: { "data-sidebar": "content" },
});

export const SoneSidebarFooter = definePart({
  name: "SoneSidebarFooter",
  tag: "div",
  slot: "sidebar-footer",
  static: { "data-sidebar": "footer" },
});

/** `[soneSidebarSeparator]` — a `SoneSeparator` inside the sidebar. */
export const SoneSidebarSeparator = definePart({
  name: "SoneSidebarSeparator",
  tag: "div",
  className: "separator",
  slot: "sidebar-separator",
  static: { "data-sidebar": "separator" },
  props: {
    orientation: {
      type: String as PropType<SeparatorOrientation>,
      default: "horizontal",
    },
    /** A purely visual rule (`role="none"`); `false` makes it a semantic separator. */
    decorative: { type: Boolean, default: true },
  },
  attrs: (p) => ({
    "data-orientation": p.orientation,
    role: p.decorative ? "none" : "separator",
    "aria-orientation": p.decorative ? undefined : p.orientation,
  }),
});

export const SoneSidebarGroup = definePart({
  name: "SoneSidebarGroup",
  tag: "div",
  slot: "sidebar-group",
  static: { "data-sidebar": "group" },
  props: {
    /** `danger` tints the group's label and rows red (a developer or destructive section). */
    tone: {
      type: String as PropType<SoneSidebarGroupTone>,
      default: "default",
    },
  },
  attrs: (p) => ({
    "data-tone": p.tone === "default" ? undefined : p.tone,
  }),
});

export const SoneSidebarGroupLabel = definePart({
  name: "SoneSidebarGroupLabel",
  tag: "div",
  slot: "sidebar-group-label",
  static: { "data-sidebar": "group-label" },
  props: {
    /** `destructive` sets the label in the danger colour (pair it with `destructive` menu buttons). */
    variant: {
      type: String as PropType<SoneSidebarGroupLabelVariant>,
      default: "default",
    },
  },
  attrs: (p) => ({
    "data-variant": p.variant === "default" ? undefined : p.variant,
  }),
});

export const SoneSidebarGroupAction = definePart({
  name: "SoneSidebarGroupAction",
  tag: "button",
  slot: "sidebar-group-action",
  static: { "data-sidebar": "group-action" },
});

export const SoneSidebarGroupContent = definePart({
  name: "SoneSidebarGroupContent",
  tag: "div",
  slot: "sidebar-group-content",
  static: { "data-sidebar": "group-content" },
});

export const SoneSidebarMenu = definePart({
  name: "SoneSidebarMenu",
  tag: "ul",
  slot: "sidebar-menu",
  static: { "data-sidebar": "menu" },
  props: {
    /** `horizontal` lays the rows out as a wrapping row of content-width buttons (a narrow-screen nav). */
    orientation: {
      type: String as PropType<SoneSidebarMenuOrientation>,
      default: "vertical",
    },
  },
  attrs: (p) => ({
    "data-orientation":
      p.orientation === "horizontal" ? "horizontal" : undefined,
  }),
});

export const SoneSidebarMenuItem = definePart({
  name: "SoneSidebarMenuItem",
  tag: "li",
  slot: "sidebar-menu-item",
  static: { "data-sidebar": "menu-item" },
});

/**
 * `button[soneSidebarMenuButton]` — a row of the sidebar menu (`as="a"` or
 * `:as="NuxtLink"` for a link). `isActive` marks the current page; `tooltip` shows
 * its label beside it only while the sidebar is collapsed to icons.
 */
export const SoneSidebarMenuButton = defineComponent({
  name: "SoneSidebarMenuButton",
  props: {
    ...asProp,
    size: {
      type: String as PropType<SoneSidebarMenuButtonSize>,
      default: "default",
    },
    /** `destructive`: danger text, and the danger tint on hover and when active. */
    variant: {
      type: String as PropType<SoneSidebarMenuButtonVariant>,
      default: "default",
    },
    isActive: { type: Boolean, default: false },
    /** The label shown beside the icon while the sidebar is collapsed to icons. */
    tooltip: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const owner = inject(SIDEBAR_OWNER, null);
    return () => {
      const button = renderAs(
        props.as ?? "button",
        {
          "data-slot": "sidebar-menu-button",
          "data-sidebar": "menu-button",
          "data-size": props.size,
          "data-variant": props.variant,
          "data-active": props.isActive ? "true" : undefined,
        },
        slots,
      );
      if (!props.tooltip) return button;
      return withDirectives(button, [
        [
          vSoneTooltip,
          {
            text: props.tooltip,
            side: "right",
            disabled: !owner?.iconCollapsed(),
          },
        ],
      ]);
    };
  },
});

export const SoneSidebarMenuAction = definePart({
  name: "SoneSidebarMenuAction",
  tag: "button",
  slot: "sidebar-menu-action",
  static: { "data-sidebar": "menu-action" },
  props: { showOnHover: { type: Boolean, default: false } },
  attrs: (p) => ({ "data-show-on-hover": flag(p.showOnHover) }),
});

export const SoneSidebarMenuBadge = definePart({
  name: "SoneSidebarMenuBadge",
  tag: "div",
  slot: "sidebar-menu-badge",
  static: { "data-sidebar": "menu-badge" },
});

/**
 * `[soneSidebarMenuSkeleton]` — a placeholder row while the menu loads. Its bar width
 * (50–89%) comes from `useId`, not `Math.random`, so server and client agree.
 */
export const SoneSidebarMenuSkeleton = defineComponent({
  name: "SoneSidebarMenuSkeleton",
  props: {
    ...asProp,
    showIcon: { type: Boolean, default: false },
  },
  setup(props, { slots }) {
    const id = useId();
    // FNV-1a with a final avalanche: neighbouring ids ("…-1", "…-2") must not land on neighbouring
    // widths. Deterministic so the server and the client agree (Angular uses Math.random).
    let hash = 0x811c9dc5;
    for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 0x01000193);
    hash ^= hash >>> 15;
    hash = Math.imul(hash, 0x2c1b3c6d);
    hash ^= hash >>> 12;
    const width = `${((hash >>> 0) % 40) + 50}%`;
    return () =>
      renderAs(
        props.as ?? "div",
        {
          "data-slot": "sidebar-menu-skeleton",
          "data-sidebar": "menu-skeleton",
          "aria-hidden": "true",
          "data-show-icon": flag(props.showIcon),
          style: { "--skeleton-width": width },
        },
        slots,
      );
  },
});

export const SoneSidebarMenuSub = definePart({
  name: "SoneSidebarMenuSub",
  tag: "ul",
  slot: "sidebar-menu-sub",
  static: { "data-sidebar": "menu-sub" },
});

export const SoneSidebarMenuSubItem = definePart({
  name: "SoneSidebarMenuSubItem",
  tag: "li",
  slot: "sidebar-menu-sub-item",
  static: { "data-sidebar": "menu-sub-item" },
});

export const SoneSidebarMenuSubButton = definePart({
  name: "SoneSidebarMenuSubButton",
  tag: "a",
  slot: "sidebar-menu-sub-button",
  static: { "data-sidebar": "menu-sub-button" },
  props: {
    size: {
      type: String as PropType<SoneSidebarMenuSubButtonSize>,
      default: "md",
    },
    isActive: { type: Boolean, default: false },
  },
  attrs: (p) => ({
    "data-size": p.size,
    "data-active": p.isActive ? "true" : undefined,
  }),
});

/** `button[soneSidebarTrigger]` — opens and collapses the sidebar (`aria-expanded`). */
export const SoneSidebarTrigger = defineComponent({
  name: "SoneSidebarTrigger",
  props: asProp,
  setup(props, { slots }) {
    const sidebar = inject(SONE_SIDEBAR, null);
    return () =>
      renderAs(
        props.as ?? "button",
        {
          "data-sidebar": "trigger",
          "aria-expanded": sidebar ? String(sidebar.open.value) : undefined,
          onClick: () => sidebar?.toggleSidebar(),
        },
        slots,
      );
  },
});

/**
 * `[soneSidebarRail]` — the strip on the sidebar's edge. Collapsed, it is a button
 * that expands the sidebar. Expanded, it is a focusable splitter: a click collapses,
 * a drag resizes (the click that ends a drag is swallowed), ⌥-click resets the width;
 * the arrow keys step the width (Shift for bigger steps), Home / End jump to the
 * minimum / maximum and Enter resets it.
 */
export const SoneSidebarRail = defineComponent({
  name: "SoneSidebarRail",
  props: {
    ...asProp,
    /** Default: the "Resize sidebar" message. */
    resizeLabel: { type: String as PropType<string | null>, default: null },
    /** Default: the "Toggle sidebar" message. */
    toggleLabel: { type: String as PropType<string | null>, default: null },
    expandedHint: { type: String as PropType<string | null>, default: null },
    collapsedHint: { type: String as PropType<string | null>, default: null },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    const sidebar = inject(SONE_SIDEBAR, null);
    const expanded = () => sidebar?.open.value ?? false;

    const rail = createSidebarRail(() =>
      sidebar
        ? {
            open: sidebar.open.value,
            width: sidebar.width.value,
            minWidth: sidebar.minWidth,
            maxWidth: sidebar.maxWidth,
            setResizing: sidebar.setResizing,
            setWidth: sidebar.setWidth,
            resetWidth: sidebar.resetWidth,
            toggleSidebar: sidebar.toggleSidebar,
          }
        : null,
    );

    return () => {
      const open = expanded();
      const m = messages.value;
      return renderAs(
        props.as ?? "div",
        {
          "data-slot": "sidebar-rail",
          "data-sidebar": "rail",
          role: open ? "separator" : "button",
          tabindex: open ? 0 : -1,
          "aria-orientation": open ? "vertical" : undefined,
          "aria-valuenow": open ? sidebar?.width.value : undefined,
          "aria-valuemin": open ? sidebar?.minWidth : undefined,
          "aria-valuemax": open ? sidebar?.maxWidth : undefined,
          "aria-label": open
            ? (props.resizeLabel ?? m.sidebarResize)
            : (props.toggleLabel ?? m.sidebarToggle),
          title: open
            ? (props.expandedHint ?? m.sidebarExpandedHint)
            : (props.collapsedHint ?? m.sidebarCollapsedHint),
          onPointerdown: rail.pointerDown,
          onPointermove: rail.pointerMove,
          onPointerup: rail.pointerEnd,
          onPointercancel: rail.pointerEnd,
          onLostpointercapture: rail.pointerEnd,
          onClick: rail.click,
          onKeydown: rail.keyDown,
        },
        slots,
      );
    };
  },
});

export const SoneSidebarInset = definePart({
  name: "SoneSidebarInset",
  tag: "div",
  slot: "sidebar-inset",
});
