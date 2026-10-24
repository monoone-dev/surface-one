import {
  Directive,
  ElementRef,
  effect,
  inject,
  input,
  booleanAttribute,
} from "@angular/core";

import { type FloatingDockTracker, trackFloatingDock } from "./floating-dock";

@Directive({
  selector: "[soneFloatingDock]",
})
export class SoneFloatingDockDirective {
  private readonly dock = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly soneFloatingDock = input(false, { transform: booleanAttribute });
  readonly floatingDockAnchor = input.required<HTMLElement>();

  private tracker: FloatingDockTracker | null = null;

  get clearance(): number {
    return this.tracker?.clearance ?? 0;
  }

  private readonly tracking = effect((onCleanup) => {
    const anchor = this.floatingDockAnchor();
    if (!this.soneFloatingDock()) {
      return;
    }
    const tracker = trackFloatingDock(this.dock.nativeElement, anchor);
    this.tracker = tracker;
    onCleanup(() => {
      tracker?.destroy();
      this.tracker = null;
    });
  });
}
