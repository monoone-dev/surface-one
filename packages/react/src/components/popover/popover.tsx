"use client";

import {
  Children,
  createContext,
  createElement,
  isValidElement,
  useContext,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";

import {
  createPopoverTrigger,
  type FloatingAlign,
  type FloatingSide,
  type PopoverTrigger,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { cx, definePart, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

interface PopoverContext {
  readonly open: boolean;
  readonly controller: PopoverTrigger;
  readonly trigger: RefObject<HTMLElement | null>;
  readonly positioner: RefObject<HTMLDivElement | null>;
  readonly contentId: string;
  close(): void;
}

const POPOVER = createContext<PopoverContext | null>(null);

type Handler<E> = ((event: E) => void) | undefined;

/** The panel's children: nodes, or a function of `close` (focus goes back to the trigger). */
export type SonePopoverChildren =
  ReactNode | ((close: () => void) => ReactNode);

interface SurfaceOwnProps {
  /** `dialog` by default; `null` (or another role) when the panel is not one. */
  readonly role?: string | null;
}

export interface SonePopoverOwnProps extends SurfaceOwnProps {
  /** Shown or not, controlled with `onOpenChange` (the Vue `v-model:open`); or `defaultOpen`. */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** The side of the trigger the panel opens on; it flips when that side lacks room. */
  readonly side?: FloatingSide;
  /** Alignment along the trigger's edge. */
  readonly align?: FloatingAlign;
  /** Gap between the trigger and the panel, in px. */
  readonly offset?: number;
  /** Keep the panel open on a click outside it (Escape still closes it). */
  readonly keepOpenOnOutsideClick?: boolean;
  readonly children?: ReactNode;
}

/** The `.popover` surface — the markup of `[sonePopover]`. */
function surface(
  as: ElementType | undefined,
  role: string | null,
  props: Record<string, unknown>,
  children: ReactNode,
): ReactElement {
  const { className, ...rest } = props as { className?: string };
  return createElement(
    as ?? "div",
    {
      "data-slot": "popover",
      role: role ?? undefined,
      ...rest,
      className: cx("popover", className),
    },
    children,
  );
}

/** True when `children` hold a trigger or a content part. */
function hasParts(children: ReactNode): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement(child) &&
      (child.type === SonePopoverTrigger || child.type === SonePopoverContent),
  );
}

/**
 * `<SonePopover>` — the popover root (spartan/ui Popover): it holds `open` /
 * `defaultOpen` / `onOpenChange` and the placement (`side`, `align`, `offset`,
 * `keepOpenOnOutsideClick`) for its `SonePopoverTrigger` and `SonePopoverContent`.
 * Without those parts (and without `open` / `defaultOpen`) it is the bare `.popover`
 * surface, as it used to be.
 */
export function SonePopover<E extends ElementType = "div">({
  as,
  role = "dialog",
  open: openProp,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  offset = 4,
  keepOpenOnOutsideClick = false,
  children,
  ...rest
}: PolymorphicProps<E, SonePopoverOwnProps>): ReactElement {
  const [open, setOpen] = useControllable(
    openProp,
    defaultOpen ?? false,
    onOpenChange,
  );
  const trigger = useRef<HTMLElement | null>(null);
  const positioner = useRef<HTMLDivElement | null>(null);
  const contentId = `sone-popover-${useId()}`;

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
    createPopoverTrigger({
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
    }),
  );

  // After the DOM update: the content has rendered the positioner on <body> (or not).
  useLayoutEffect(() => {
    if (!open) return;
    controller.attached();
    return controller.detached;
  }, [open, controller]);

  const context = useMemo<PopoverContext>(
    () => ({
      open,
      controller,
      trigger,
      positioner,
      contentId,
      close: () => controller.close(true),
    }),
    [open, controller, contentId],
  );

  const root =
    openProp !== undefined || defaultOpen !== undefined || hasParts(children);
  if (!root) return surface(as, role, rest, children);
  return <POPOVER.Provider value={context}>{children}</POPOVER.Provider>;
}

/**
 * `[sonePopoverTrigger]` — the button that opens its `SonePopover` (a `<button>` unless
 * `as` says otherwise): `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
 * A click toggles; Escape closes and Tab moves into the open panel.
 */
export function SonePopoverTrigger<E extends ElementType = "button">({
  as,
  onClick,
  onKeyDown,
  ref,
  ...rest
}: PolymorphicProps<E>): ReactElement {
  const popover = useContext(POPOVER);
  const own = popover?.trigger;
  const triggerRef = useMemo(() => mergeRefs(own, ref as never), [own, ref]);
  if (!popover) throw new Error("SonePopoverTrigger needs a SonePopover");
  const { controller, open } = popover;
  const tag: ElementType = as ?? "button";
  return createElement(tag, {
    ...(tag === "button" && { type: "button" }),
    ...rest,
    ref: triggerRef,
    "aria-haspopup": "dialog",
    "aria-expanded": open ? "true" : "false",
    "aria-controls": open ? popover.contentId : undefined,
    "data-state": open ? "open" : "closed",
    // The caller's handler, then the trigger's own (Vue merges listeners the same way).
    onClick: (event: ReactMouseEvent<HTMLElement>) => {
      (onClick as Handler<ReactMouseEvent<HTMLElement>>)?.(event);
      controller.triggerClick();
    },
    onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
      (onKeyDown as Handler<ReactKeyboardEvent<HTMLElement>>)?.(event);
      // The synthetic event: stopping it keeps an enclosing dialog's Escape away.
      controller.triggerKeyDown(event);
    },
  });
}

export interface SonePopoverContentOwnProps extends SurfaceOwnProps {
  readonly children?: SonePopoverChildren;
}

/**
 * `[sonePopover]` / `[sonePopoverContent]` — the panel. Inside a `SonePopover` it is
 * rendered while open, in an `.overlay-positioner` on `<body>` placed next to the
 * trigger; `children` may be a function of `close`. Alone it is the bare `.popover`
 * surface. `role="dialog"` by default: name it with `aria-labelledby`.
 */
export function SonePopoverContent<E extends ElementType = "div">({
  as,
  role = "dialog",
  children,
  ...rest
}: PolymorphicProps<E, SonePopoverContentOwnProps>): ReactElement | null {
  const popover = useContext(POPOVER);
  const close = popover?.close ?? (() => undefined);
  const content = typeof children === "function" ? children(close) : children;
  if (!popover) return surface(as, role, rest, content);
  if (!popover.open || typeof document === "undefined") return null;
  return createPortal(
    <div
      ref={popover.positioner}
      className="overlay-positioner"
      data-slot="overlay-positioner"
    >
      {surface(
        as,
        role,
        { ...rest, id: popover.contentId, "data-state": "open" },
        content,
      )}
    </div>,
    document.body,
  );
}

/** `[sonePopoverHeader]` — the title and description at the top of a popover. */
export const SonePopoverHeader = definePart({
  name: "SonePopoverHeader",
  tag: "div",
  className: "popover-header",
  slot: "popover-header",
});

/** `[sonePopoverTitle]` — the popover's title; give it an `id` the popover names itself by. */
export const SonePopoverTitle = definePart({
  name: "SonePopoverTitle",
  tag: "p",
  className: "popover-title",
  slot: "popover-title",
});

/** `[sonePopoverDescription]` — a secondary line under the title. */
export const SonePopoverDescription = definePart({
  name: "SonePopoverDescription",
  tag: "p",
  className: "popover-description",
  slot: "popover-description",
});
