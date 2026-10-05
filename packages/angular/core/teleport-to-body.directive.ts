import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
} from "@angular/core";

/**
 * Moves the host element to `document.body` so a `position: fixed` overlay
 * always anchors to the viewport, not to an ancestor with `transform` /
 * `filter` / `backdrop-filter` / `perspective` / `will-change` / `contain`.
 *
 * TEARDOWN: when the host `@if` flips false, Angular removes the view's DOM
 * nodes via their CURRENT parent (`document.body`) before destroy hooks run —
 * the node is already gone by the time `onDestroy` fires. Never move it back
 * to its original slot; that would resurrect an already-removed overlay.
 */
@Directive({
  selector: "[soneTeleportToBody]",
})
export class SoneTeleportToBodyDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  private teleported = false;

  constructor() {
    afterNextRender(
      () => {
        const node = this.el.nativeElement;
        if (node.parentNode) {
          document.body.appendChild(node);
          this.teleported = true;
        }
      },
      { injector: this.injector },
    );

    this.destroyRef.onDestroy(() => {
      // Detach only — never re-insert (see the class doc).
      if (this.teleported) {
        this.el.nativeElement.remove();
      }
    });
  }
}
