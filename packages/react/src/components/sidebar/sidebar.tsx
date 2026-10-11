"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { useSoneTooltip } from "../../tooltip/tooltip";
import { definePart, flag, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";
import {
  SONE_SIDEBAR,
  SoneSidebarProvider,
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

/** Whether the `SoneSidebar` a menu button sits in is collapsed to its icons. */
const IconCollapsedContext = createContext(false);

function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

/** Calls the caller's handler, then the component's own (Vue merges listeners the same way). */
function chain<E>(
  theirs: ((event: E) => void) | undefined,
  ours: (event: E) => void,
): (event: E) => void {
  return (event) => {
    theirs?.(event);
    ours(event);
  };
}

export interface SoneSidebarWrapperOwnProps {
  /** A fixed width (`"18rem"`) instead of the dragged one. */
  readonly sidebarWidth?: string | null;
  readonly sidebarWidthIcon?: string | null;
  /** The config of the state this wrapper creates (ignored when an ancestor provides one; read once). */
  readonly config?: Partial<SoneSidebarConfig>;
}

/**
 * `[soneSidebarWrapper]` — the layout around a `SoneSidebar` and its `SoneSidebarInset`
 * (shadcn's SidebarProvider). It holds the sidebar state for its subtree — or uses the
 * one an ancestor provides with `SoneSidebarProvider` — sets `--sidebar-width` and
 * toggles the sidebar on ⌘B / Ctrl+B (`keyboardShortcut`), except inside an editable
 * field or after another handler called `preventDefault()`. The stored open state and
 * width are read on mount, so server and client render the same markup.
 */
export function SoneSidebarWrapper<E extends ElementType = "div">(
  props: PolymorphicProps<E, SoneSidebarWrapperOwnProps>,
) {
  const outer = useContext(SONE_SIDEBAR);
  if (outer) return createElement(WrapperView, props);
  return (
    <SoneSidebarProvider config={props.config}>
      {createElement(WrapperView, props)}
    </SoneSidebarProvider>
  );
}

function WrapperView({
  as,
  sidebarWidth = null,
  sidebarWidthIcon = null,
  config: _config,
  style,
  ...rest
}: PolymorphicProps<ElementType, SoneSidebarWrapperOwnProps> & {
  style?: CSSProperties;
}) {
  const sidebar = useContext(SONE_SIDEBAR)!;
  const live = useRef(sidebar);
  live.current = sidebar;

  useEffect(() => {
    const onKeydown = (event: globalThis.KeyboardEvent): void => {
      const s = live.current;
      if (event.defaultPrevented || event.isComposing) return;
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
        return;
      if (event.key.toLowerCase() !== s.keyboardShortcut) return;
      if (isEditable(event.target)) return;
      event.preventDefault();
      s.toggleSidebar();
    };
    document.addEventListener("keydown", onKeydown);
    return () => document.removeEventListener("keydown", onKeydown);
  }, []);

  const width = sidebarWidth ?? sidebar.widthCss;
  const vars: Record<string, string> = {};
  if (width !== null) vars["--sidebar-width"] = width;
  if (sidebarWidthIcon !== null)
    vars["--sidebar-width-icon"] = sidebarWidthIcon;
  const merged =
    style || Object.keys(vars).length > 0
      ? ({ ...style, ...vars } as CSSProperties)
      : undefined;
  return createElement(as ?? "div", {
    "data-slot": "sidebar-wrapper",
    "data-state": sidebar.state,
    "data-resizing": flag(sidebar.resizing),
    ...rest,
    // Like Angular, render no style attribute at all when there is nothing to set.
    style: merged,
  });
}

export interface SoneSidebarProps extends HTMLAttributes<HTMLElement> {
  readonly side?: SoneSidebarSide;
  readonly variant?: SoneSidebarVariant;
  readonly collapsible?: SoneSidebarCollapsible;
  readonly children?: ReactNode;
}

/**
 * `<sone-sidebar>` — the sidebar panel. With `collapsible` `"offcanvas"` or `"icon"` it
 * follows the wrapper's state (and slides away or shrinks to its icons); the default
 * `"none"` is a static column, such as the section rail of a settings dialog.
 */
export function SoneSidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "none",
  children,
  ...rest
}: SoneSidebarProps) {
  const sidebar = useContext(SONE_SIDEBAR);
  const layered = collapsible !== "none" && !!sidebar;
  const collapsed = sidebar?.state === "collapsed";
  return (
    <IconCollapsedContext.Provider value={collapsible === "icon" && collapsed}>
      {createElement(
        "sone-sidebar",
        {
          "data-slot": "sidebar",
          "data-state": layered ? sidebar.state : undefined,
          "data-collapsible": layered
            ? collapsed
              ? collapsible
              : ""
            : undefined,
          "data-variant": layered ? variant : undefined,
          "data-side": layered ? side : undefined,
          ...rest,
        },
        layered ? (
          <div data-slot="sidebar-container" data-side={side}>
            <div data-slot="sidebar-inner" data-sidebar="sidebar">
              {children}
            </div>
          </div>
        ) : (
          children
        ),
      )}
    </IconCollapsedContext.Provider>
  );
}

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
export const SoneSidebarSeparator = definePart<
  "div",
  {
    orientation?: "horizontal" | "vertical";
    /** A purely visual rule (`role="none"`, the default); `false` makes it a semantic separator. */
    decorative?: boolean;
  }
