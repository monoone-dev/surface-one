import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  signal,
} from "@angular/core";
import {
  SONE_TOOLTIP_SIDE,
  type TooltipSide,
} from "@surface-one/angular/tooltip";

import { SoneDockItemDirective } from "./dock-item.directive";
import {
  SONE_DOCK,
  type DockAlign,
  type DockPosition,
  type DockSize,
  type SoneDockContext,
} from "./dock.tokens";

/** Tooltips open towards the canvas, away from the edge the dock sits on. */
const TOOLTIP_SIDE: Record<DockPosition, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

/**
 * A toolbar of drawing tools docked to one edge of a canvas — `position` picks
 * the edge (top, bottom, left, right) and with it the direction: a row on top
 * or bottom, a column on the sides. `floating` (the default) pins it inside the
 * nearest positioned ancestor; without it the dock sits in the flow.
 *
 * A WAI-ARIA toolbar: one Tab stop, arrow keys along its direction, Home / End.
 */
@Component({
  selector: "sone-dock",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: "<ng-content />",
  host: {
    "data-slot": "dock",
    role: "toolbar",
    "[attr.aria-label]": "ariaLabel()",
    "[attr.aria-orientation]": "orientation()",
    "[attr.data-position]": "position()",
    "[attr.data-align]": "align()",
    "[attr.data-orientation]": "orientation()",
    "[attr.data-size]": "size()",
    "[attr.data-floating]": "floating() ? '' : null",
    "(keydown)": "onKeydown($event)",
  },
  providers: [
    {
      provide: SONE_DOCK,
      useExisting: forwardRef(() => SoneDockComponent),
    },
    {
      provide: SONE_TOOLTIP_SIDE,
      useFactory: () => {
        const dock: SoneDockComponent = inject(
          forwardRef(() => SoneDockComponent),
        );
        return () => TOOLTIP_SIDE[dock.position()];
      },
    },
  ],
})
export class SoneDockComponent implements SoneDockContext {
  /** The edge it docks to. */
  readonly position = input<DockPosition>("bottom");
  /** Where along that edge: centred, or at its start or end. */
  readonly align = input<DockAlign>("center");
  readonly size = input<DockSize>("default");
  /** Pin to the edge of the nearest positioned ancestor (`position: relative`). */
  readonly floating = input(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string>(
    $localize`:Toolbar of drawing tools:Tools`,
  );

  readonly orientation = computed(() =>
    this.position() === "left" || this.position() === "right"
      ? "vertical"
      : "horizontal",
  );

  private readonly items = contentChildren(SoneDockItemDirective, {
    descendants: true,
  });
  private readonly current = signal<SoneDockItemDirective | null>(null);

  /** The last focused tool, else the active one, else the first. */
  readonly tabStop = computed<SoneDockItemDirective | null>(() => {
    const enabled = this.items().filter((i) => !i.disabled());
    const current = this.current();
    if (current && enabled.includes(current)) return current;
    return enabled.find((i) => i.active()) ?? enabled[0] ?? null;
  });

  focused(item: unknown): void {
    if (item instanceof SoneDockItemDirective) this.current.set(item);
  }

  protected onKeydown(e: KeyboardEvent): void {
    const vertical = this.orientation() === "vertical";
    const rtl =
      !vertical &&
      (e.currentTarget as HTMLElement).closest("[dir]")?.getAttribute("dir") ===
        "rtl";
    const prev = vertical ? "ArrowUp" : rtl ? "ArrowRight" : "ArrowLeft";
    const next = vertical ? "ArrowDown" : rtl ? "ArrowLeft" : "ArrowRight";
    const enabled = this.items().filter((i) => !i.disabled());
    if (!enabled.length) return;
    const at = enabled.findIndex(
      (i) => i.el.nativeElement === (e.target as Element),
    );
    let to: number;
    if (e.key === prev) to = at <= 0 ? enabled.length - 1 : at - 1;
    else if (e.key === next) to = at === enabled.length - 1 ? 0 : at + 1;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = enabled.length - 1;
    else return;
    e.preventDefault();
    const item = enabled[to];
    this.current.set(item);
    item.el.nativeElement.focus();
  }
}
