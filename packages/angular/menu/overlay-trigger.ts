import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  EmbeddedViewRef,
  Injector,
  PLATFORM_ID,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
  model,
  signal,
  untracked,
} from "@angular/core";

import {
  SONE_FOCUS_SCOPE,
  computeFloatingPosition,
  createTypeaheadBuffer,
  isTypeaheadKey,
  listNavigationIndex,
  listenForReposition,
  tabbableElements,
  typeaheadIndex,
  type FloatingAlign,
  type FloatingSide,
} from "@surface-one/angular/core";

import { SoneMenuDirective, SoneOverlayPanel } from "./menu.directive";

/** The context of a panel template: `let-close` (or `let-close="close"`) closes it. */
export interface SoneOverlayContext {
  readonly $implicit: () => void;
  readonly close: () => void;
}

/** What a trigger opens: an `<ng-template>`, or a `[sonePopover]` / `[soneMenu]` panel by reference. */
export type SoneOverlayContent =
  TemplateRef<SoneOverlayContext> | SoneOverlayPanel;

const MENU_ITEM_SELECTOR =
  "[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']";
const KEEP_OPEN_SELECTOR = "[aria-haspopup='menu'], [data-menu-keep-open]";

/** Open triggers, oldest first: Escape on `<body>` closes the newest one only. */
const openTriggers: SoneOverlayTriggerBase[] = [];
let nextPanelId = 0;

/**
 * The open / close / place / dismiss logic shared by `sonePopoverTrigger` and
 * `soneMenuTrigger` (spartan/ui's brnPopoverTrigger / brnMenuTrigger). The panel
 * is rendered into an overlay layer appended to `<body>` (so no ancestor's
 * `overflow`, `transform` or stacking context can clip it), placed next to the
 * trigger with `computeFloatingPosition`, and re-placed on scroll and resize.
 */
@Directive({
  host: {
    "[attr.aria-haspopup]": "haspopup",
    "[attr.aria-expanded]": "open() ? 'true' : 'false'",
    "[attr.aria-controls]": "controls()",
    "[attr.data-state]": "open() ? 'open' : 'closed'",
    "(click)": "onTriggerClick($event)",
    "(keydown)": "onTriggerKeydown($event)",
  },
})
export abstract class SoneOverlayTriggerBase {
  /** The side of the trigger the panel opens on; it flips when that side lacks room. */
  readonly side = input<FloatingSide>("bottom");
  /** Alignment along the trigger's edge. */
  readonly align = input<FloatingAlign>("start");
  /** Gap between the trigger and the panel, in px. */
  readonly offset = input(4);
  /** Shown or not — `[(open)]`. */
  readonly open = model(false);
  /** Keep the panel open on a click outside it (Escape still closes it). */
  readonly keepOpenOnOutsideClick = input(false, {
    transform: booleanAttribute,
  });

  protected abstract readonly content: () => SoneOverlayContent | null;
  protected abstract readonly haspopup: "dialog" | "menu";

  protected readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly doc = inject(DOCUMENT);
  private readonly vcr = inject(ViewContainerRef);
  protected readonly injector = inject(Injector);
  private readonly scope = inject(SONE_FOCUS_SCOPE, { optional: true });
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _controls = signal<string | null>(null);
  protected readonly controls = this._controls.asReadonly();

  protected positioner: HTMLElement | null = null;
  protected panel: HTMLElement | null = null;
  private attached: SoneOverlayContent | null = null;
  private view: EmbeddedViewRef<SoneOverlayContext> | null = null;
  private placeholder: Comment | null = null;
  private cleanups: (() => void)[] = [];
  private readonly closeFn = (): void => this.close(true);

  constructor() {
    effect(() => {
      const isOpen = this.open();
      const content = this.content();
      untracked(() => {
        // A referenced panel stays hidden in place until it opens (also on the server).
        if (content instanceof SoneOverlayPanel && content !== this.attached) {
          content.setShown(false);
        }
        if (!this.browser) return;
        if (!isOpen) {
          this.detach(false);
          return;
        }
        afterNextRender(() => this.sync(), { injector: this.injector });
      });
    });
    inject(DestroyRef).onDestroy(() => this.detach(false));
  }

  /** Closes the panel; with `restoreFocus`, focus goes back to the trigger. */
  close(restoreFocus = false): void {
    const focusWasInside =
      !!this.positioner &&
      this.positioner.contains(this.doc.activeElement as Node | null);
    this.open.set(false);
    this.detach(false);
    if (restoreFocus || focusWasInside) this.host.focus();
  }

