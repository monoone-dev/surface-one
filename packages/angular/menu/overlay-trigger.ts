import { Directive, afterNextRender, input } from "@angular/core";

import {
  createTypeaheadBuffer,
  isTypeaheadKey,
  listNavigationIndex,
  typeaheadIndex,
} from "@surface-one/angular/core";
import {
  SoneOverlayTriggerBase,
  type SoneOverlayContent,
} from "@surface-one/angular/popover";

import { SoneMenuDirective } from "./menu.directive";

const MENU_ITEM_SELECTOR =
  "[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']";
const KEEP_OPEN_SELECTOR = "[aria-haspopup='menu'], [data-menu-keep-open]";

/**
 * `[soneMenuTrigger]` — a menu button (spartan/ui `brnMenuTrigger`, WAI-ARIA menu
 * button pattern): opens a `[soneMenu]` panel, moves focus over its items with
 * Arrow keys, Home / End and typeahead, activates with Enter / Space and closes on
 * activation, Escape, Tab or a click outside. Items leave the Tab order while open.
 */
@Directive({
  selector: "[soneMenuTrigger]",
  exportAs: "soneMenuTrigger",
})
export class SoneMenuTriggerDirective extends SoneOverlayTriggerBase {
  readonly content = input<SoneOverlayContent | null>(null, {
    alias: "soneMenuTrigger",
  });
  protected readonly haspopup = "menu";

  private focusOnOpen: "first" | "last" | null = null;
  private menu: SoneMenuDirective | null = null;
  private readonly typeahead = createTypeaheadBuffer();

  protected override beforeOpen(focus: "first" | "last" | null): void {
    this.focusOnOpen = focus;
  }

  protected override onTriggerKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (["Enter", " ", "ArrowDown", "ArrowUp"].includes(key)) {
      event.preventDefault();
      const target = key === "ArrowUp" ? "last" : "first";
      if (this.open()) {
        this.focusItem(target);
      } else {
        this.beforeOpen(target);
        this.open.set(true);
      }
      return;
    }
    super.onTriggerKeydown(event);
  }

  protected override onAttach(panel: HTMLElement | null): void {
    const menuEl = panel?.matches('[data-slot="menu"]')
      ? panel
      : (panel?.querySelector<HTMLElement>('[data-slot="menu"]') ?? null);
    this.menu = menuEl ? SoneMenuDirective.forElement(menuEl) : null;
    this.menu?.setManaged(true);
  }

  protected override onDetach(): void {
    this.menu?.setManaged(false);
    this.menu = null;
  }

  protected focusPanel(): void {
    const focus = this.focusOnOpen;
    this.focusOnOpen = null;
    if (focus) {
      // Items get their tabindex from a signal: focus once that has rendered.
      afterNextRender(() => this.focusItem(focus), {
        injector: this.injector,
      });
      return;
    }
    const panel = this.panel;
    if (!panel) return;
    if (!panel.hasAttribute("tabindex")) panel.setAttribute("tabindex", "-1");
    panel.focus();
  }

  protected override onPanelKeydown(event: KeyboardEvent): void {
    const key = event.key;
    if (key === "Tab") {
      // APG menu: Tab closes the menu. An enclosing dialog may already have moved
      // focus on (default prevented); otherwise focusing the trigger lets the
      // browser's own Tab move on from it.
      this.close(!event.defaultPrevented);
      return;
    }
    if (key === "Escape") {
      super.onPanelKeydown(event);
      return;
    }
    const items = this.items();
    const active = this.doc.activeElement as HTMLElement | null;
    const current = items.findIndex((item) => item === active);
    const next = listNavigationIndex(key, current, items.length);
    if (next !== null) {
      event.preventDefault();
      items[next]?.focus();
      return;
    }
    if ((key === "Enter" || key === " ") && active && current >= 0) {
      event.preventDefault();
      active.click();
      return;
    }
    if (isTypeaheadKey(event)) {
      const labels = items.map((item) => item.textContent ?? "");
      const index = typeaheadIndex(labels, current, this.typeahead(key));
      if (index >= 0) {
        event.preventDefault();
        items[index]?.focus();
      }
    }
  }

  protected override onPanelClick(event: MouseEvent): void {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const item = target.closest<HTMLElement>(MENU_ITEM_SELECTOR);
    if (
      !item ||
      !this.positioner?.contains(item) ||
      item.matches(KEEP_OPEN_SELECTOR) ||
      item.getAttribute("aria-disabled") === "true" ||
      (item instanceof HTMLButtonElement && item.disabled)
    ) {
      return;
    }
    this.close(true);
  }

  private focusItem(which: "first" | "last"): void {
    const items = this.items();
    items[which === "first" ? 0 : items.length - 1]?.focus();
  }

  private items(): HTMLElement[] {
    const positioner = this.positioner;
    if (!positioner) return [];
    return Array.from(
      positioner.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR),
    ).filter(
      (item) =>
        item.getAttribute("aria-disabled") !== "true" &&
        !(item instanceof HTMLButtonElement && item.disabled) &&
        !item.closest("[hidden]"),
    );
  }
}
