"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

import {
  createMenubar,
  createMenuTrigger,
  type FloatingAlign,
  type FloatingSide,
  type Menubar,
  type MenubarMenu,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { cx, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

const MENUBAR = createContext<Menubar | null>(null);

/**
 * `<SoneMenubar>` — the React twin of `[soneMenubar]` (spartan/ui Menubar, WAI-ARIA
 * menubar pattern): `role="menubar"`, one Tab stop (roving tabindex) over its
 * `SoneMenubarTrigger`s, ArrowLeft / ArrowRight, Home and End between them. Name it
 * with `aria-label`.
 */
export function SoneMenubar<E extends ElementType = "div">({
  as,
  className,
  ...rest
}: PolymorphicProps<E>): ReactElement {
  const [bar] = useState(createMenubar);
  return (
    <MENUBAR.Provider value={bar}>
      {createElement(as ?? "div", {
        "data-slot": "menubar",
        role: "menubar",
        ...rest,
        className: cx("menubar", className as string | undefined),
      })}
    </MENUBAR.Provider>
  );
}

export interface SoneMenubarTriggerOwnProps {
  /** Shown or not, controlled with `onOpenChange` (the Vue `v-model:open`). */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** The side of the trigger the menu opens on; it flips when that side lacks room. */
  readonly side?: FloatingSide;
  /** Alignment along the trigger's edge. */
  readonly align?: FloatingAlign;
  /** Gap between the trigger and the menu, in px. */
  readonly offset?: number;
  /** The menu (a `SoneMenu`), or a function of `close` (focus goes back to the trigger). */
  readonly menu?: ReactNode | ((close: () => void) => ReactNode);
}

type Handler<E> = ((event: E) => void) | undefined;

/**
 * `<SoneMenubarTrigger menu={…}>` — a top-level item of a `SoneMenubar`
 * (`role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`) that opens its `menu`
 * like a `SoneMenuTrigger`; inside it ArrowLeft / ArrowRight close it and open the
 * neighbouring menu, and once a menu is open, hovering another trigger switches to it.
 */
export function SoneMenubarTrigger<E extends ElementType = "button">({
  as,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  offset = 4,
  menu,
  className,
  onClick,
  onKeyDown,
  onFocus,
  onPointerEnter,
  ref,
  ...rest
}: PolymorphicProps<E, SoneMenubarTriggerOwnProps>): ReactElement {
  const bar = useContext(MENUBAR);
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [controls, setControls] = useState<string | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const positioner = useRef<HTMLDivElement | null>(null);
  const entry = useRef<MenubarMenu | null>(null);

  // The latest props for the controller, which is created once.
  const live = useRef({ open, setOpen, side, align, offset });
  useInsertionEffect(() => {
    live.current = { open, setOpen, side, align, offset };
  });

  const [controller] = useState(() =>
    createMenuTrigger({
      trigger: () => trigger.current,
      positioner: () => positioner.current,
      isOpen: () => live.current.open,
      setOpen: (value) => {
        live.current.open = value;
        live.current.setOpen(value);
      },
      side: () => live.current.side,
      align: () => live.current.align,
      offset: () => live.current.offset,
      keepOpenOnOutsideClick: () => false,
      controls: setControls,
      panelKeyDown: (event) =>
        !!entry.current &&
        !!bar?.panelKeyDown(
          entry.current,
          event,
          trigger.current?.ownerDocument.activeElement ?? null,
        ),
    }),
  );

  useEffect(() => {
    const element = trigger.current;
    if (!bar || !element) return;
    const menuEntry: MenubarMenu = {
      element,
      isOpen: () => live.current.open,
      open: (focus) => controller.open(focus),
      close: () => controller.close(false),
    };
    entry.current = menuEntry;
    const unregister = bar.register(menuEntry);
    return () => {
      entry.current = null;
      unregister();
    };
  }, [bar, controller]);

  // After the DOM update: the positioner is on <body> (or gone).
  useLayoutEffect(() => {
    if (!open) return;
    controller.attached();
    return controller.detached;
  }, [open, controller]);

  const triggerRef = useMemo(() => mergeRefs(trigger, ref as never), [ref]);
  const tag: ElementType = as ?? "button";
  const close = () => controller.close(true);
  const content = typeof menu === "function" ? menu(close) : menu;

  return (
    <>
      {createElement(tag, {
        ...(tag === "button" && { type: "button" }),
        ...rest,
        ref: triggerRef,
        className: cx("menubar-trigger", className as string | undefined),
        "data-slot": "menubar-trigger",
        role: "menuitem",
        "aria-haspopup": "menu",
        "aria-expanded": open ? "true" : "false",
        "aria-controls": open ? (controls ?? undefined) : undefined,
        "data-state": open ? "open" : "closed",
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          (onClick as Handler<ReactMouseEvent<HTMLElement>>)?.(event);
          controller.triggerClick(event);
        },
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
          (onKeyDown as Handler<ReactKeyboardEvent<HTMLElement>>)?.(event);
          if (entry.current && bar?.triggerKeyDown(entry.current, event))
            return;
          controller.triggerKeyDown(event);
        },
        onFocus: (event: ReactFocusEvent<HTMLElement>) => {
          (onFocus as Handler<ReactFocusEvent<HTMLElement>>)?.(event);
          if (entry.current) bar?.focused(entry.current);
        },
        onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => {
          (onPointerEnter as Handler<ReactPointerEvent<HTMLElement>>)?.(event);
          if (entry.current) bar?.pointerEnter(entry.current);
        },
      })}
      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={positioner}
              className="overlay-positioner"
              data-slot="overlay-positioner"
            >
              {content}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
