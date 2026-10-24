import {
  DestroyRef,
  Directive,
  booleanAttribute,
  inject,
  input,
} from "@angular/core";
import { type FloatingRect } from "@surface-one/angular/core";
import { SoneMenuTriggerDirective } from "@surface-one/angular/menu";
import { type SoneOverlayContent } from "@surface-one/angular/popover";

import {
  contextMenuEventPoint,
  contextMenuPointRect,
  createLongPress,
  isContextMenuKey,
  type ContextMenuPoint,
} from "./context-menu-gesture";

/**
 * `[soneContextMenuTrigger]` — the area that opens a `[soneMenu]` where it is asked
 * for (spartan/ui `brnContextMenuTrigger`, Radix ContextMenu): a right click opens it
 * at the pointer, a long press at the finger, and the ContextMenu key or Shift+F10 at
 * the area on its first item. The menu is the menu family's: its items, groups,
 * check / radio items, submenus, Arrow keys, Home / End, typeahead, and it closes on
 * activation, Escape, Tab or a click outside, giving focus back to the area. Make the
 * area focusable (`tabindex="0"`) so the keyboard can reach it.
 */
@Directive({
  selector: "[soneContextMenuTrigger]",
  exportAs: "soneContextMenuTrigger",
  host: {
    "data-slot": "context-menu-trigger",
    "[attr.data-disabled]": "disabled() ? '' : null",
    "(contextmenu)": "onContextMenu($event)",
    "(pointerdown)": "longPress.down($event)",
    "(pointermove)": "longPress.move($event)",
    "(pointerup)": "longPress.cancel()",
    "(pointercancel)": "longPress.cancel()",
    "(pointerleave)": "longPress.cancel()",
  },
})
export class SoneContextMenuTriggerDirective extends SoneMenuTriggerDirective {
  override readonly content = input<SoneOverlayContent | null>(null, {
    alias: "soneContextMenuTrigger",
  });
  /** Leave the browser's own context menu alone. */
  readonly disabled = input(false, { transform: booleanAttribute });
  protected override readonly haspopup = null;

  private point: ContextMenuPoint | null = null;
  private keyboardAt = 0;
  protected readonly longPress = createLongPress((point) =>
    this.openAt(point, null),
  );

  constructor() {
    super();
    inject(DestroyRef).onDestroy(() => this.longPress.cancel());
  }

  /** Opens the menu with its corner at `point` (viewport px), or at the area when `null`. */
  openAt(point: ContextMenuPoint | null, focus: "first" | null = null): void {
    if (this.disabled()) return;
    this.point = point;
    if (this.open()) {
      this.reposition();
      return;
    }
    this.beforeOpen(focus);
    this.open.set(true);
  }

  protected onContextMenu(event: MouseEvent): void {
    if (this.disabled()) return;
    event.preventDefault();
    // The keyboard already opened it (some browsers also send contextmenu for the key).
    if (Date.now() - this.keyboardAt < 300) return;
    const point = contextMenuEventPoint(event);
    this.openAt(point, point ? null : "first");
  }

  protected override onTriggerClick(): void {
    // A click on the area closes an open menu; it never opens one.
    if (this.open() && !this.longPress.justFired()) this.close(false);
  }

  protected override onTriggerKeydown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    if (isContextMenuKey(event)) {
      event.preventDefault();
      this.keyboardAt = Date.now();
      this.openAt(null, "first");
      return;
    }
    if (this.open() && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
    }
  }

  protected override anchorRect(): FloatingRect {
    if (this.point) return contextMenuPointRect(this.point);
    // From the keyboard: at the area's top-left corner.
    const rect = this.anchorElement().getBoundingClientRect();
    return contextMenuPointRect({ x: rect.left, y: rect.top });
  }
}
