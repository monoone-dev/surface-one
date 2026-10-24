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
  booleanAttribute,
} from "@angular/core";
import { DOCUMENT, NgTemplateOutlet } from "@angular/common";

import {
  SoneRepositionOnScrollDirective,
  SoneTeleportToBodyDirective,
  placeRowMenuPanel,
  rowMenuClosesOnClick,
  rowMenuEnabledItems,
  rowMenuNavigationTarget,
  soneId,
} from "@surface-one/angular/core";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";

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
  readonly panelId = soneId("sone-row-menu");
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly doc = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly trigger =
    viewChild.required<ElementRef<HTMLButtonElement>>("trigger");
  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");
  readonly triggerEl = computed(() => this.trigger().nativeElement);

  readonly label = input.required<string>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly prominent = input(false, { transform: booleanAttribute });
  readonly side = input<RowMenuSide>("bottom");
  readonly sideEdge = input<string | null>(null);
  readonly align = input<RowMenuAlign>("end");
  readonly clipToScrollParents = input(true, { transform: booleanAttribute });
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
    const focusWasInPanel = !!panel && panel.contains(this.doc.activeElement);
    this.close();
    if (focusWasInPanel) {
      this.trigger().nativeElement.focus();
    }
  }

  onPanelClick(event: MouseEvent): void {
    if (this._open() && rowMenuClosesOnClick(event.target)) {
      this.closeAndRestoreFocus();
    }
  }

  onPanelKeydown(event: KeyboardEvent): void {
    if (event.key === "Tab") {
      this.closeAndRestoreFocus();
      return;
    }
    const next = rowMenuNavigationTarget(
      this.panel()?.nativeElement,
      event.key,
    );
    if (next) {
      event.preventDefault();
      next.focus();
    }
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

        const placed = placeRowMenuPanel({
          host: this.host.nativeElement,
          trigger: this.trigger().nativeElement,
          panel,
          side: this.side(),
          align: this.align(),
          sideEdge: this.sideEdge(),
          clipToScrollParents: this.clipToScrollParents(),
        });
        if (!placed) {
          return;
        }

        this._panelLeft.set(Math.round(placed.x));
        this._panelTop.set(Math.round(placed.y));
        this._panelMaxHeight.set(placed.maxHeight);
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
    const items = rowMenuEnabledItems(this.panel()?.nativeElement);
    items[which === "first" ? 0 : items.length - 1]?.focus();
  }
}
