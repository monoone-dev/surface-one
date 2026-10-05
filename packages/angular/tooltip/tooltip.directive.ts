import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
} from "@angular/core";

const SHOW_DELAY_MS = 350;
const OFFSET_PX = 8;
const MARGIN_PX = 8;
const ARROW_INSET_PX = 12;

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

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
  readonly side = input<TooltipSide>("bottom", { alias: "soneTooltipSide" });
  readonly align = input<TooltipAlign>("center", { alias: "soneTooltipAlign" });
  readonly arrow = input(true, { alias: "soneTooltipArrow" });
  readonly disabled = input(false, { alias: "soneTooltipDisabled" });
  readonly showDelay = input(SHOW_DELAY_MS, { alias: "soneTooltipShowDelay" });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
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
    const bubble = document.createElement("div");
    bubble.className = "sone-tooltip";
    bubble.setAttribute("aria-hidden", "true");
    bubble.dataset["slot"] = "tooltip-content";
    bubble.dataset["state"] = delay > 0 ? "delayed-open" : "instant-open";
    if (this.arrow()) {
      bubble.dataset["arrow"] = "";
    }
    bubble.textContent = text;
    bubble.dataset["side"] = this.side();
    document.body.appendChild(bubble);
    this.bubble = bubble;
    this.place(bubble);
  }

  private place(bubble: HTMLDivElement): void {
    const anchor = this.host.nativeElement.getBoundingClientRect();
    const box = { width: bubble.offsetWidth, height: bubble.offsetHeight };
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const fits = (side: TooltipSide): boolean => {
      switch (side) {
        case "top":
          return anchor.top - OFFSET_PX - box.height >= MARGIN_PX;
        case "bottom":
          return anchor.bottom + OFFSET_PX + box.height <= vh - MARGIN_PX;
        case "left":
          return anchor.left - OFFSET_PX - box.width >= MARGIN_PX;
        case "right":
          return anchor.right + OFFSET_PX + box.width <= vw - MARGIN_PX;
      }
    };
    const preferred = this.side();
    const side =
      fits(preferred) || !fits(OPPOSITE[preferred])
        ? preferred
        : OPPOSITE[preferred];
    const vertical = side === "top" || side === "bottom";
    const align = this.align();

    let top: number;
    let left: number;
    if (vertical) {
      top =
        side === "bottom"
          ? anchor.bottom + OFFSET_PX
          : anchor.top - OFFSET_PX - box.height;
      left =
        align === "start"
          ? anchor.left
          : align === "end"
            ? anchor.right - box.width
            : anchor.left + anchor.width / 2 - box.width / 2;
    } else {
      left =
        side === "right"
          ? anchor.right + OFFSET_PX
          : anchor.left - OFFSET_PX - box.width;
      top =
        align === "start"
          ? anchor.top
          : align === "end"
            ? anchor.bottom - box.height
            : anchor.top + anchor.height / 2 - box.height / 2;
    }
    left = Math.max(MARGIN_PX, Math.min(left, vw - box.width - MARGIN_PX));
    top = Math.max(MARGIN_PX, Math.min(top, vh - box.height - MARGIN_PX));

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

  private clearTimer(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