  /** Re-measures and re-places the open panel (e.g. after its content changed size). */
  reposition(): void {
    this.place();
  }

  protected onTriggerClick(event: MouseEvent): void {
    if (this.open()) {
      this.close(false);
      return;
    }
    this.beforeOpen(event.detail === 0 ? "first" : null);
    this.open.set(true);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (!this.open()) return;
    if (event.key === "Escape") {
      // Before an enclosing dialog's own Escape handler: close the innermost layer first.
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
      return;
    }
    if (
      event.key === "Tab" &&
      !event.shiftKey &&
      !this.scope &&
      this.positioner
    ) {
      // The panel sits right after its trigger in the Tab order.
      const first = tabbableElements(this.positioner)[0];
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  /** Hook: called before a click / key opens the panel. */
  protected beforeOpen(_focus: "first" | "last" | null): void {}

  /** Hook: move focus into the panel once it is placed. */
  protected abstract focusPanel(): void;

  protected onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.close(true);
      return;
    }
    if (event.key !== "Tab" || this.scope || !this.positioner) return;
    // Outside a dialog the panel's Tab stops sit between the trigger and whatever
    // follows it (inside one, the dialog's focus scope orders them).
    const stops = tabbableElements(this.positioner);
    const active = this.doc.activeElement;
    if (event.shiftKey && active === stops[0]) {
      event.preventDefault();
      this.host.focus();
    } else if (!event.shiftKey && active === stops[stops.length - 1]) {
      // Focus the trigger and let the browser's own Tab move on from there.
      this.close(true);
    }
  }

  protected onPanelClick(_event: MouseEvent): void {}

  private sync(): void {
    const content = this.content();
    if (!this.open() || !content) {
      this.detach(false);
      return;
    }
    if (this.attached === content) {
      this.place();
      return;
    }
    this.detach(false);
    this.attach(content);
  }

  private attach(content: SoneOverlayContent): void {
    const doc = this.doc;
    const positioner = doc.createElement("div");
    positioner.className = "overlay-positioner";
    positioner.setAttribute("data-slot", "overlay-positioner");
    let panel: HTMLElement | null;
    if (content instanceof TemplateRef) {
      const view = this.vcr.createEmbeddedView(content, {
        $implicit: this.closeFn,
        close: this.closeFn,
      });
      view.detectChanges();
      for (const node of view.rootNodes as Node[]) positioner.appendChild(node);
      this.view = view;
      panel =
        (view.rootNodes as Node[]).find(
          (n): n is HTMLElement => n instanceof HTMLElement,
        ) ?? null;
    } else {
      const el = content.element;
      this.placeholder = doc.createComment("sone-overlay-panel");
      el.parentNode?.insertBefore(this.placeholder, el);
      positioner.appendChild(el);
      content.setShown(true);
      panel = el;
    }
    doc.body.appendChild(positioner);
    this.positioner = positioner;
    this.panel = panel;
    this.attached = content;
    openTriggers.push(this);

    if (panel) {
      if (!panel.id) panel.id = `sone-overlay-panel-${++nextPanelId}`;
      this._controls.set(panel.id);
    }
    this.onAttach(panel);

    const listen = <K extends keyof HTMLElementEventMap>(
      target: HTMLElement | Document,
      type: K,
      handler: (event: HTMLElementEventMap[K]) => void,
      capture = false,
    ): void => {
      const fn = handler as EventListener;
      target.addEventListener(type, fn, capture);
      this.cleanups.push(() => target.removeEventListener(type, fn, capture));
    };
    // The scope registers its own key handling, so register it first; a closed panel unregisters.
    if (this.scope)
      this.cleanups.push(this.scope.registerPortal(this.host, positioner));
    listen(positioner, "keydown", (e) => this.onPanelKeydown(e));
    listen(positioner, "click", (e) => this.onPanelClick(e));
    listen(positioner, "focusout", (e) => this.onPanelFocusOut(e));
    listen(doc, "pointerdown", (e) => this.onDocumentPointerDown(e), true);
    listen(doc, "keydown", (e) => this.onDocumentKeydown(e));
    const win = doc.defaultView;
    if (win) {
      this.cleanups.push(
        listenForReposition(
          win,
          positioner,
          () => this.host,
          () => this.place(),
        ),
      );
    }

    this.place();
    this.focusPanel();
  }

  /** Hook: the panel element was just attached (or `null` for an element-less template). */
  protected onAttach(_panel: HTMLElement | null): void {}

  /** Hook: the panel is about to be removed. */
  protected onDetach(): void {}

