import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  output,
} from "@angular/core";

export type RepositionReason = "scroll" | "resize" | "motion";

@Directive({
  selector: "[soneRepositionOnScroll]",
})
export class SoneRepositionOnScrollDirective {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly repositionAnchor = input<HTMLElement | null>(null);
  readonly reposition = output<RepositionReason>();

  constructor() {
    const isInsideHost = (event: Event): boolean => {
      const target = event.target;
      return target instanceof Node && this.host.nativeElement.contains(target);
    };
    const onExternalScroll = (event: Event): void => {
      // Re-measuring on every internal scroll tick caused layout thrash and
      // blank fixed-layer paints in WKWebView.
      if (isInsideHost(event)) {
        return;
      }
      this.reposition.emit("scroll");
    };
    const onAnchorMotionEnd = (event: Event): void => {
      const anchor = this.repositionAnchor();
      const target = event.target;
      if (
        !anchor ||
        !(target instanceof Element) ||
        isInsideHost(event) ||
        (target !== anchor && !target.contains(anchor))
      ) {
        return;
      }
      this.reposition.emit("motion");
    };
    const onResize = (): void => this.reposition.emit("resize");
    window.addEventListener("scroll", onExternalScroll, {
      capture: true,
      passive: true,
    });
    window.addEventListener("resize", onResize, { passive: true });
    // A teleported overlay does not inherit an ancestor's transform animation;
    // re-measure once that motion settles so it can't retain a mid-entry rect.
    window.addEventListener("animationend", onAnchorMotionEnd, {
      capture: true,
    });
    window.addEventListener("transitionend", onAnchorMotionEnd, {
      capture: true,
    });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener("scroll", onExternalScroll, {
        capture: true,
      });
      window.removeEventListener("resize", onResize);
      window.removeEventListener("animationend", onAnchorMotionEnd, {
        capture: true,
      });
      window.removeEventListener("transitionend", onAnchorMotionEnd, {
        capture: true,
      });
    });
  }
}
