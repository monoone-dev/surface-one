import { Directive, booleanAttribute, input } from "@angular/core";
import { type FloatingAlign } from "@surface-one/angular/core";
import {
  SoneOverlayPanel,
  SoneOverlayTriggerBase,
  type SoneOverlayContent,
} from "@surface-one/angular/popover";

import { createHoverIntent } from "./hover-intent";

/**
 * `[soneHoverCardTrigger]` — a link (or any focusable element) that previews a card
 * on hover and keyboard focus (spartan/ui `brnHoverCardTrigger`, Radix HoverCard): it
 * opens after `openDelay`, stays open while the pointer is on the trigger or the card,
 * and closes `closeDelay` after it leaves, on Escape or on a click outside. Non-modal:
 * focus stays on the trigger (the card is `aria-describedby` it while open) and Tab
 * moves on as usual. On a touch screen the first tap opens the card and the next one
 * follows the link.
 */
@Directive({
  selector: "[soneHoverCardTrigger]",
  exportAs: "soneHoverCardTrigger",
  host: {
    "[attr.aria-describedby]": "open() ? controls() : null",
    "(pointerdown)": "pointerType = $event.pointerType",
    "(pointerenter)": "onPointerEnter($event)",
    "(pointerleave)": "onPointerLeave($event)",
    "(focusin)": "onFocusIn()",
    "(focusout)": "onFocusOut($event)",
  },
})
export class SoneHoverCardTriggerDirective extends SoneOverlayTriggerBase {
  readonly content = input<SoneOverlayContent | null>(null, {
    alias: "soneHoverCardTrigger",
  });
  /** Alignment along the trigger's edge (centred, as in shadcn/ui). */
  override readonly align = input<FloatingAlign>("center");
  /** ms from hovering or focusing the trigger to opening. */
  readonly openDelay = input(700);
  /** ms from leaving the trigger and the card to closing. */
  readonly closeDelay = input(300);
  /** Open on keyboard focus too (on by default). */
  readonly openOnFocus = input(true, { transform: booleanAttribute });
  protected readonly haspopup = null;

  protected pointerType = "";
  protected readonly intent = createHoverIntent({
    isOpen: () => this.open(),
    open: () => this.open.set(true),
    close: () => this.close(false),
    openDelay: () => this.openDelay(),
    closeDelay: () => this.closeDelay(),
  });
  private panelCleanups: (() => void)[] = [];
  /** True while closing: focus coming back to the trigger must not reopen the card. */
  private closing = false;

  protected focusPanel(): void {
    // Non-modal: focus stays where it is.
  }

  protected onPointerEnter(event: PointerEvent): void {
    if (event.pointerType === "mouse" || event.pointerType === "pen")
      this.intent.enter();
  }

  protected onPointerLeave(event: PointerEvent): void {
    if (event.pointerType === "mouse" || event.pointerType === "pen")
      this.intent.leave();
  }

  protected onFocusIn(): void {
    if (this.openOnFocus() && !this.closing) this.intent.enter();
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget;
    if (next instanceof Node && this.positioner?.contains(next)) return;
    this.intent.leave();
  }

  protected override onTriggerClick(event: MouseEvent): void {
    // A tap opens the card first; the next tap follows the link.
    if (this.pointerType === "touch" && !this.open()) {
      event.preventDefault();
      this.intent.openNow();
    }
  }

  protected override onTriggerKeydown(event: KeyboardEvent): void {
    // Escape closes; focus is already on the trigger. Tab moves on as usual.
    if (!this.open() || event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    this.close(false);
  }

  protected override onAttach(): void {
    const positioner = this.positioner;
    if (!positioner) return;
    const on = (type: string, fn: () => void): void => {
      positioner.addEventListener(type, fn);
      this.panelCleanups.push(() => positioner.removeEventListener(type, fn));
    };
    on("pointerenter", () => this.intent.enter());
    on("pointerleave", () => this.intent.leave());
  }

  protected override onDetach(): void {
    this.intent.cancel();
    for (const fn of this.panelCleanups.splice(0)) fn();
  }

  override close(restoreFocus = false): void {
    this.intent.cancel();
    this.closing = true;
    try {
      super.close(restoreFocus);
    } finally {
      this.closing = false;
    }
  }
}

/**
 * `[soneHoverCard]` (or `[soneHoverCardContent]`) — the card a `soneHoverCardTrigger`
 * previews: the popover surface at `--hover-card-w`, with no role (it describes its
 * trigger). Put it in the trigger's `<ng-template>` or pass it by reference
 * (`#card="soneHoverCard"`): it stays hidden in place until the trigger opens it.
 */
@Directive({
  selector: "[soneHoverCard], [soneHoverCardContent]",
  exportAs: "soneHoverCard",
  host: {
    class: "popover hover-card",
    "data-slot": "hover-card",
  },
})
export class SoneHoverCardDirective extends SoneOverlayPanel {}

export const SONE_HOVER_CARD_PARTS = [
  SoneHoverCardTriggerDirective,
  SoneHoverCardDirective,
] as const;
