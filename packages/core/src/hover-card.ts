// The hover card trigger outside Angular: the twin of `soneHoverCardTrigger`
// (packages/angular/hover-card/hover-card.directive.ts) for the Vue and React
// SoneHoverCard — the popover trigger without the focus move, opened and closed by
// the shared hover intent. Browser-only.
import { createHoverIntent, type HoverIntent } from "./angular";
import type { MenuTriggerKeyEvent } from "./menu";
import { createPopoverTrigger, type PopoverTriggerOptions } from "./popover";

export interface HoverCardTriggerOptions extends Omit<
  PopoverTriggerOptions,
  "moveFocus"
> {
  /** ms from hovering or focusing the trigger to opening. */
  readonly openDelay: () => number;
  /** ms from leaving the trigger and the card to closing. */
  readonly closeDelay: () => number;
  /** Open on keyboard focus too. */
  readonly openOnFocus: () => boolean;
}

export interface HoverCardTrigger {
  readonly intent: HoverIntent;
  /** The trigger's pointer and focus events. */
  pointerDown(event: { readonly pointerType: string }): void;
  pointerEnter(event: { readonly pointerType: string }): void;
  pointerLeave(event: { readonly pointerType: string }): void;
  focusIn(): void;
  focusOut(event: { readonly relatedTarget: EventTarget | null }): void;
  /** A tap on a touch screen opens the card first; the next one follows the link. */
  triggerClick(event: { preventDefault(): void }): void;
  /** Escape closes an open card. */
  triggerKeyDown(event: MenuTriggerKeyEvent): void;
  /** The positioner is in the DOM: place it and listen. */
  attached(): void;
  detached(): void;
  close(restoreFocus?: boolean): void;
  reposition(): void;
}

const isMouse = (type: string): boolean => type === "mouse" || type === "pen";

/**
 * A hover card trigger (spartan/ui `brnHoverCardTrigger`, Radix HoverCard): the card
 * opens `openDelay` after the pointer rests on (or focus reaches) the trigger, stays
 * while the pointer is on the trigger or the card, and closes `closeDelay` after it
 * leaves, on Escape or on a click outside. Focus never moves.
 */
export function createHoverCardTrigger(
  options: HoverCardTriggerOptions,
): HoverCardTrigger {
  // While closing, focus coming back to the trigger must not reopen the card.
  let closing = false;
  const popover = createPopoverTrigger({
    ...options,
    moveFocus: () => false,
    setOpen: (open) => {
      if (!open) {
        closing = true;
        queueMicrotask(() => (closing = false));
      }
      options.setOpen(open);
    },
  });
  const intent = createHoverIntent({
    isOpen: options.isOpen,
    open: () => options.setOpen(true),
    close: () => popover.close(false),
    openDelay: options.openDelay,
    closeDelay: options.closeDelay,
  });
  let pointerType = "";
  let cleanups: (() => void)[] = [];

  const detached = (): void => {
    for (const fn of cleanups.splice(0)) fn();
    popover.detached();
  };

  return {
    intent,
    pointerDown(event) {
      pointerType = event.pointerType;
    },
    pointerEnter(event) {
      if (isMouse(event.pointerType)) intent.enter();
    },
    pointerLeave(event) {
      if (isMouse(event.pointerType)) intent.leave();
    },
    focusIn() {
      if (options.openOnFocus() && !closing) intent.enter();
    },
    focusOut(event) {
      const next = event.relatedTarget;
      const positioner = options.positioner();
      if (next instanceof Node && positioner?.contains(next)) return;
      intent.leave();
    },
    triggerClick(event) {
      if (pointerType === "touch" && !options.isOpen()) {
        event.preventDefault();
        intent.openNow();
      }
    },
    triggerKeyDown(event) {
      // Escape closes; focus is already on the trigger. Tab moves on as usual.
      if (!options.isOpen() || event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      intent.cancel();
      popover.close(false);
    },
    attached() {
      popover.attached();
      const positioner = options.positioner();
      if (!positioner || cleanups.length) return;
      const enter = (): void => intent.enter();
      const leave = (): void => intent.leave();
      positioner.addEventListener("pointerenter", enter);
      positioner.addEventListener("pointerleave", leave);
      cleanups = [
        () => positioner.removeEventListener("pointerenter", enter),
        () => positioner.removeEventListener("pointerleave", leave),
      ];
    },
    detached() {
      intent.cancel();
      detached();
    },
    close(restoreFocus = false) {
      intent.cancel();
      for (const fn of cleanups.splice(0)) fn();
      popover.close(restoreFocus);
    },
    reposition: popover.reposition,
  };
}
