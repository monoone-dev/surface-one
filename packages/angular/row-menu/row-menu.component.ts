import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

import { SoneRepositionOnScrollDirective } from "@surface-one/angular/core";
import { SoneTeleportToBodyDirective } from "@surface-one/angular/core";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";

const PANEL_GAP_PX = 4;
const MENU_ITEM_SELECTOR =
  "[role='menuitem'], [role='menuitemcheckbox'], [role='menuitemradio']";
const KEEP_OPEN_SELECTOR = "[aria-haspopup='menu'], [data-menu-keep-open]";
const VIEWPORT_MARGIN_PX = 8;

let nextRowMenuId = 0;

export type RowMenuSide = "bottom" | "top" | "right";
export type RowMenuAlign = "start" | "end";

@Component({
  selector: "sone-row-menu",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "data-slot": "row-menu",
    "[attr.data-state]": "isOpen() ? 'open' : 'closed'",
    "[class.is-open]": "isOpen()",
    "[class.is-prominent]": "prominent()",
    "(document:click)": "onDocumentClick($event)",
    "(document:keydown.escape)": "onEscape()",
  },
  imports: [
    ...SONE_MENU_PARTS,
    SoneRepositionOnScrollDirective,
    SoneTeleportToBodyDirective,
    SoneTooltipDirective,
    NgTemplateOutlet,
  ],
  templateUrl: "./row-menu.component.html",
  styleUrl: "./row-menu.component.scss",
})
export class SoneRowMenuComponent {
  readonly panelId = `sone-row-menu-${++nextRowMenuId}`;
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);
  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>("trigger");
  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");
  readonly triggerEl = computed(() => this.trigger().nativeElement);

  readonly label = input.required<string>();
  readonly disabled = input(false);
  readonly prominent = input(false);
  readonly side = input<RowMenuSide>("bottom");
  readonly sideEdge = input<string | null>(null);
  readonly align = input<RowMenuAlign>("end");
  readonly clipToScrollParents = input(true);
  readonly tooltip = input<string | null>(null);
  readonly openChange = output<boolean>();

  private readonly _open = signal(false);
  readonly isOpen = this._open.asReadonly();
  private readonly _panelPositioned = signal(false);
  readonly panelPositioned = this._panelPositioned.asReadonly();
  private readonly _panelLeft = signal(0);
  readonly panelLeft = this._panelLeft.asReadonly();
  private readonly _panelTop = signal(0);
  readonly panelTop = this._panelTop.asReadonly();
  private readonly _panelMaxHeight = signal<number | null>(null);
  readonly panelMaxHeight = this._panelMaxHeight.asReadonly();
  private focusPanelOnOpen: "first" | "last" | null = null;

  onTriggerClick(event: MouseEvent): void {
    this.toggle(event.detail === 0 ? "first" : null);
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (!["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const focusTarget = event.key === "ArrowUp" ? "last" : "first";
    if (this._open()) {
      this.focusItem(focusTarget);
      return;
    }
    this.toggle(focusTarget);
  }

  private toggle(focusPanel: "first" | "last" | null): void {
    if (this.disabled()) {
      return;
    }
    if (this._open()) {
      this.close();
      return;
    }
    this.focusPanelOnOpen = focusPanel;
    this._panelPositioned.set(false);
    this._open.set(true);
    this.openChange.emit(true);
    this.positionPanel();
  }

  close(): void {
    const wasOpen = this._open();
    this._open.set(false);
    this._panelPositioned.set(false);
    this._panelMaxHeight.set(null);
    this.focusPanelOnOpen = null;
    if (wasOpen) {
      this.openChange.emit(false);
    }
  }

  /** Synchronous, unlike `close()`: for an owner about to be detached for reuse
   *  (a backgrounded tab), where a signal-driven `@if` cannot reconcile before
   *  the detach and the teleported panel would otherwise linger over the next tab. */
  detachFromDocument(): void {
    this.panel()?.nativeElement.remove();
    this.close();
  }

  private closeAndRestoreFocus(): void {
    const panel = this.panel()?.nativeElement;
    const focusWasInPanel = !!panel && panel.contains(document.activeElement);
    this.close();
    if (focusWasInPanel) {
      this.trigger().nativeElement.focus();
    }
  }

  onPanelClick(event: MouseEvent): void {
    if (!this._open()) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const item = target.closest<HTMLElement>(MENU_ITEM_SELECTOR);
    if (
      !item ||
      item.matches(KEEP_OPEN_SELECTOR) ||
      item.getAttribute("aria-disabled") === "true" ||
      (item instanceof HTMLButtonElement && item.disabled)
    ) {
      return;
    }
    this.closeAndRestoreFocus();
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      this.closeAndRestoreFocus();
      return;
    }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }
    const items = this.enabledMenuItems();
    if (items.length === 0) {
      return;
    }
    event.preventDefault();
    const current = document.activeElement;
    const currentIndex = items.findIndex((item) => item === current);
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? items.length - 1
          : event.key === "ArrowDown"
            ? (currentIndex + 1 + items.length) % items.length
            : (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  }

  onDocumentClick(event: MouseEvent): void {
    if (!this._open()) {
      return;
    }
    const target = event.target as Node | null;
    if (
      target &&
      (this.host.nativeElement.contains(target) ||
        this.panel()?.nativeElement.contains(target))
    ) {
      return;
    }
    this.close();
  }

  onEscape(): void {
    if (this._open()) {
      this.close();
      this.trigger().nativeElement.focus();
    }
  }

  onViewportChange(): void {
    if (this._open()) {
      this._panelPositioned.set(false);
      this.positionPanel();
    }
  }

  private positionPanel(): void {
    afterNextRender(
      () => {
        const panel = this.panel()?.nativeElement;
        if (!panel || !this._open()) {
          return;
        }

        const anchorRect = this.trigger().nativeElement.getBoundingClientRect();
        let boundaryTop = VIEWPORT_MARGIN_PX;
        let boundaryBottom = window.innerHeight - VIEWPORT_MARGIN_PX;

        for (
          let ancestor = this.clipToScrollParents()
            ? this.host.nativeElement.parentElement
            : null;
          ancestor;
          ancestor = ancestor.parentElement
        ) {
          const overflowY = getComputedStyle(ancestor).overflowY;
          if (overflowY !== "auto" && overflowY !== "scroll") {
            continue;
          }
          const rect = ancestor.getBoundingClientRect();
          boundaryTop = Math.max(boundaryTop, rect.top);
          boundaryBottom = Math.min(boundaryBottom, rect.bottom);
        }

        if (this.side() === "right") {
          const top = Math.max(
            boundaryTop,
            Math.min(anchorRect.top, boundaryBottom - panel.offsetHeight),
          );
          const edgeSelector = this.sideEdge();
          const edge = edgeSelector
            ? this.host.nativeElement.closest(edgeSelector)
            : null;
          const startX = edge
            ? edge.getBoundingClientRect().right
            : anchorRect.right;
          this._panelLeft.set(
            Math.round(
              Math.min(
                startX + PANEL_GAP_PX,
                window.innerWidth - panel.offsetWidth - VIEWPORT_MARGIN_PX,
              ),
            ),
          );
          this._panelTop.set(Math.round(top));
          this._panelMaxHeight.set(Math.floor(boundaryBottom - top));
          this.finishPositioning();
          return;
        }

        const below = Math.max(
          0,
          boundaryBottom - anchorRect.bottom - PANEL_GAP_PX,
        );
        const above = Math.max(0, anchorRect.top - boundaryTop - PANEL_GAP_PX);
        const flipAbove =
          this.side() === "top" ||
          (panel.offsetHeight > below && above > below);
        const availableHeight = Math.floor(flipAbove ? above : below);
        const viewportLeft = Math.max(
          VIEWPORT_MARGIN_PX,
          Math.min(
            this.align() === "start"
              ? anchorRect.left
              : anchorRect.right - panel.offsetWidth,
            window.innerWidth - panel.offsetWidth - VIEWPORT_MARGIN_PX,
          ),
        );
        const viewportTop = flipAbove
          ? anchorRect.top -
            Math.min(panel.offsetHeight, availableHeight) -
            PANEL_GAP_PX
          : anchorRect.bottom + PANEL_GAP_PX;

        this._panelLeft.set(Math.round(viewportLeft));
        this._panelTop.set(Math.round(Math.max(boundaryTop, viewportTop)));
        this._panelMaxHeight.set(availableHeight);
        this.finishPositioning();
      },
      { injector: this.injector },
    );
  }

  private finishPositioning(): void {
    this._panelPositioned.set(true);
    if (this.focusPanelOnOpen) {
      // Consumed before scheduling: positioning can re-run on a nested
      // scroll/resize, and a still-set flag would race keyboard navigation.
      const focusTarget = this.focusPanelOnOpen;
      this.focusPanelOnOpen = null;
      afterNextRender(
        () => {
          if (this._open()) {
            this.focusItem(focusTarget);
          }
        },
        { injector: this.injector },
      );
    }
  }

  private focusItem(which: "first" | "last"): void {
    const items = this.enabledMenuItems();
    items[which === "first" ? 0 : items.length - 1]?.focus();
  }

  private enabledMenuItems(): HTMLElement[] {
    const panel = this.panel()?.nativeElement;
    if (!panel) {
      return [];
    }
    return Array.from(
      panel.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR),
    ).filter(
      (item) =>
        item.getAttribute("aria-disabled") !== "true" &&
        (!(item instanceof HTMLButtonElement) || !item.disabled),
    );
  }
}
