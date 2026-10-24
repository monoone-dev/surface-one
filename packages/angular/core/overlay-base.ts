import { DOCUMENT } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
  booleanAttribute,
} from "@angular/core";

import { type SoneFocusScope, tabbableElements } from "./focus-scope";

/**
 * The shared base of `sone-dialog`, `sone-alert-dialog` and `sone-sheet`: the focus
 * trap and return, Escape and scrim dismissal, the title / description wiring
 * (`SONE_OVERLAY`) and the stacking of nested overlays.
 *
 * Two ways to show one: render it with `@if` (it is open while mounted) and close it on
 * `(dismiss)`, or keep it mounted and bind `[(open)]` — a dismissal then also sets `open`
 * to `false`.
 */

export interface SoneOverlayLabel {
  readonly id: () => string;
}

export interface SoneOverlayHost {
  registerTitle(title: SoneOverlayLabel): void;
  unregisterTitle?(title: SoneOverlayLabel): void;
  registerDescription?(description: SoneOverlayLabel): void;
  unregisterDescription?(description: SoneOverlayLabel): void;
  /** Close the overlay the way its own close button does (when it may be dismissed). */
  requestClose?(): void;
}

export const SONE_OVERLAY = new InjectionToken<SoneOverlayHost>("SONE_OVERLAY");

const openOverlays: SoneOverlayBase[] = [];

