import {
  DestroyRef,
  Directive,
  afterNextRender,
  inject,
  input,
} from "@angular/core";
import { SoneMenuTriggerDirective } from "@surface-one/angular/menu";
import { type SoneOverlayContent } from "@surface-one/angular/popover";

import { createMenubar, type MenubarMenu } from "./menubar-controller";

/**
 * `[soneMenubar]` — a horizontal bar of menus (spartan/ui Menubar, WAI-ARIA menubar
 * pattern): `role="menubar"`, one Tab stop (roving tabindex) over its
 * `soneMenubarTrigger`s, ArrowLeft / ArrowRight, Home and End between them. Name it
 * with `aria-label`.
 */
@Directive({
  selector: "[soneMenubar]",
  exportAs: "soneMenubar",
  host: {
    class: "menubar",
    "data-slot": "menubar",
    role: "menubar",
  },
})
export class SoneMenubarDirective {
  /** @internal The roving focus and the switching between menus. */
  readonly bar = createMenubar();
}

/**
 * `[soneMenubarTrigger]` — a top-level item of a `soneMenubar` (`role="menuitem"`,
 * `aria-haspopup="menu"`, `aria-expanded`) that opens a `[soneMenu]` — the menu family's
 * panel, items, submenus and keys. Enter, Space and ArrowDown open it on the first
 * item, ArrowUp on the last; inside it ArrowLeft / ArrowRight close it and open the
 * neighbouring menu; once a menu is open, hovering another trigger switches to it.
 */
@Directive({
  selector: "[soneMenubarTrigger]",
  exportAs: "soneMenubarTrigger",
  host: {
    class: "menubar-trigger",
    "data-slot": "menubar-trigger",
    role: "menuitem",
    "(focus)": "menubar?.bar.focused(menubarMenu)",
    "(pointerenter)": "menubar?.bar.pointerEnter(menubarMenu)",
  },
})
export class SoneMenubarTriggerDirective extends SoneMenuTriggerDirective {
  override readonly content = input<SoneOverlayContent | null>(null, {
    alias: "soneMenubarTrigger",
  });

  protected readonly menubar = inject(SoneMenubarDirective, { optional: true });
  protected readonly menubarMenu: MenubarMenu = {
    element: this.host,
    isOpen: () => this.open(),
    open: (focus) => {
      if (this.open()) return;
      this.beforeOpen(focus);
      this.open.set(true);
    },
    close: () => this.close(false),
  };

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    super();
    const bar = this.menubar?.bar;
    if (bar) {
      afterNextRender(() => {
        const unregister = bar.register(this.menubarMenu);
        this.destroyRef.onDestroy(unregister);
      });
    }
  }

  protected override onTriggerKeydown(event: KeyboardEvent): void {
    if (this.menubar?.bar.triggerKeyDown(this.menubarMenu, event)) return;
    super.onTriggerKeydown(event);
  }

  protected override onPanelKeydown(event: KeyboardEvent): void {
    if (
      this.menubar?.bar.panelKeyDown(
        this.menubarMenu,
        event,
        this.doc.activeElement,
      )
    )
      return;
    super.onPanelKeydown(event);
  }
}

export const SONE_MENUBAR_PARTS = [
  SoneMenubarDirective,
  SoneMenubarTriggerDirective,
] as const;
