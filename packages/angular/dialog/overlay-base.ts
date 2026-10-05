import { DOCUMENT } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";

export interface SoneOverlayLabel {
  readonly id: () => string;
}

export interface SoneOverlayHost {
  registerTitle(title: SoneOverlayLabel): void;
  unregisterTitle?(title: SoneOverlayLabel): void;
  registerDescription?(description: SoneOverlayLabel): void;
  unregisterDescription?(description: SoneOverlayLabel): void;
}

export const SONE_OVERLAY = new InjectionToken<SoneOverlayHost>("SONE_OVERLAY");

const TABBABLE =
  'a[href], area[href], button, input:not([type="hidden"]), select, textarea, ' +
  'iframe, summary, audio[controls], video[controls], [contenteditable]:not([contenteditable="false"]), [tabindex]';

function isTabbable(el: HTMLElement): boolean {
  if (el.tabIndex < 0) return false;
  if ((el as HTMLButtonElement).disabled) return false;
  if (el.closest("fieldset:disabled, [inert]")) return false;
  // `offsetParent` is null for visible `position: fixed` elements, so check rendered boxes instead.
  return el.getClientRects().length > 0;
}

const openOverlays: SoneOverlayBase[] = [];

@Directive({
  host: {
    "(pointerdown)": "onLayerPointerDown($event)",
    "(document:keydown)": "onDocumentKeydown($event)",
    "(document:focusin)": "onDocumentFocusIn($event)",
  },
})
export abstract class SoneOverlayBase implements SoneOverlayHost {
  readonly dismiss = output<void>();
  readonly dismissible = input(true);
  readonly showClose = input(true);
  readonly closeLabel = input($localize`:verb|Closes a dialog or sheet:Close`);
  readonly ariaLabel = input<string | null>(null);

  protected abstract readonly closeOnScrim: () => boolean;
  protected readonly cornerClose = (): boolean =>
    this.showClose() && this.dismissible();

  protected readonly panel =
    viewChild.required<ElementRef<HTMLElement>>("panel");
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
  private readonly returnFocus: HTMLElement | null = focusReturnTarget(
    this.doc,
  );

  private pressStartedOnLayer = false;
  private ready = false;
  private panelElement: HTMLElement | null = null;

  constructor() {
    openOverlays.push(this);
    afterNextRender(() => {
      this.ready = true;
      const panel = this.panel().nativeElement;
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
    });
    inject(DestroyRef).onDestroy(() => {
      const panelEl = this.panelElement;
      const i = openOverlays.indexOf(this);
      if (i >= 0) openOverlays.splice(i, 1);
      // Only reclaim focus if it is still ours or lost — an owner that already moved it elsewhere keeps it.
      const active = document.activeElement;
      const lost =
        !active || active === document.body || panelEl?.contains(active);
      if (lost && this.returnFocus?.isConnected) this.returnFocus.focus();
    });
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

  private tabbables(): HTMLElement[] {
    const all = Array.from(
      this.panel().nativeElement.querySelectorAll<HTMLElement>(TABBABLE),
    ).filter(isTabbable);
    // A named radio group is ONE Tab stop, as the browser treats it.
    const groupStop = new Map<string, HTMLInputElement>();
    for (const el of all) {
      if (!(el instanceof HTMLInputElement) || el.type !== "radio" || !el.name)
        continue;
      const current = groupStop.get(el.name);
      if (!current || (el.checked && !current.checked))
        groupStop.set(el.name, el);
    }
    return all.filter(
      (el) =>
        !(el instanceof HTMLInputElement && el.type === "radio" && el.name) ||
        groupStop.get(el.name) === el,
    );
  }

  private cycleFocus(backwards: boolean): void {
    const panel = this.panel().nativeElement;
    const stops = this.tabbables();
    if (stops.length === 0) {
      panel.focus();
      return;
    }
    const active = document.activeElement;
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
    if (this.dismissible()) this.dismiss.emit();
  }

  // Focus fell out of every element (on `<body>`): the panel's own `(keydown)` cannot
  // hear the key, so the topmost overlay answers here.
  protected onDocumentKeydown(event: KeyboardEvent): void {
    if (!this.ready || !this.isTopmost() || event.defaultPrevented) return;
    const active = document.activeElement;
    if (
      active &&
      active !== document.body &&
      active !== document.documentElement
    )
      return;
    if (event.key === "Tab") {
      event.preventDefault();
      this.cycleFocus(event.shiftKey);
    } else if (event.key === "Escape") {
      event.preventDefault();
      if (this.dismissible()) this.dismiss.emit();
    }
  }

  protected onDocumentFocusIn(event: FocusEvent): void {
    if (!this.ready || !this.isTopmost()) return;
    const target = event.target;
    if (!(target instanceof Node) || this.host.contains(target)) return;
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
      this.dismiss.emit();
    }
  }

  protected requestClose(): void {
    if (this.dismissible()) this.dismiss.emit();
  }
}

function focusReturnTarget(doc: Document): HTMLElement | null {
  const active = doc.activeElement as HTMLElement | null;
  return active && active !== doc.body && typeof active.focus === "function"
    ? active
    : null;
}
