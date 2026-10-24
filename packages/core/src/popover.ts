// The popover trigger outside Angular: the twin of `sonePopoverTrigger`
// (packages/angular/popover/overlay-trigger.ts) for the Vue and React SonePopover.
// Browser-only.
import type { FloatingAlign, FloatingSide } from "./angular";
import { tabbableElements } from "./focus";
import { listenForReposition, type MenuTriggerKeyEvent } from "./menu";
import {
  isInsideOverlayLayer,
  openOverlayTriggers,
  overlayPanelId,
  placeOverlay,
} from "./overlay";

export interface PopoverTriggerOptions {
  /** The trigger element. */
  readonly trigger: () => HTMLElement | null;
  /** The `.overlay-positioner` the framework renders on `<body>` while open. */
  readonly positioner: () => HTMLElement | null;
  readonly isOpen: () => boolean;
  /** Opens or closes: the framework re-renders (and calls `attached` / `detached`). */
  readonly setOpen: (open: boolean) => void;
  readonly side: () => FloatingSide;
  readonly align: () => FloatingAlign;
  readonly offset: () => number;
  readonly keepOpenOnOutsideClick: () => boolean;
}

export interface PopoverTrigger {
  /** The trigger's click: opens, or closes an open popover. */
  triggerClick(): void;
  /** While open: Escape closes (focus back on the trigger), Tab moves into the panel. */
  triggerKeyDown(event: MenuTriggerKeyEvent): void;
  /** The positioner is in the DOM: place it, listen, move focus in. */
  attached(): void;
  /** The positioner is (about to be) removed. Safe to call more than once. */
  detached(): void;
  /** Closes the popover; with `restoreFocus` (or focus inside it), focus goes back to the trigger. */
  close(restoreFocus?: boolean): void;
  /** Re-measures and re-places the open panel. */
  reposition(): void;
}

/**
 * A popover trigger (spartan/ui `brnPopoverTrigger`): the panel floats next to the
 * trigger (`computeFloatingPosition`, flipped when that side lacks room, re-placed on
 * scroll and resize), takes focus (`[autofocus]`, else its first control, else itself),
 * sits right after the trigger in the Tab order, and closes on Escape, on a click
 * outside or when focus leaves it, giving focus back to the trigger.
 */
export function createPopoverTrigger(
  options: PopoverTriggerOptions,
): PopoverTrigger {
  const token = {};
  const cleanups: (() => void)[] = [];
  let attachedTo: HTMLElement | null = null;

  const doc = (): Document =>
    options.trigger()?.ownerDocument ?? globalThis.document;

  const place = (): void => {
    const positioner = attachedTo;
    const trigger = options.trigger();
    if (!positioner || !trigger) return;
    placeOverlay(positioner, trigger, {
      side: options.side(),
      align: options.align(),
      offset: options.offset(),
    });
  };

  const isInsideLayer = (target: Node): boolean =>
    !!attachedTo && isInsideOverlayLayer(attachedTo, options.trigger(), target);

  const detached = (): void => {
    if (!attachedTo) return;
    for (const fn of cleanups.splice(0)) fn();
    const i = openOverlayTriggers.indexOf(token);
    if (i >= 0) openOverlayTriggers.splice(i, 1);
    attachedTo = null;
  };

  const close = (restoreFocus = false): void => {
    const focusWasInside =
      !!attachedTo && attachedTo.contains(doc().activeElement);
    detached();
    options.setOpen(false);
    if (restoreFocus || focusWasInside) options.trigger()?.focus();
  };

  const onPanelKeydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      close(true);
      return;
    }
    if (event.key !== "Tab" || !attachedTo) return;
    // The panel's Tab stops sit between the trigger and whatever follows it.
    const stops = tabbableElements(attachedTo);
    const active = doc().activeElement;
    if (event.shiftKey && active === stops[0]) {
      event.preventDefault();
      options.trigger()?.focus();
    } else if (!event.shiftKey && active === stops[stops.length - 1]) {
      // Focus the trigger and let the browser's own Tab move on from there.
      close(true);
    }
  };

  const onPanelFocusOut = (event: FocusEvent): void => {
    const next = event.relatedTarget;
    // `null`: focus left the window, or a click on something unfocusable (the
    // pointerdown handler owns clicks).
    if (!(next instanceof Node) || isInsideLayer(next)) return;
    close(false);
  };

  const onDocumentPointerDown = (event: PointerEvent): void => {
    const target = event.target;
    if (
      options.keepOpenOnOutsideClick() ||
      !(target instanceof Node) ||
      isInsideLayer(target)
    ) {
      return;
    }
    close(false);
  };

  const onDocumentKeydown = (event: KeyboardEvent): void => {
    // Focus fell to <body>: neither the trigger nor the panel can hear the key.
    if (event.key !== "Escape" || event.defaultPrevented) return;
    const active = doc().activeElement;
    if (active && active !== doc().body) return;
    if (openOverlayTriggers[openOverlayTriggers.length - 1] !== token) return;
    event.preventDefault();
    close(true);
  };

  const focusPanel = (): void => {
    const panel = attachedTo?.firstElementChild;
    if (!(panel instanceof HTMLElement)) return;
    const target =
      panel.querySelector<HTMLElement>("[autofocus], [data-autofocus]") ??
      tabbableElements(panel)[0] ??
      panel;
    if (target === panel && !panel.hasAttribute("tabindex")) {
      panel.setAttribute("tabindex", "-1");
    }
    target.focus();
  };

  return {
    triggerClick() {
      if (options.isOpen()) {
        close(false);
        return;
      }
      options.setOpen(true);
    },
    triggerKeyDown(event) {
      if (!options.isOpen()) return;
      if (event.key === "Escape") {
        // Before an enclosing dialog's own Escape handler: close the innermost layer first.
        event.preventDefault();
        event.stopPropagation();
        close(true);
        return;
      }
      if (event.key === "Tab" && !event.shiftKey && attachedTo) {
        // The panel sits right after its trigger in the Tab order.
        const first = tabbableElements(attachedTo)[0];
        if (first) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    attached() {
      const positioner = options.positioner();
      if (!positioner || !options.isOpen()) return;
      if (attachedTo === positioner) {
        place();
        return;
      }
      detached();
      attachedTo = positioner;
      openOverlayTriggers.push(token);
      const panel = positioner.firstElementChild;
      if (panel instanceof HTMLElement && !panel.id)
        panel.id = overlayPanelId();
      const listen = <K extends keyof DocumentEventMap>(
        target: HTMLElement | Document,
        type: K,
        handler: (event: DocumentEventMap[K]) => void,
        capture = false,
      ): void => {
        const fn = handler as EventListener;
        target.addEventListener(type, fn, capture);
        cleanups.push(() => target.removeEventListener(type, fn, capture));
      };
      const d = doc();
      listen(positioner, "keydown", onPanelKeydown);
      listen(positioner, "focusout", onPanelFocusOut);
      listen(d, "pointerdown", onDocumentPointerDown, true);
      listen(d, "keydown", onDocumentKeydown);
      const win = d.defaultView;
      if (win) {
        cleanups.push(
          listenForReposition(win, positioner, options.trigger, place),
        );
      }
      place();
      focusPanel();
    },
    detached,
    close,
    reposition: place,
  };
}
