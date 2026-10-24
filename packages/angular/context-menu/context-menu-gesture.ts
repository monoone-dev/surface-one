// How a context menu is asked for, with no framework in it: the Angular
// `soneContextMenuTrigger`, the Vue and React `SoneContextMenu` (through
// @surface-one/core) and the React Native long-press menu share it.

/** A viewport point, and the zero-size rect a menu is placed against. */
export interface ContextMenuPoint {
  readonly x: number;
  readonly y: number;
}

/** The rect of a point: a menu opens with its corner there. */
export const contextMenuPointRect = ({ x, y }: ContextMenuPoint) => ({
  top: y,
  bottom: y,
  left: x,
  right: x,
});

/** The keyboard's context menu request: the ContextMenu key, or Shift+F10. */
export const isContextMenuKey = (event: {
  readonly key: string;
  readonly shiftKey: boolean;
}): boolean =>
  event.key === "ContextMenu" || (event.key === "F10" && event.shiftKey);

/**
 * The point a `contextmenu` event asks for, or `null` when the keyboard sent it (no
 * pointer position: the menu then opens at the element, on its first item).
 */
export function contextMenuEventPoint(event: {
  readonly clientX: number;
  readonly clientY: number;
  readonly button?: number;
}): ContextMenuPoint | null {
  if (event.clientX === 0 && event.clientY === 0) return null;
  return { x: event.clientX, y: event.clientY };
}

/** How long a touch must rest, and how far it may drift, to count as a long press. */
export const LONG_PRESS_MS = 500;
export const LONG_PRESS_SLOP_PX = 10;

export interface LongPress {
  /** A pointerdown: touch and pen start the timer; a mouse is left to `contextmenu`. */
  down(event: {
    readonly pointerType: string;
    readonly clientX: number;
    readonly clientY: number;
  }): void;
  /** A pointermove: drifting past the slop (a scroll, a drag) cancels. */
  move(event: { readonly clientX: number; readonly clientY: number }): void;
  /** pointerup / pointercancel / leaving: cancels a press still waiting. */
  cancel(): void;
  /** True for a moment after a long press fired (the click that may follow is not a click). */
  justFired(): boolean;
}

/** Touch-and-hold: calls `fire` with the point after `delay` ms of a still touch. */
export function createLongPress(
  fire: (point: ContextMenuPoint) => void,
  delay = LONG_PRESS_MS,
): LongPress {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let start: ContextMenuPoint | null = null;
  let firedAt = 0;
  const cancel = (): void => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    start = null;
  };
  return {
    down(event) {
      cancel();
      if (event.pointerType === "mouse") return;
      const point = { x: event.clientX, y: event.clientY };
      start = point;
      timer = setTimeout(() => {
        timer = null;
        start = null;
        firedAt = Date.now();
        fire(point);
      }, delay);
    },
    move(event) {
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (dx * dx + dy * dy > LONG_PRESS_SLOP_PX * LONG_PRESS_SLOP_PX) cancel();
    },
    cancel,
    justFired: () => Date.now() - firedAt < 700,
  };
}
