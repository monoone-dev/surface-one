"use client";

import {
  createElement,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type ReactElement,
} from "react";
import { createPortal } from "react-dom";

import {
  createMenuTrigger,
  type FloatingAlign,
  type FloatingSide,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import type { PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export interface SoneMenuTriggerOwnProps {
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
  /** Keep the menu open on a click outside it (Escape still closes it). */
  readonly keepOpenOnOutsideClick?: boolean;
  /** The menu (a `SoneMenu`), or a function of `close` (focus goes back to the trigger). */
  readonly menu?: ReactNode | ((close: () => void) => ReactNode);
}

type Handler<E> = ((event: E) => void) | undefined;

/**
 * `<SoneMenuTrigger menu={…}>` — a menu button, the React twin of `[soneMenuTrigger]`
 * (spartan/ui `brnMenuTrigger`, WAI-ARIA menu button pattern). It renders the trigger
 * (a `<button>` unless `as` says otherwise) and, while open, the `menu` in an
 * `.overlay-positioner` on `<body>`, placed next to the trigger (flipped when that side
 * lacks room) and re-placed on scroll and resize. Enter / Space / ArrowDown open it on
 * the first item, ArrowUp on the last; Arrow keys, Home / End and typeahead move over
 * the items, Enter / Space activate, and it closes on activation, Escape, Tab or a
 * click outside.
 */
export function SoneMenuTrigger<E extends ElementType = "button">({
  as,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "start",
  offset = 4,
  keepOpenOnOutsideClick = false,
  menu,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: PolymorphicProps<E, SoneMenuTriggerOwnProps>): ReactElement {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const [controls, setControls] = useState<string | null>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const positioner = useRef<HTMLDivElement | null>(null);

  // The latest props for the controller, which is created once.
  const live = useRef({
    open,
    setOpen,
    side,
    align,
    offset,
    keepOpenOnOutsideClick,
  });
  useInsertionEffect(() => {
    live.current = {
      open,
      setOpen,
      side,
      align,
      offset,
      keepOpenOnOutsideClick,
    };
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
      keepOpenOnOutsideClick: () => live.current.keepOpenOnOutsideClick,
      controls: setControls,
    }),
  );

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
        "aria-haspopup": "menu",
        "aria-expanded": open ? "true" : "false",
        "aria-controls": open ? (controls ?? undefined) : undefined,
        "data-state": open ? "open" : "closed",
        // The caller's handler, then the trigger's own (Vue merges listeners the same way).
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          (onClick as Handler<ReactMouseEvent<HTMLElement>>)?.(event);
          controller.triggerClick(event);
        },
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
          (onKeyDown as Handler<ReactKeyboardEvent<HTMLElement>>)?.(event);
          // The synthetic event: stopping it keeps an enclosing dialog's Escape away.
          controller.triggerKeyDown(event);
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