  private detach(restoreFocus: boolean): void {
    if (!this.attached) return;
    this.onDetach();
    for (const fn of this.cleanups.splice(0)) fn();
    const i = openTriggers.indexOf(this);
    if (i >= 0) openTriggers.splice(i, 1);
    const content = this.attached;
    if (this.view) {
      this.view.destroy();
      this.view = null;
    } else if (content instanceof SoneOverlayPanel) {
      content.setShown(false);
      const placeholder = this.placeholder;
      if (placeholder?.parentNode) {
        placeholder.parentNode.insertBefore(content.element, placeholder);
      }
      placeholder?.remove();
      this.placeholder = null;
    }
    this.positioner?.remove();
    this.positioner = null;
    this.panel = null;
    this.attached = null;
    this._controls.set(null);
    if (restoreFocus) this.host.focus();
  }

  private place(): void {
    const positioner = this.positioner;
    const win = this.doc.defaultView;
    if (!positioner || !win) return;
    positioner.style.maxHeight = "";
    positioner.style.left = "0px";
    positioner.style.top = "0px";
    const placed = computeFloatingPosition(
      this.host.getBoundingClientRect(),
      { width: positioner.offsetWidth, height: positioner.offsetHeight },
      {
        width: this.doc.documentElement.clientWidth || win.innerWidth,
        height: win.innerHeight,
      },
      { side: this.side(), align: this.align(), offset: this.offset() },
    );
    positioner.style.left = `${Math.round(placed.x)}px`;
    positioner.style.top = `${Math.round(placed.y)}px`;
    positioner.style.maxHeight = `${placed.maxHeight}px`;
    positioner.setAttribute("data-side", placed.side);
    positioner.setAttribute("data-align", placed.align);
    positioner.setAttribute("data-placed", "");
  }

  /** True when `target` is part of this layer: the trigger, the panel, or an overlay opened above it. */
  private isInsideLayer(target: Node): boolean {
    const positioner = this.positioner;
    if (!positioner) return false;
    if (this.host.contains(target) || positioner.contains(target)) return true;
    // Overlays opened later (a nested popover, a dialog opened from the panel)
    // are appended to <body> after this one.
    const body = this.doc.body;
    let top: Node = target;
    while (top.parentNode && top.parentNode !== body) top = top.parentNode;
    return (
      top.parentNode === body &&
      !!(
        positioner.compareDocumentPosition(top) &
        Node.DOCUMENT_POSITION_FOLLOWING
      )
    );
  }

  private onDocumentPointerDown(event: PointerEvent): void {
    const target = event.target;
    if (
      this.keepOpenOnOutsideClick() ||
      !(target instanceof Node) ||
      this.isInsideLayer(target)
    ) {
      return;
    }
    this.close(false);
  }

  private onDocumentKeydown(event: KeyboardEvent): void {
    // Focus fell to <body>: neither the trigger nor the panel can hear the key.
    if (event.key !== "Escape" || event.defaultPrevented) return;
    const active = this.doc.activeElement;
    if (active && active !== this.doc.body) return;
    if (openTriggers[openTriggers.length - 1] !== this) return;
    event.preventDefault();
    this.close(true);
  }

  private onPanelFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    // `null`: focus left the window, or a click on something unfocusable (the
    // pointerdown handler owns clicks).
    if (!(next instanceof Node) || this.isInsideLayer(next)) return;
    this.close(false);
  }
}

/**
 * `[sonePopoverTrigger]` — opens a non-modal popover next to its host (spartan/ui
 * `brnPopoverTrigger`). Pass an `<ng-template>` (`let-close` closes it) or a
 * `[sonePopover]` panel by reference (`#pop="sonePopover"`). It closes on Escape
 * and on a click outside, returning focus to the trigger; inside a `sone-dialog`
 * the panel joins the dialog's focus trap.
 */
@Directive({
  selector: "[sonePopoverTrigger]",
  exportAs: "sonePopoverTrigger",
})
export class SonePopoverTriggerDirective extends SoneOverlayTriggerBase {
  readonly content = input<SoneOverlayContent | null>(null, {
    alias: "sonePopoverTrigger",
  });
  protected readonly haspopup = "dialog";

  protected focusPanel(): void {
    const panel = this.panel;
    if (!panel) return;
    const target =
      panel.querySelector<HTMLElement>("[autofocus], [data-autofocus]") ??
      tabbableElements(panel)[0] ??
      panel;
    if (target === panel && !panel.hasAttribute("tabindex")) {
      panel.setAttribute("tabindex", "-1");
    }
    target.focus();
  }
}

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
