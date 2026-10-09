import { Directive, ElementRef, effect, inject, input } from "@angular/core";

@Directive({
  selector: "[soneFloatingDock]",
})
export class SoneFloatingDockDirective {
  private readonly dock = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly soneFloatingDock = input(false);
  readonly floatingDockAnchor = input.required<HTMLElement>();

  clearance = 0;

  private readonly tracking = effect((onCleanup) => {
    const anchor = this.floatingDockAnchor();
    if (!this.soneFloatingDock()) {
      return;
    }
    const dock = this.dock.nativeElement;
    const doc = dock.ownerDocument;
    const view = doc.defaultView;
    if (!view || typeof ResizeObserver === "undefined") {
      return;
    }
    const region = scrollRegion(anchor);
    const setPx = (name: string, value: number) =>
      anchor.style.setProperty(`--markdown-editor-dock-${name}`, `${value}px`);
    const apply = (left: number, right: number, inset: number) => {
      setPx("left", left);
      setPx("right", right);
      setPx("inset", inset);
    };
    const place = () => {
      const box = anchor.getBoundingClientRect();
      // The bottom of what is visible of the region, but never above the editor's own top:
      // while the editor is still below the fold, the dock waits below it too.
      const bottom = Math.min(
        region?.getBoundingClientRect().bottom ?? Infinity,
        Math.max(view.innerHeight, box.top + this.clearance),
      );
      setPx("h", dock.offsetHeight);
      setPx("w", box.width);
      const left = box.left;
      const right = doc.documentElement.clientWidth - box.right;
      const inset = view.innerHeight - bottom;
      apply(left, right, inset);
      // A transformed ancestor (a filled enter animation) becomes the fixed dock's containing
      // block, so correct by where the dock actually landed.
      const landed = dock.getBoundingClientRect();
      const gap = parseFloat(view.getComputedStyle(dock).bottom) - inset;
      const dx = landed.left + landed.width / 2 - (box.left + box.width / 2);
      const dy = landed.bottom - (bottom - gap);
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        apply(left - dx, right + dx, inset + dy);
      }
      this.clearance = dock.offsetHeight + 2 * gap;
    };
    const observer = new ResizeObserver(place);
    for (const el of [anchor, dock, region]) {
      if (el) observer.observe(el);
    }
    view.addEventListener("resize", place);
    // Any scroll can move the editor or its region (the page around a scrolling pane
    // included), so re-place on every scroll in the document, not only the region's.
    doc.addEventListener("scroll", place, { capture: true, passive: true });
    // An ancestor's enter animation moves the editor without resizing anything.
    doc.addEventListener("animationend", place, true);
    doc.addEventListener("transitionend", place, true);
    onCleanup(() => {
      this.clearance = 0;
      observer.disconnect();
      view.removeEventListener("resize", place);
      doc.removeEventListener("scroll", place, { capture: true });
      doc.removeEventListener("animationend", place, true);
      doc.removeEventListener("transitionend", place, true);
    });
  });
}

function scrollRegion(el: HTMLElement): HTMLElement | null {
  for (let node = el.parentElement; node; node = node.parentElement) {
    const overflow = getComputedStyle(node).overflowY;
    if (overflow === "auto" || overflow === "scroll") {
      return node;
    }
  }
  return null;
}