>({
  name: "SoneSidebarSeparator",
  tag: "div",
  className: "separator",
  slot: "sidebar-separator",
  static: { "data-sidebar": "separator" },
  props: ["orientation", "decorative"],
  attrs: (p) => {
    const orientation = p.orientation ?? "horizontal";
    const decorative = p.decorative ?? true;
    return {
      "data-orientation": orientation,
      role: decorative ? "none" : "separator",
      "aria-orientation": decorative ? undefined : orientation,
    };
  },
});

export const SoneSidebarGroup = definePart<
  "div",
  {
    /** `danger` tints the group's label and rows red (a developer or destructive section). */
    tone?: SoneSidebarGroupTone;
  }
>({
  name: "SoneSidebarGroup",
  tag: "div",
  slot: "sidebar-group",
  static: { "data-sidebar": "group" },
  props: ["tone"],
  attrs: (p) => ({
    "data-tone": !p.tone || p.tone === "default" ? undefined : p.tone,
  }),
});

export const SoneSidebarGroupLabel = definePart<
  "div",
  {
    /** `destructive` sets the label in the danger colour (pair it with `destructive` menu buttons). */
    variant?: SoneSidebarGroupLabelVariant;
  }
>({
  name: "SoneSidebarGroupLabel",
  tag: "div",
  slot: "sidebar-group-label",
  static: { "data-sidebar": "group-label" },
  props: ["variant"],
  attrs: (p) => ({
    "data-variant":
      !p.variant || p.variant === "default" ? undefined : p.variant,
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

export const SoneSidebarMenu = definePart<
  "ul",
  {
    /** `horizontal` lays the rows out as a wrapping row of content-width buttons (a narrow-screen nav). */
    orientation?: SoneSidebarMenuOrientation;
  }
>({
  name: "SoneSidebarMenu",
  tag: "ul",
  slot: "sidebar-menu",
  static: { "data-sidebar": "menu" },
  props: ["orientation"],
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

export interface SoneSidebarMenuButtonOwnProps {
  readonly size?: SoneSidebarMenuButtonSize;
  /** `destructive`: danger text, and the danger tint on hover and when active. */
  readonly variant?: SoneSidebarMenuButtonVariant;
  readonly isActive?: boolean;
  /** The label shown beside the icon while the sidebar is collapsed to icons. */
  readonly tooltip?: string | null;
}

/**
 * `button[soneSidebarMenuButton]` — a row of the sidebar menu (`as="a"` or
 * `as={Link}` for a link). `isActive` marks the current page; `tooltip` shows
 * its label beside it only while the sidebar is collapsed to icons.
 */
export function SoneSidebarMenuButton<E extends ElementType = "button">({
  as,
  size = "default",
  variant = "default",
  isActive = false,
  tooltip = null,
  ref,
  ...rest
}: PolymorphicProps<E, SoneSidebarMenuButtonOwnProps>) {
  const iconCollapsed = useContext(IconCollapsedContext);
  const tooltipRef = useSoneTooltip({
    text: tooltip ?? "",
    side: "right",
    disabled: !iconCollapsed,
  });
  const merged = useMemo(
    () => mergeRefs(tooltipRef, ref as never),
    [tooltipRef, ref],
  );
  return createElement(as ?? "button", {
    "data-slot": "sidebar-menu-button",
    "data-sidebar": "menu-button",
    "data-size": size,
    "data-variant": variant,
    "data-active": isActive ? "true" : undefined,
    ...rest,
    ref: tooltip ? merged : ref,
  });
}

export const SoneSidebarMenuAction = definePart<
  "button",
  { showOnHover?: boolean }
>({
  name: "SoneSidebarMenuAction",
  tag: "button",
  slot: "sidebar-menu-action",
  static: { "data-sidebar": "menu-action" },
  props: ["showOnHover"],
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
export function SoneSidebarMenuSkeleton<E extends ElementType = "div">({
  as,
  showIcon = false,
  style,
  ...rest
}: PolymorphicProps<E, { showIcon?: boolean }>) {
  const id = useId();
  // FNV-1a with a final avalanche: neighbouring ids must not land on neighbouring
  // widths. Deterministic so the server and the client agree (Angular uses Math.random).
  let hash = 0x811c9dc5;
  for (const c of id) hash = Math.imul(hash ^ c.charCodeAt(0), 0x01000193);
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x2c1b3c6d);
  hash ^= hash >>> 12;
  const width = `${((hash >>> 0) % 40) + 50}%`;
  return createElement(as ?? "div", {
    "data-slot": "sidebar-menu-skeleton",
    "data-sidebar": "menu-skeleton",
    "aria-hidden": "true",
    "data-show-icon": flag(showIcon),
    ...rest,
    style: { ...(style as CSSProperties), "--skeleton-width": width },
  });
}

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

export const SoneSidebarMenuSubButton = definePart<
  "a",
  { size?: SoneSidebarMenuSubButtonSize; isActive?: boolean }
>({
  name: "SoneSidebarMenuSubButton",
  tag: "a",
  slot: "sidebar-menu-sub-button",
  static: { "data-sidebar": "menu-sub-button" },
  props: ["size", "isActive"],
  attrs: (p) => ({
    "data-size": p.size ?? "md",
    "data-active": p.isActive ? "true" : undefined,
  }),
});

/** `button[soneSidebarTrigger]` — opens and collapses the sidebar (`aria-expanded`). */
export function SoneSidebarTrigger<E extends ElementType = "button">({
  as,
  onClick,
  ...rest
}: PolymorphicProps<E>) {
  const sidebar = useContext(SONE_SIDEBAR);
  return createElement(as ?? "button", {
    "data-sidebar": "trigger",
    "aria-expanded": sidebar ? String(sidebar.open) : undefined,
    ...rest,
    onClick: (event: MouseEvent<HTMLElement>) => {
      (onClick as ((e: MouseEvent<HTMLElement>) => void) | undefined)?.(event);
      sidebar?.toggleSidebar();
    },
  });
}

const RAIL_KEY_STEP_PX = 16;
const RAIL_KEY_STEP_SHIFT_MULTIPLIER = 4;
const RAIL_DRAG_THRESHOLD_PX = 3;

export interface SoneSidebarRailOwnProps {
  /** Default: the "Resize sidebar" message. */
  readonly resizeLabel?: string | null;
  /** Default: the "Toggle sidebar" message. */
  readonly toggleLabel?: string | null;
  readonly expandedHint?: string | null;
  readonly collapsedHint?: string | null;
}

type Handler<E> = ((event: E) => void) | undefined;

/**
 * `[soneSidebarRail]` — the strip on the sidebar's edge. Collapsed, it is a button
 * that expands the sidebar. Expanded, it is a focusable splitter: a click collapses,
 * a drag resizes (the click that ends a drag is swallowed), ⌥-click resets the width;
 * the arrow keys step the width (Shift for bigger steps), Home / End jump to the
 * minimum / maximum and Enter resets it.
 */
export function SoneSidebarRail<E extends ElementType = "div">({
  as,
  resizeLabel = null,
  toggleLabel = null,
  expandedHint = null,
  collapsedHint = null,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onLostPointerCapture,
  onClick,
  onKeyDown,
  ...rest
}: PolymorphicProps<E, SoneSidebarRailOwnProps>) {
  const m = useSoneMessages();
  const sidebar = useContext(SONE_SIDEBAR);
  const open = sidebar?.open ?? false;

  const press = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
    dragging: boolean;
  } | null>(null);
  const swallowClick = useRef(false);

  const onPointerdown = (event: PointerEvent<HTMLElement>): void => {
    swallowClick.current = false;
    if (!sidebar || !open || event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture?.(event.pointerId);
    press.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: sidebar.width,
      dragging: false,
    };
  };
  const onPointermove = (event: PointerEvent<HTMLElement>): void => {
    const current = press.current;
    if (!sidebar || !current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.startX;
    if (!current.dragging) {
      if (Math.abs(dx) < RAIL_DRAG_THRESHOLD_PX) return;
      current.dragging = true;
      sidebar.setResizing(true);
    }
    sidebar.setWidth(current.startWidth + dx);
  };
  const onPointerend = (event: PointerEvent<HTMLElement>): void => {
    const current = press.current;
    if (!current || current.pointerId !== event.pointerId) return;
    press.current = null;
    if (current.dragging) {
      swallowClick.current = true;
      sidebar?.setResizing(false);
    }
  };
  const onRailClick = (event: MouseEvent<HTMLElement>): void => {
    if (swallowClick.current) {
      swallowClick.current = false;
      return;
    }
    if (!sidebar) return;
    if (event.altKey && open) {
      sidebar.resetWidth();
      return;
    }
    sidebar.toggleSidebar();
  };
  const onKeydown = (event: KeyboardEvent<HTMLElement>): void => {
    if (!sidebar || !open) return;
    const step =
      RAIL_KEY_STEP_PX * (event.shiftKey ? RAIL_KEY_STEP_SHIFT_MULTIPLIER : 1);
    const width = sidebar.width;
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = width - step;
        break;
      case "ArrowRight":
        next = width + step;
        break;
      case "Home":
        next = sidebar.minWidth;
        break;
      case "End":
        next = sidebar.maxWidth;
        break;
      case "Enter":
        event.preventDefault();
        sidebar.resetWidth();
        return;
      default:
        return;
    }
    event.preventDefault();
    sidebar.setWidth(next);
  };

  return createElement(as ?? "div", {
    "data-slot": "sidebar-rail",
    "data-sidebar": "rail",
    role: open ? "separator" : "button",
    tabIndex: open ? 0 : -1,
    "aria-orientation": open ? "vertical" : undefined,
    "aria-valuenow": open ? sidebar?.width : undefined,
    "aria-valuemin": open ? sidebar?.minWidth : undefined,
    "aria-valuemax": open ? sidebar?.maxWidth : undefined,
    "aria-label": open
      ? (resizeLabel ?? m.sidebarResize)
      : (toggleLabel ?? m.sidebarToggle),
    title: open
      ? (expandedHint ?? m.sidebarExpandedHint)
      : (collapsedHint ?? m.sidebarCollapsedHint),
    ...rest,
    onPointerDown: chain(
      onPointerDown as Handler<PointerEvent<HTMLElement>>,
      onPointerdown,
    ),
    onPointerMove: chain(
      onPointerMove as Handler<PointerEvent<HTMLElement>>,
      onPointermove,
    ),
    onPointerUp: chain(
      onPointerUp as Handler<PointerEvent<HTMLElement>>,
      onPointerend,
    ),
    onPointerCancel: chain(
      onPointerCancel as Handler<PointerEvent<HTMLElement>>,
      onPointerend,
    ),
    onLostPointerCapture: chain(
      onLostPointerCapture as Handler<PointerEvent<HTMLElement>>,
      onPointerend,
    ),
    onClick: chain(onClick as Handler<MouseEvent<HTMLElement>>, onRailClick),
    onKeyDown: chain(
      onKeyDown as Handler<KeyboardEvent<HTMLElement>>,
      onKeydown,
    ),
  });
}

export const SoneSidebarInset = definePart({
  name: "SoneSidebarInset",
  tag: "div",
  slot: "sidebar-inset",
});
