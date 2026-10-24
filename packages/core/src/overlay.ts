// What the menu and popover triggers outside Angular share (the twins of
// SoneOverlayTriggerBase in packages/angular/popover/overlay-trigger.ts): the stack of
// open layers, the placement of the `.overlay-positioner` and the "inside this layer"
// test. Browser-only.
import {
  computeFloatingPosition,
  type FloatingAlign,
  type FloatingSide,
} from "./angular";

/** Open triggers (menus and popovers), oldest first: Escape on `<body>` closes the newest only. */
export const openOverlayTriggers: object[] = [];

let nextPanelId = 0;

/** A fresh id for a panel that has none, for the trigger's `aria-controls`. */
export function overlayPanelId(): string {
  return `sone-overlay-panel-${++nextPanelId}`;
}

/**
 * Places the `.overlay-positioner` next to `trigger` (flipped when that side lacks room,
 * its height capped to the room left) and marks it placed.
 */
export function placeOverlay(
  positioner: HTMLElement,
  trigger: HTMLElement,
  options: {
    readonly side: FloatingSide;
    readonly align: FloatingAlign;
    readonly offset: number;
  },
): void {
  const doc = trigger.ownerDocument;
  const win = doc.defaultView;
  if (!win) return;
  positioner.style.maxHeight = "";
  positioner.style.left = "0px";
  positioner.style.top = "0px";
  const placed = computeFloatingPosition(
    trigger.getBoundingClientRect(),
    { width: positioner.offsetWidth, height: positioner.offsetHeight },
    {
      width: doc.documentElement.clientWidth || win.innerWidth,
      height: win.innerHeight,
    },
    options,
  );
  positioner.style.left = `${Math.round(placed.x)}px`;
  positioner.style.top = `${Math.round(placed.y)}px`;
  positioner.style.maxHeight = `${placed.maxHeight}px`;
  positioner.setAttribute("data-side", placed.side);
  positioner.setAttribute("data-align", placed.align);
  positioner.setAttribute("data-placed", "");
}

/**
 * True when `target` is part of the layer: the trigger, the panel, or an overlay opened
 * above it (a nested popover, a dialog opened from the panel), appended to `<body>` later.
 */
export function isInsideOverlayLayer(
  positioner: HTMLElement,
  trigger: HTMLElement | null,
  target: Node,
): boolean {
  if (trigger?.contains(target) || positioner.contains(target)) return true;
  const body = positioner.ownerDocument.body;
  let top: Node = target;
  while (top.parentNode && top.parentNode !== body) top = top.parentNode;
  return (
    top.parentNode === body &&
    !!(
      positioner.compareDocumentPosition(top) & Node.DOCUMENT_POSITION_FOLLOWING
    )
  );
}
