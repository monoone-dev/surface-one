import {
  DestroyRef,
  Directive,
  ElementRef,
  Injector,
  afterNextRender,
  inject,
  input,
} from "@angular/core";

import { SONE_FOCUS_SCOPE } from "./focus-scope";

/**
 * Moves the host element to `document.body` so a `position: fixed` overlay
 * always anchors to the viewport, not to an ancestor with `transform` /
 * `filter` / `backdrop-filter` / `perspective` / `will-change` / `contain`.
 *
 * With `teleportAnchor` set (the element that opened it), a dialog or sheet the
 * host was declared inside keeps treating it as its own content: its focusable
 * elements join the dialog's Tab cycle right after the anchor (`SONE_FOCUS_SCOPE`).
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
  private readonly scope = inject(SONE_FOCUS_SCOPE, { optional: true });

  /** The element that opened this overlay; joins it to the enclosing dialog's focus scope. */
  readonly teleportAnchor = input<HTMLElement | null>(null);

  private teleported = false;
  private unregister: (() => void) | null = null;

  constructor() {
    afterNextRender(
      () => {
        const node = this.el.nativeElement;
        if (node.parentNode) {
          node.ownerDocument.body.appendChild(node);
          this.teleported = true;
          const anchor = this.teleportAnchor();
          if (anchor && this.scope) {
            this.unregister = this.scope.registerPortal(anchor, node);
          }
        }
      },
      { injector: this.injector },
    );

    this.destroyRef.onDestroy(() => {
      this.unregister?.();
      // Detach only — never re-insert (see the class doc).
      if (this.teleported) {
        this.el.nativeElement.remove();
      }
    });
  }
}
