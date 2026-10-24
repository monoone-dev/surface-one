// The combobox's listbox popup outside Angular: the twin of `input[soneComboboxInput]`
// (packages/angular/combobox, on the popover family's overlay base) for the Vue and React
// SoneCombobox. The popup renders in an `.overlay-positioner` on `<body>`, placed under
// the whole control and at least as wide; focus stays in the input. Browser-only.
import { listenForReposition } from "./menu";
import {
  isInsideOverlayLayer,
  openOverlayTriggers,
  placeOverlay,
} from "./overlay";

export interface ComboboxPopupOptions {
  /** The control the popup sits under (the field with its chips and buttons). */
  readonly anchor: () => HTMLElement | null;
  /** The `.overlay-positioner` the framework renders on `<body>` while open. */
  readonly positioner: () => HTMLElement | null;
  /** Closes the popup (the framework re-renders and calls `detached`). */
  readonly close: () => void;
}

export interface ComboboxPopup {
  /** The positioner is in the DOM (or re-rendered): size, place, listen. */
  attached(): void;
  /** The positioner is (about to be) removed. Safe to call more than once. */
  detached(): void;
  /** Scrolls the highlighted option into view. */
  revealActive(): void;
}

/**
 * The popup of a combobox: placed with the popover's `placeOverlay` under the anchor
 * (flipped when there is no room, re-placed on scroll and resize), closed by a press
 * outside the control and the popup. Escape and the other keys are the input's.
 */
export function createComboboxPopup(
  options: ComboboxPopupOptions,
): ComboboxPopup {
  const token = {};
  const cleanups: (() => void)[] = [];
  let attachedTo: HTMLElement | null = null;

  const place = (): void => {
    const positioner = attachedTo;
    const anchor = options.anchor();
    if (!positioner || !anchor) return;
    const panel = positioner.firstElementChild;
    if (panel instanceof HTMLElement)
      panel.style.minWidth = `${anchor.offsetWidth}px`;
    placeOverlay(positioner, anchor, {
      side: "bottom",
      align: "start",
      offset: 4,
    });
  };

  const revealActive = (): void => {
    attachedTo
      ?.querySelector("[data-highlighted]")
      ?.scrollIntoView?.({ block: "nearest" });
  };

  const detached = (): void => {
    if (!attachedTo) return;
    for (const fn of cleanups.splice(0)) fn();
    const i = openOverlayTriggers.indexOf(token);
    if (i >= 0) openOverlayTriggers.splice(i, 1);
    attachedTo = null;
  };

  const onDocumentPointerDown = (event: PointerEvent): void => {
    const target = event.target;
    if (
      !attachedTo ||
      !(target instanceof Node) ||
      isInsideOverlayLayer(attachedTo, options.anchor(), target)
    )
      return;
    options.close();
  };

  return {
    attached() {
      const positioner = options.positioner();
      if (!positioner) return;
      if (attachedTo === positioner) {
        place();
        return;
      }
      detached();
      attachedTo = positioner;
      openOverlayTriggers.push(token);
      const doc = positioner.ownerDocument;
      const handler = onDocumentPointerDown as EventListener;
      doc.addEventListener("pointerdown", handler, true);
      cleanups.push(() =>
        doc.removeEventListener("pointerdown", handler, true),
      );
      const win = doc.defaultView;
      if (win)
        cleanups.push(
          listenForReposition(win, positioner, options.anchor, place),
        );
      place();
      revealActive();
    },
    detached,
    revealActive,
  };
}