@Directive({
  host: {
    "[attr.hidden]": "isOpen() ? null : ''",
    "(pointerdown)": "onLayerPointerDown($event)",
    "(document:keydown)": "onDocumentKeydown($event)",
    "(document:focusin)": "onDocumentFocusIn($event)",
  },
})
export abstract class SoneOverlayBase
  implements SoneOverlayHost, SoneFocusScope
{
  /**
   * Shown or not, two-way: `[(open)]`. Leave it unbound to show the overlay while it is
   * mounted (render it with `@if` and close it on `(dismiss)`).
   */
  readonly open = model<boolean | undefined>(undefined);
  readonly dismiss = output<void>();
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly showClose = input(true, { transform: booleanAttribute });
  readonly closeLabel = input($localize`:verb|Closes a dialog or sheet:Close`);
  readonly ariaLabel = input<string | null>(null);

  protected abstract readonly closeOnScrim: () => boolean;
  protected readonly cornerClose = (): boolean =>
    this.showClose() && this.dismissible();

  /** `open`, or `true` while it is unbound (mounted means open). */
  protected readonly isOpen = computed(() => this.open() ?? true);

  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");
  private readonly host =
    inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  private readonly title = signal<SoneOverlayLabel | null>(null);
  protected readonly titleId = computed(() => this.title()?.id() ?? null);
  private readonly description = signal<SoneOverlayLabel | null>(null);
  protected readonly descriptionId = computed(
    () => this.description()?.id() ?? null,
  );

  // `document.body` is excluded: it means focus already fell there (e.g. a menu item
  // that closed), and "returning" to it would steal focus from what the opener restores.
  // Read through the injected DOCUMENT so an overlay rendered open on the server
  // (SSR / prerender) does not touch the browser global.
  private readonly doc = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private returnFocus: HTMLElement | null = null;
  private active = false;

  /** Panels portaled out of this overlay by triggers inside it (`SONE_FOCUS_SCOPE`). */
  private readonly portals: { anchor: HTMLElement; panel: HTMLElement }[] = [];
  private pressStartedOnLayer = false;
  private ready = false;
  private panelElement: HTMLElement | null = null;

  constructor() {
    // Runs on the first check, before the panel renders: the opener still has focus.
    effect(() => {
      const open = this.isOpen();
      untracked(() => (open ? this.activate() : this.deactivate()));
    });
    inject(DestroyRef).onDestroy(() => this.deactivate());
  }

  /** Opened: join the stack, remember the opener and move focus in once it renders. */
  private activate(): void {
    if (this.active) return;
    this.active = true;
    this.returnFocus = focusReturnTarget(this.doc);
    openOverlays.push(this);
    afterNextRender(
      () => {
        const panel = this.panel()?.nativeElement;
        if (!this.active || !panel) return;
        this.ready = true;
        this.panelElement = panel;
        const target = panel.querySelector<HTMLElement>(
          "[autofocus], [data-autofocus]",
        );
        (target ?? panel).focus();
        if (
          (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement) &&
          target.dataset["autofocus"] === "select"
        ) {
          target.select();
        }
      },
      { injector: this.injector },
    );
  }

  /** Closed or destroyed: leave the stack and give focus back to the opener. */
  private deactivate(): void {
    if (!this.active) return;
    this.active = false;
    this.ready = false;
    const panelEl = this.panelElement;
    this.panelElement = null;
    const i = openOverlays.indexOf(this);
    if (i >= 0) openOverlays.splice(i, 1);
    // Only reclaim focus if it is still ours or lost — an owner that already moved it elsewhere keeps it.
    const active = this.doc.activeElement;
    const lost =
      !active ||
      active === this.doc.body ||
      !!panelEl?.contains(active) ||
      this.portals.some((p) => p.panel.contains(active));
    const target = this.returnFocus;
    this.returnFocus = null;
    if (lost && target?.isConnected) target.focus();
  }

  /** Dismissed by Escape, the scrim or the close button: tell the owner, and close when bound. */
  private dismissNow(): void {
    this.dismiss.emit();
    if (this.open() !== undefined) this.open.set(false);
  }

  registerTitle(title: SoneOverlayLabel): void {
    this.title.set(title);
  }

  unregisterTitle(title: SoneOverlayLabel): void {
    if (this.title() === title) this.title.set(null);
  }

  registerDescription(description: SoneOverlayLabel): void {
    if (this.description() === null) this.description.set(description);
  }

  unregisterDescription(description: SoneOverlayLabel): void {
    if (this.description() === description) this.description.set(null);
  }

  private isTopmost(): boolean {
    return openOverlays[openOverlays.length - 1] === this;
  }

  /**
   * A popover or menu opened from inside this overlay lives on `<body>`, outside
   * the panel; its focusable content still belongs here, right after its trigger.
   */
  registerPortal(anchor: HTMLElement, panel: HTMLElement): () => void {
    const entry = { anchor, panel };
    this.portals.push(entry);
    const onKeydown = (event: KeyboardEvent): void => {
      if (event.key !== "Tab" || event.defaultPrevented) return;
      event.preventDefault();
      this.cycleFocus(event.shiftKey);
    };
    panel.addEventListener("keydown", onKeydown);
    return () => {
      panel.removeEventListener("keydown", onKeydown);
      const i = this.portals.indexOf(entry);
      if (i >= 0) this.portals.splice(i, 1);
    };
  }

  private inPortal(node: Node): boolean {
    return this.portals.some((p) => p.panel.contains(node));
  }

  /** The Tab cycle: the panel's stops, each portal's stops spliced in right after its anchor. */
  private tabbables(): HTMLElement[] {
    const panel = this.panel()?.nativeElement;
    if (!panel) return [];
    const stops = tabbableElements(panel);
    const pending = [...this.portals];
    for (let progressed = true; pending.length > 0 && progressed;) {
      progressed = false;
      for (const entry of [...pending]) {
        // Anchored inside a portal that is not spliced in yet: wait for it.
        if (
          pending.some((p) => p !== entry && p.panel.contains(entry.anchor))
        ) {
          continue;
        }
        let at = stops.indexOf(entry.anchor);
        if (at < 0) at = lastStopBefore(stops, entry.anchor);
        stops.splice(at + 1, 0, ...tabbableElements(entry.panel));
        pending.splice(pending.indexOf(entry), 1);
        progressed = true;
      }
    }
    return stops;
  }

  private cycleFocus(backwards: boolean): void {
    const panel = this.panel()?.nativeElement;
    if (!panel) return;
    const stops = this.tabbables();
    if (stops.length === 0) {
      panel.focus();
      return;
    }
    const active = this.doc.activeElement;
    const wrap = (i: number): HTMLElement =>
      stops[(i + stops.length) % stops.length];
    const index = active instanceof HTMLElement ? stops.indexOf(active) : -1;
    if (index >= 0) {
      wrap(index + (backwards ? -1 : 1)).focus();
      return;
    }
    const portal =
      active instanceof HTMLElement
        ? this.portals.find((p) => p.panel.contains(active))
        : undefined;
    if (portal) {
      // Focus on a non-stop inside a portal (a menu item): leave it as if it sat
      // right after its anchor — back to the anchor, or on past the portal.
      const own = tabbableElements(portal.panel);
      const from = backwards
        ? portal.anchor
        : (own[own.length - 1] ?? portal.anchor);
      const at = stops.indexOf(from);
      if (at >= 0) {
        wrap(backwards ? at : at + 1).focus();
        return;
      }
    }
    const inside =
      active instanceof HTMLElement &&
      active !== panel &&
      panel.contains(active);
    let next: HTMLElement;
    if (!inside) {
      next = backwards ? stops[stops.length - 1] : stops[0];
    } else if (backwards) {
      const before = stops.filter(
        (s) =>
          s !== active &&
          !!(
            s.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_FOLLOWING
          ),
      );
      next = before[before.length - 1] ?? stops[stops.length - 1];
    } else {
      const after = stops.filter(
        (s) =>
          s !== active &&
          !!(
            s.compareDocumentPosition(active) & Node.DOCUMENT_POSITION_PRECEDING
          ),
      );
      next = after[0] ?? stops[0];
    }
    next.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== "Tab" || event.defaultPrevented) return;
    event.preventDefault();
    this.cycleFocus(event.shiftKey);
  }

  protected onEscape(event: Event): void {
    event.stopPropagation();
    if (this.dismissible()) this.dismissNow();
  }

  // Focus fell out of every element (on `<body>`): the panel's own `(keydown)` cannot
  // hear the key, so the topmost overlay answers here.
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.ready || !this.isTopmost() || event.defaultPrevented) return;
    const active = this.doc.activeElement;
    if (
      active &&
      active !== this.doc.body &&
      active !== this.doc.documentElement
    )
      return;
    if (event.key === "Tab") {
      event.preventDefault();
      this.cycleFocus(event.shiftKey);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (this.dismissible()) this.dismissNow();
    }
  }

  protected onDocumentFocusIn(event: FocusEvent): void {
    if (!this.ready || !this.isTopmost()) return;
    const target = event.target;
    if (
      !(target instanceof Node) ||
      this.host.contains(target) ||
      this.inPortal(target)
    )
      return;
    // A node placed after the overlay in the document was portaled after it opened
    // (menu, popover, nested dialog) and stacks on top — leave it be.
    if (
      this.host.compareDocumentPosition(target) &
      Node.DOCUMENT_POSITION_FOLLOWING
    )
      return;
    this.cycleFocus(false);
  }

  protected onLayerPointerDown(event: PointerEvent): void {
    this.pressStartedOnLayer = event.target === event.currentTarget;
  }

  protected onLayerClick(event: MouseEvent): void {
    const startedOnLayer = this.pressStartedOnLayer;
    this.pressStartedOnLayer = false;
    if (
      event.target === event.currentTarget &&
      startedOnLayer &&
      this.closeOnScrim() &&
      this.dismissible()
    ) {
      this.dismissNow();
    }
  }

  requestClose(): void {
    if (this.dismissible()) this.dismissNow();
  }
}

/** The index of the last stop before `node` in document order, or -1. */
function lastStopBefore(stops: readonly HTMLElement[], node: Node): number {
  for (let j = stops.length - 1; j >= 0; j--) {
    if (
      stops[j].compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
    )
      return j;
  }
  return -1;
}

function focusReturnTarget(doc: Document): HTMLElement | null {
  const active = doc.activeElement as HTMLElement | null;
  return active && active !== doc.body && typeof active.focus === "function"
    ? active
    : null;
}
