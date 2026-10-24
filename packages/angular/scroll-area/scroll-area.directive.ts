import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  effect,
  inject,
  input,
} from "@angular/core";

import {
  createScrollArea,
  type ScrollArea,
  type ScrollAreaOrientation,
} from "./scroll-area-controller";

/**
 * `[soneScrollArea]` — a scroll container with thin, token-coloured scrollbars (shadcn/ui
 * ScrollArea, spartan/ui Scroll Area) that keeps the browser's own scrolling: no
 * scrollbar is emulated. Give it a height (or a width for `horizontal`); `orientation`
 * picks the axes that scroll (`vertical`, `horizontal` or `both`). While its content
 * overflows it is a keyboard stop (`tabindex="0"`, unless you set one) so the arrow keys
 * scroll it, and a named one (`aria-label`) is a `region`. `fade` softens the edges
 * where content is hidden (it masks the whole box, so draw a border on a wrapper).
 */
@Directive({
  selector: "[soneScrollArea]",
  exportAs: "soneScrollArea",
  host: {
    class: "scroll-area",
    "data-slot": "scroll-area",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-fade]": "fade() ? '' : null",
  },
})
export class SoneScrollAreaDirective {
  readonly orientation = input<ScrollAreaOrientation>("vertical");
  /** Fade the content out at the edges where more of it is hidden. */
  readonly fade = input(false, { transform: booleanAttribute });

  /** The scroll container. */
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private area: ScrollArea | null = null;

  constructor() {
    const injector = inject(Injector);
    afterNextRender(
      () => (this.area = createScrollArea(this.element, this.orientation)),
    );
    effect(() => {
      this.orientation();
      afterNextRender(() => this.area?.update(), { injector });
    });
    inject(DestroyRef).onDestroy(() => this.area?.disconnect());
  }
}
