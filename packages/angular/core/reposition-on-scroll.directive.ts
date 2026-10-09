import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  inject,
  input,
  output,
} from "@angular/core";

import { listenForReposition } from "./focus-scope";

export type RepositionReason = "scroll" | "resize" | "motion";

@Directive({
  selector: "[soneRepositionOnScroll]",
})
export class SoneRepositionOnScrollDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly repositionAnchor = input<HTMLElement | null>(null);
  readonly reposition = output<RepositionReason>();

  constructor() {
    const win = inject(DOCUMENT).defaultView;
    if (!win || !isPlatformBrowser(inject(PLATFORM_ID))) {
      return;
    }
    const stop = listenForReposition(
      win,
      this.host.nativeElement,
      () => this.repositionAnchor(),
      (reason) => this.reposition.emit(reason),
    );
    inject(DestroyRef).onDestroy(stop);
  }
}
