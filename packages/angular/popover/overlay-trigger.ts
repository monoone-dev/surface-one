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
  listenForReposition,
  tabbableElements,
  type FloatingAlign,
  type FloatingSide,
  soneId,
} from "@surface-one/angular/core";

/**
 * A panel a `sonePopoverTrigger` / `soneMenuTrigger` can open by reference
 * (`[soneMenuTrigger]="menu"` with `<div soneMenu #menu="soneMenu">`): while a
 * trigger controls it, it is `hidden` until opened, then moved into the trigger's
 * overlay layer on `<body>` and back when closed. Untouched when no trigger uses it.
 */
export abstract class SoneOverlayPanel {
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** @internal Called by the trigger that controls this panel. */
  setShown(shown: boolean): void {
    this.element.toggleAttribute("hidden", !shown);
  }
}

/** The context of a panel template: `let-close` (or `let-close="close"`) closes it. */
export interface SoneOverlayContext {
  readonly $implicit: () => void;
  readonly close: () => void;
}

/** What a trigger opens: an `<ng-template>`, or a `[sonePopover]` / `[soneMenu]` panel by reference. */
export type SoneOverlayContent =
  TemplateRef<SoneOverlayContext> | SoneOverlayPanel;

/** Open triggers, oldest first: Escape on `<body>` closes the newest one only. */
const openTriggers: SoneOverlayTriggerBase[] = [];

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
    "[attr.aria-expanded]": "haspopup ? (open() ? 'true' : 'false') : null",
    "[attr.aria-controls]": "haspopup ? controls() : null",
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
  /** `aria-haspopup`; `null` (a hover card) drops it with `aria-expanded` and `aria-controls`. */
  protected abstract readonly haspopup: "dialog" | "menu" | "listbox" | null;

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
      if (!panel.id) panel.id = soneId("sone-overlay-panel");
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
          () => this.anchorElement(),
          () => this.place(),
        ),
      );
    }

    this.place();
    this.focusPanel();
  }

  /**
   * Hook: the element the panel is placed next to (and that counts as inside the layer);
   * the trigger itself by default — a combobox anchors to its whole control.
   */
  protected anchorElement(): HTMLElement {
    return this.host;
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
      this.anchorElement().getBoundingClientRect(),
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
    if (
      this.host.contains(target) ||
      this.anchorElement().contains(target) ||
      positioner.contains(target)
    )
      return true;
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
