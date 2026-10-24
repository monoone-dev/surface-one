"use client";

import {
  createContext,
  createElement,
  useContext,
  useId,
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
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import {
  createHoverCardTrigger,
  type FloatingAlign,
  type FloatingSide,
  type HoverCardTrigger,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { cx, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

interface HoverCardContext {
  readonly open: boolean;
  readonly controller: HoverCardTrigger;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly positioner: RefObject<HTMLDivElement | null>;
  readonly contentId: string;
}

const HOVER_CARD = createContext<HoverCardContext | null>(null);

type Handler<E> = ((event: E) => void) | undefined;

export interface SoneHoverCardProps {
  /** Shown or not, controlled with `onOpenChange` (the Vue `v-model:open`); or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** ms from hovering or focusing the trigger to opening. */
  readonly openDelay?: number;
  /** ms from leaving the trigger and the card to closing. */
  readonly closeDelay?: number;
  /** Open on keyboard focus too. */
  readonly openOnFocus?: boolean;
  /** The side of the trigger the card opens on; it flips when that side lacks room. */
  readonly side?: FloatingSide;
  /** Alignment along the trigger's edge (centred, as in shadcn/ui). */
  readonly align?: FloatingAlign;
  /** Gap between the trigger and the card, in px. */
  readonly offset?: number;
  readonly children?: ReactNode;
}

/**
 * `<SoneHoverCard>` — the hover card root (spartan/ui HoverCard, Radix HoverCard): it
 * holds `open` / `defaultOpen` / `onOpenChange`, the delays (`openDelay` 700,
 * `closeDelay` 300, `openOnFocus`) and the placement for its `SoneHoverCardTrigger`
 * and `SoneHoverCardContent`.
 */
export function SoneHoverCard({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openDelay = 700,
  closeDelay = 300,
  openOnFocus = true,
  side = "bottom",
  align = "center",
  offset = 4,
  children,
}: SoneHoverCardProps): ReactElement {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const trigger = useRef<HTMLElement | null>(null);
  const positioner = useRef<HTMLDivElement | null>(null);
  const contentId = `sone-hover-card-${useId()}`;

  // The latest props for the controller, which is created once.
  const live = useRef({
    open,
    setOpen,
    side,
    align,
    offset,
    openDelay,
    closeDelay,
    openOnFocus,
  });
  useInsertionEffect(() => {
    live.current = {
      open,
      setOpen,
      side,
      align,
      offset,
      openDelay,
      closeDelay,
      openOnFocus,
    };
  });
  const [controller] = useState(() =>
    createHoverCardTrigger({
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
      openDelay: () => live.current.openDelay,
      closeDelay: () => live.current.closeDelay,
      openOnFocus: () => live.current.openOnFocus,
    }),
  );

  // After the DOM update: the content has rendered the positioner on <body> (or not).
  useLayoutEffect(() => {
    if (!open) return;
    controller.attached();
    return controller.detached;
  }, [open, controller]);

  const context = useMemo<HoverCardContext>(
    () => ({ open, controller, trigger, positioner, contentId }),
    [open, controller, contentId],
  );
  return <HOVER_CARD.Provider value={context}>{children}</HOVER_CARD.Provider>;
}

function useHoverCard(part: string): HoverCardContext {
  const card = useContext(HOVER_CARD);
  if (!card) throw new Error(`${part} needs a SoneHoverCard`);
  return card;
}

/**
 * `[soneHoverCardTrigger]` — the link (an `<a>` unless `as` says otherwise) that
 * previews its `SoneHoverCard` on hover and focus; it is `aria-describedby` the card
 * while it shows. On a touch screen the first tap opens the card.
 */
export function SoneHoverCardTrigger<E extends ElementType = "a">({
  as,
  onClick,
  onKeyDown,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...rest
}: PolymorphicProps<E>): ReactElement {
  const card = useContext(HOVER_CARD);
  const own = card?.trigger;
  const triggerRef = useMemo(() => mergeRefs(own, ref as never), [own, ref]);
  const { controller, open, contentId } = useHoverCard("SoneHoverCardTrigger");
  return createElement(as ?? "a", {
    ...rest,
    ref: triggerRef,
    "aria-describedby": open ? contentId : undefined,
    "data-state": open ? "open" : "closed",
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => {
      (onPointerDown as Handler<ReactPointerEvent<HTMLElement>>)?.(event);
      controller.pointerDown(event);
    },
    onPointerEnter: (event: ReactPointerEvent<HTMLElement>) => {
      (onPointerEnter as Handler<ReactPointerEvent<HTMLElement>>)?.(event);
      controller.pointerEnter(event);
    },
    onPointerLeave: (event: ReactPointerEvent<HTMLElement>) => {
      (onPointerLeave as Handler<ReactPointerEvent<HTMLElement>>)?.(event);
      controller.pointerLeave(event);
    },
    // React's focus events bubble, like focusin / focusout.
    onFocus: (event: ReactFocusEvent<HTMLElement>) => {
      (onFocus as Handler<ReactFocusEvent<HTMLElement>>)?.(event);
      controller.focusIn();
    },
    onBlur: (event: ReactFocusEvent<HTMLElement>) => {
      (onBlur as Handler<ReactFocusEvent<HTMLElement>>)?.(event);
      controller.focusOut(event);
    },
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      (onClick as Handler<ReactMouseEvent<HTMLElement>>)?.(event);
      controller.triggerClick(event);
    },
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      (onKeyDown as Handler<ReactKeyboardEvent<HTMLElement>>)?.(event);
      controller.triggerKeyDown(event);
    },
  });
}

/**
 * `[soneHoverCard]` / `[soneHoverCardContent]` — the card: rendered while open, in an
 * `.overlay-positioner` on `<body>` placed next to the trigger. No role: it describes
 * its trigger.
 */
export function SoneHoverCardContent<E extends ElementType = "div">({
  as,
  className,
  ...rest
}: PolymorphicProps<E>): ReactElement | null {
  const card = useHoverCard("SoneHoverCardContent");
  if (!card.open || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={card.positioner}
      className="overlay-positioner"
      data-slot="overlay-positioner"
    >
      {createElement(as ?? "div", {
        "data-slot": "hover-card",
        id: card.contentId,
        "data-state": "open",
        ...rest,
        className: cx("popover hover-card", className as string | undefined),
      })}
    </div>,
    document.body,
  );
}
