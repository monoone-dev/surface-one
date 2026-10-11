import { DOCUMENT } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  InjectionToken,
  inject,
  input,
  booleanAttribute,
} from "@angular/core";
import {
  computeFloatingPosition,
  type FloatingPosition,
} from "@surface-one/angular/core";

const SHOW_DELAY_MS = 350;
const OFFSET_PX = 8;
const MARGIN_PX = 8;
const ARROW_INSET_PX = 12;

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

/**
 * Lets a container choose the side of the tooltips inside it when they set none —
 * a dock on the bottom edge of a canvas opens them upwards.
 */
export const SONE_TOOLTIP_SIDE = new InjectionToken<() => TooltipSide>(
  "SONE_TOOLTIP_SIDE",
);

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/** The room a placement has on its own side: height above / below, width beside. */
function mainRoom(placed: FloatingPosition): number {
  return placed.side === "top" || placed.side === "bottom"
    ? placed.maxHeight
    : placed.maxWidth;
}

/**
 * Replaces the host's native `title` rather than sitting beside it — both at
 * once would show two tooltips. The bubble is `aria-hidden`; the control
 * keeps naming itself as it already did, or a screen reader would announce
 * the name twice.
 */
@Directive({
  selector: "[soneTooltip]",
  host: {
    "(mouseenter)": "schedule()",
    "(mouseleave)": "hide()",
    "(focusin)": "schedule()",
    "(focusout)": "hide()",
    "(click)": "hide()",
    "(keydown.escape)": "hide()",
    "(document:keydown.escape)": "onEscape()",
  },
})
export class SoneTooltipDirective {
  readonly text = input<string>("", { alias: "soneTooltip" });
  /** `null`: the side its container asks for (`SONE_TOOLTIP_SIDE`), else `bottom`. */
  readonly side = input<TooltipSide | null>(null, { alias: "soneTooltipSide" });
  readonly align = input<TooltipAlign>("center", { alias: "soneTooltipAlign" });
  readonly arrow = input(true, {
    alias: "soneTooltipArrow",
    transform: booleanAttribute,
  });
  readonly disabled = input(false, {
    alias: "soneTooltipDisabled",
    transform: booleanAttribute,
  });
  readonly showDelay = input(SHOW_DELAY_MS, { alias: "soneTooltipShowDelay" });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly contextSide = inject(SONE_TOOLTIP_SIDE, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  private bubble: HTMLDivElement | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => this.hide());
  }

  protected schedule(): void {
    const text = this.resolveText();
    if (!text || this.disabled()) {
      this.hide();
      return;
    }
    this.clearTimer();
    const delay = Number.isFinite(this.showDelay())
      ? Math.max(0, this.showDelay())
      : SHOW_DELAY_MS;
    this.timer = setTimeout(() => this.show(text, delay), delay);
  }

  protected onEscape(): void {
    if (this.bubble || this.timer !== null) {
      this.hide();
    }
  }

  protected hide(): void {
    this.clearTimer();
    this.bubble?.remove();
    this.bubble = null;
  }

  private resolveText(): string {
    const bound = this.text().trim();
    if (bound) {
      return bound;
    }
    const title = this.host.nativeElement.getAttribute("title")?.trim() ?? "";
    if (title) {
      this.host.nativeElement.removeAttribute("title");
      this.host.nativeElement.dataset["tooltip"] = title;
    }
    return title || (this.host.nativeElement.dataset["tooltip"] ?? "");
  }

  private show(text: string, delay: number): void {
    this.timer = null;
    if (!this.host.nativeElement.isConnected) {
      return;
    }
    this.hide();
    const bubble = this.doc.createElement("div");
    bubble.className = "sone-tooltip";
    bubble.setAttribute("aria-hidden", "true");
    bubble.dataset["slot"] = "tooltip-content";
    bubble.dataset["state"] = delay > 0 ? "delayed-open" : "instant-open";
    if (this.arrow()) {
      bubble.dataset["arrow"] = "";
    }
    bubble.textContent = text;
    bubble.dataset["side"] = this.preferredSide();
    this.doc.body.appendChild(bubble);
    this.bubble = bubble;
    this.place(bubble);
  }

  private place(bubble: HTMLDivElement): void {
    const anchor = this.host.nativeElement.getBoundingClientRect();
    const box = { width: bubble.offsetWidth, height: bubble.offsetHeight };
    const view = this.doc.defaultView;
    const vw = view?.innerWidth ?? 0;
    const vh = view?.innerHeight ?? 0;
    const align = this.align();
    const at = (side: TooltipSide): FloatingPosition =>
      computeFloatingPosition(
        anchor,
        box,
        { width: vw, height: vh },
        { side, align, offset: OFFSET_PX, margin: MARGIN_PX, flip: false },
      );

    // The preferred side unless the bubble only fits on the opposite one.
    const preferred = at(this.preferredSide());
    const opposite = at(OPPOSITE[preferred.side]);
    const fits = (placed: FloatingPosition): boolean =>
      (preferred.side === "top" || preferred.side === "bottom"
        ? box.height
        : box.width) <= mainRoom(placed);
    const placed = fits(preferred) || !fits(opposite) ? preferred : opposite;
    const side = placed.side;
    const vertical = side === "top" || side === "bottom";
    // A tooltip is never capped: when it fits on neither side it still stays
    // whole on screen, overlapping its anchor.
    const left = Math.max(
      MARGIN_PX,
      Math.min(placed.x, vw - box.width - MARGIN_PX),
    );
    const top = Math.max(
      MARGIN_PX,
      Math.min(placed.y, vh - box.height - MARGIN_PX),
    );

    bubble.dataset["side"] = side;
    bubble.dataset["align"] = align;
    bubble.style.top = `${Math.round(top)}px`;
    bubble.style.left = `${Math.round(left)}px`;

    const span = vertical ? box.width : box.height;
    const target = vertical
      ? anchor.left + anchor.width / 2 - left
      : anchor.top + anchor.height / 2 - top;
    const lo = Math.min(ARROW_INSET_PX, span / 2);
    const arrowAt = Math.max(lo, Math.min(target, span - lo));
    bubble.style.setProperty(
      "--sone-tooltip-arrow-at",
      `${Math.round(arrowAt)}px`,
    );
  }

  private preferredSide(): TooltipSide {
    return this.side() ?? this.contextSide?.() ?? "bottom";
  }

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
