"use client";

import {
  createElement,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";
import { createPortal } from "react-dom";

import {
  createContextMenuTrigger,
  type ContextMenuPoint,
  type FloatingAlign,
  type FloatingSide,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import type { PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

/** What a `SoneContextMenuTrigger`'s `handle` ref can do. */
export interface SoneContextMenuHandle {
  /** Opens the menu at a viewport point, or at the area for `null`. */
  openAt(point: ContextMenuPoint | null): void;
  /** Closes the menu; with `restoreFocus`, focus goes back to the area. */
  close(restoreFocus?: boolean): void;
}

export interface SoneContextMenuTriggerOwnProps {
  /** Shown or not, controlled with `onOpenChange` (the Vue `v-model:open`). */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** Leave the browser's own context menu alone. */
  readonly disabled?: boolean;
  /** The side of the pointer the menu opens on; it flips when that side lacks room. */
  readonly side?: FloatingSide;
  /** Alignment at the pointer. */
  readonly align?: FloatingAlign;
  /** Gap between the pointer and the menu, in px. */
  readonly offset?: number;
  /** Keep the menu open on a click outside it (Escape still closes it). */
  readonly keepOpenOnOutsideClick?: boolean;
  /** The menu (a `SoneMenu`), or a function of `close` (focus goes back to the area). */
  readonly menu?: ReactNode | ((close: () => void) => ReactNode);
  /** Opens or closes the menu from code. */
  readonly handle?: Ref<SoneContextMenuHandle>;
}

type Handler<E> = ((event: E) => void) | undefined;

/**
 * `<SoneContextMenuTrigger menu={…}>` — the React twin of `[soneContextMenuTrigger]`
 * (spartan/ui `brnContextMenuTrigger`, Radix ContextMenu): an area (a `<div>` unless
 * `as` says otherwise) that opens the `menu` where it is asked for — a right click at
 * the pointer, a long press at the finger, the ContextMenu key or Shift+F10 at the area
 * on its first item. The menu behaves as a `SoneMenuTrigger`'s: Arrow keys, typeahead,
 * closes on activation, Escape, Tab or a click outside. Give the area `tabIndex={0}`
 * so the keyboard can reach it.
 */
export function SoneContextMenuTrigger<E extends ElementType = "div">({
  as,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  side = "bottom",
  align = "start",
  offset = 4,
  keepOpenOnOutsideClick = false,
  menu,
  handle,
  onContextMenu,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel,
  onPointerLeave,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: PolymorphicProps<E, SoneContextMenuTriggerOwnProps>): ReactElement {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const area = useRef<HTMLElement | null>(null);
  const positioner = useRef<HTMLDivElement | null>(null);

  // The latest props for the controller, which is created once.
  const live = useRef({
    open,
    setOpen,
    side,
    align,
    offset,
    keepOpenOnOutsideClick,
    disabled,
  });
  useInsertionEffect(() => {
    live.current = {
      open,
      setOpen,
      side,
      align,
      offset,
      keepOpenOnOutsideClick,
      disabled,
    };
  });

  const [controller] = useState(() =>
    createContextMenuTrigger({
      trigger: () => area.current,
      positioner: () => positioner.current,
      isOpen: () => live.current.open,
      setOpen: (value) => {
        live.current.open = value;
        live.current.setOpen(value);
      },
      side: () => live.current.side,
      align: () => live.current.align,
      offset: () => live.current.offset,
      keepOpenOnOutsideClick: () => live.current.keepOpenOnOutsideClick,
      disabled: () => live.current.disabled,
    }),
  );
  useImperativeHandle(
    handle,
    () => ({
      openAt: (point) => controller.openAt(point),
      close: (restoreFocus) => controller.close(restoreFocus),
    }),
    [controller],
  );

  // After the DOM update: the positioner is on <body> (or gone).
  useLayoutEffect(() => {
    if (!open) return;
    controller.attached();
    return controller.detached;
  }, [open, controller]);

  const areaRef = useMemo(() => mergeRefs(area, ref as never), [ref]);
  const close = () => controller.close(true);
  const content = typeof menu === "function" ? menu(close) : menu;
  const call = <T,>(fn: unknown, event: T): void => (fn as Handler<T>)?.(event);

  return (
    <>
      {createElement(as ?? "div", {
        ...rest,
        ref: areaRef,
        "data-slot": "context-menu-trigger",
        "data-disabled": disabled ? "" : undefined,
        "data-state": open ? "open" : "closed",
        onContextMenu: (event: ReactMouseEvent<HTMLElement>) => {
          call(onContextMenu, event);
          controller.contextMenu(event);
        },
        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
          call(onPointerDown, event);
          controller.pointerDown(event);
        },
        onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
          call(onPointerMove, event);
          controller.pointerMove(event);
        },
        onPointerUp: (event: ReactPointerEvent<HTMLElement>) => {
          call(onPointerUp, event);
          controller.pointerEnd();
        },
        onPointerCancel: (event: ReactPointerEvent<HTMLElement>) => {
          call(onPointerCancel, event);
          controller.pointerEnd();
        },
        onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
          call(onPointerLeave, event);
          controller.pointerEnd();
        },
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          call(onClick, event);
          controller.click();
        },
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
          call(onKeyDown, event);
          controller.keyDown(event);
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
