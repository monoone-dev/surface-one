/* Styles are global (styles.css): the overlay portals to <body> and its
   parts are projected from the caller, so emulated encapsulation cannot reach them. */
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  model,
  viewChild,
} from "@angular/core";

import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_FOCUS_SCOPE,
  SONE_OVERLAY,
  SoneOverlayBase,
  SoneTeleportToBodyDirective,
} from "@surface-one/angular/core";
import { SoneIconComponent } from "@surface-one/angular/icon";

import { createDrawerSwipe, type DrawerSide } from "./drawer-swipe";

/**
 * `sone-drawer` — a sheet you can swipe away (shadcn/ui Drawer on Vaul, spartan/ui
 * Sheet): a modal panel from the `bottom` (or another `side`) with a drag handle. It is
 * the sheet's overlay — focus moves in and is trapped, Escape and the scrim dismiss it,
 * focus returns to the opener, `[(open)]` or `@if` + `(dismiss)` show it — plus a pointer
 * swipe toward its edge that dismisses it past a quarter of its size or on a flick.
 * `snapPoints` (visible fractions of the drawer, ascending, e.g. `[0.5, 1]`) let it rest
 * part-open, two-way as `[(activeSnapPoint)]`; the handle cycles them and keyboard focus
 * inside opens it fully. Under reduced motion it moves without animating. Use the
 * `soneDrawerHeader` / `soneDrawerTitle` / `soneDrawerDescription` / `soneDrawerFooter`
 * / `soneDrawerClose` parts (`SONE_DIALOG_PARTS`).
 */
@Component({
  selector: "sone-drawer",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SoneButtonDirective, SoneIconComponent],
  hostDirectives: [SoneTeleportToBodyDirective],
  providers: [
    {
      provide: SONE_OVERLAY,
      useExisting: forwardRef(() => SoneDrawerComponent),
    },
    {
      provide: SONE_FOCUS_SCOPE,
      useExisting: forwardRef(() => SoneDrawerComponent),
    },
  ],
  host: {
    class: "sheet-overlay drawer-overlay",
    "data-slot": "drawer-overlay",
    "(click)": "onLayerClick($event)",
  },
  templateUrl: "./drawer.component.html",
})
export class SoneDrawerComponent extends SoneOverlayBase {
  readonly side = input<DrawerSide>("bottom");
  readonly scrimCloses = input(true, { transform: booleanAttribute });
  /** The corner close button (off: a drawer closes by swipe, Escape, the scrim or a `soneDrawerClose`). */
  override readonly showClose = input(false, { transform: booleanAttribute });
  /** The drag handle at the inner edge (shown for `bottom` and `top`). */
  readonly handle = input(true, { transform: booleanAttribute });
  /** Visible fractions it rests at, ascending (e.g. `[0.5, 1]`); empty: open or dismissed. */
  readonly snapPoints = input<readonly number[]>([]);
  /** The snap point it rests at, two-way: `[(activeSnapPoint)]` (default: the first). */
  readonly activeSnapPoint = model<number | null>(null);

  protected readonly closeOnScrim = (): boolean => this.scrimCloses();
  protected readonly showHandle = computed(
    () => this.handle() && (this.side() === "bottom" || this.side() === "top"),
  );
  private readonly panelRef = viewChild<ElementRef<HTMLElement>>("panel");

  protected readonly swipe = createDrawerSwipe({
    side: () => this.side(),
    snapPoints: () => this.snapPoints(),
    activeSnapPoint: () =>
      this.activeSnapPoint() ?? this.snapPoints()[0] ?? null,
    setActiveSnapPoint: (snap) => this.activeSnapPoint.set(snap),
    dismiss: () => this.requestClose(),
    dismissible: () => this.dismissible(),
  });

  constructor() {
    super();
    const injector = inject(Injector);
    effect(() => {
      this.activeSnapPoint();
      this.snapPoints();
      this.side();
      const panel = this.panelRef()?.nativeElement ?? null;
      afterNextRender(() => this.swipe.place(panel), { injector });
    });
  }
}
