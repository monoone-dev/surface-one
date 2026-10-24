// The context menu outside Angular: the twin of `soneContextMenuTrigger`
// (packages/angular/context-menu/context-menu.directive.ts) for the Vue and React
// SoneContextMenu — the menu trigger placed at the pointer and opened by a right click,
// a long press or the ContextMenu key. Browser-only.
import {
  contextMenuEventPoint,
  contextMenuPointRect,
  createLongPress,
  isContextMenuKey,
  type ContextMenuPoint,
} from "./angular";
import {
  createMenuTrigger,
  type MenuTriggerKeyEvent,
  type MenuTriggerOptions,
} from "./menu";

export interface ContextMenuTriggerOptions extends Omit<
  MenuTriggerOptions,
  "anchorRect" | "controls"
> {
  /** Leave the browser's own context menu alone. */
  readonly disabled: () => boolean;
}

export interface ContextMenuTrigger {
  /** The area's `contextmenu` event. */
  contextMenu(event: {
    readonly clientX: number;
    readonly clientY: number;
    preventDefault(): void;
  }): void;
  pointerDown(event: {
    readonly pointerType: string;
    readonly clientX: number;
    readonly clientY: number;
  }): void;
  pointerMove(event: {
    readonly clientX: number;
    readonly clientY: number;
  }): void;
  /** pointerup / pointercancel / pointerleave. */
  pointerEnd(): void;
  /** A click on the area closes an open menu. */
  click(): void;
  /** The ContextMenu key or Shift+F10 open it on the first item; Escape closes it. */
  keyDown(event: MenuTriggerKeyEvent): void;
  /** Opens the menu at `point` (viewport px), or at the area for `null`. */
  openAt(point: ContextMenuPoint | null, focus?: "first" | null): void;
  attached(): void;
  detached(): void;
  close(restoreFocus?: boolean): void;
  reposition(): void;
}

/**
 * A context menu trigger (spartan/ui `brnContextMenuTrigger`, Radix ContextMenu): a
 * right click opens the menu at the pointer, a long press at the finger, the
 * ContextMenu key or Shift+F10 at the area's corner on its first item; the menu is
 * the menu trigger's (Arrow keys, typeahead, closes on activation, Escape, Tab or a
 * click outside).
 */
export function createContextMenuTrigger(
  options: ContextMenuTriggerOptions,
): ContextMenuTrigger {
  let point: ContextMenuPoint | null = null;
  let keyboardAt = 0;
  const menu = createMenuTrigger({
    ...options,
    anchorRect: () => {
      if (point) return contextMenuPointRect(point);
      const rect = options.trigger()?.getBoundingClientRect();
      return rect ? contextMenuPointRect({ x: rect.left, y: rect.top }) : null;
    },
  });
  const openAt = (
    at: ContextMenuPoint | null,
    focus: "first" | null = null,
  ): void => {
    if (options.disabled()) return;
    point = at;
    if (options.isOpen()) {
      menu.reposition();
      return;
    }
    menu.open(focus);
  };
  const longPress = createLongPress((at) => openAt(at, null));

  return {
    contextMenu(event) {
      if (options.disabled()) return;
      event.preventDefault();
      // The keyboard already opened it (some browsers also send contextmenu for the key).
      if (Date.now() - keyboardAt < 300) return;
      const at = contextMenuEventPoint(event);
      openAt(at, at ? null : "first");
    },
    pointerDown: (event) => longPress.down(event),
    pointerMove: (event) => longPress.move(event),
    pointerEnd: () => longPress.cancel(),
    click() {
      if (options.isOpen() && !longPress.justFired()) menu.close(false);
    },
    keyDown(event) {
      if (options.disabled()) return;
      if (isContextMenuKey(event)) {
        event.preventDefault();
        keyboardAt = Date.now();
        openAt(null, "first");
        return;
      }
      if (options.isOpen() && event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        menu.close(true);
      }
    },
    openAt,
    attached: menu.attached,
    detached() {
      longPress.cancel();
      menu.detached();
    },
    close: menu.close,
    reposition: menu.reposition,
  };
}
