import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  inject,
  input,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SoneTooltipDirective,
  type TooltipSide,
} from "@surface-one/angular/tooltip";

import { SONE_FLOW } from "./flow.token";
import type { SoneFlowPanelPosition } from "./flow.types";

export interface SoneFlowControlsLabels {
  readonly group: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  readonly fit: string;
  readonly resetZoom: string;
  readonly lock: string;
}

const DEFAULT_LABELS: SoneFlowControlsLabels = {
  group: $localize`:Group of zoom buttons on a flow canvas:Canvas controls`,
  zoomIn: $localize`:Flow canvas button:Zoom in`,
  zoomOut: $localize`:Flow canvas button:Zoom out`,
  fit: $localize`:Flow canvas button that shows every node:Fit view`,
  resetZoom: $localize`:Flow canvas button that sets the zoom to 100%:Reset zoom`,
  lock: $localize`:Flow canvas toggle that stops editing:Lock canvas`,
};

/**
 * Zoom in, zoom out, fit view, the zoom level (a reset to 100%) and a lock toggle
 * for the `<sone-flow>` it sits in.
 */
@Component({
  selector: "sone-flow-controls",
  imports: [SoneButtonDirective, SoneIconComponent, SoneTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flow-panel",
    "data-slot": "flow-controls",
    role: "group",
    "[attr.aria-label]": "text().group",
    "[attr.data-position]": "position()",
    "[attr.data-orientation]": "orientation()",
  },
  template: `
    <button
      soneBtn
      variant="ghost"
      size="icon-sm"
      type="button"
      [attr.aria-label]="text().zoomIn"
      [soneTooltip]="text().zoomIn"
      [soneTooltipSide]="tooltipSide()"
      [disabled]="flow.zoom() >= flow.maxZoom()"
      (click)="flow.zoomIn()"
    >
      <sone-icon icon="zoom-in" />
    </button>
    <button
      soneBtn
      variant="ghost"
      size="icon-sm"
      type="button"
      [attr.aria-label]="text().zoomOut"
      [soneTooltip]="text().zoomOut"
      [soneTooltipSide]="tooltipSide()"
      [disabled]="flow.zoom() <= flow.minZoom()"
      (click)="flow.zoomOut()"
    >
      <sone-icon icon="zoom-out" />
    </button>
    @if (showZoom()) {
      <button
        soneBtn
        class="flow-controls-zoom"
        variant="ghost"
        size="sm"
        type="button"
        [attr.aria-label]="text().resetZoom + ', ' + percent()"
        [soneTooltip]="text().resetZoom"
        [soneTooltipSide]="tooltipSide()"
        (click)="flow.zoomTo(1)"
      >
        {{ percent() }}
      </button>
    }
    <button
      soneBtn
      variant="ghost"
      size="icon-sm"
      type="button"
      [attr.aria-label]="text().fit"
      [soneTooltip]="text().fit"
      [soneTooltipSide]="tooltipSide()"
      (click)="flow.fit()"
    >
      <sone-icon icon="fit" />
    </button>
    @if (showLock()) {
      <button
        soneBtn
        variant="ghost"
        size="icon-sm"
        type="button"
        [attr.aria-label]="text().lock"
        [attr.aria-pressed]="!flow.interactive()"
        [soneTooltip]="text().lock"
        [soneTooltipSide]="tooltipSide()"
        (click)="flow.interactive.set(!flow.interactive())"
      >
        <sone-icon [icon]="flow.interactive() ? 'unlock' : 'lock'" />
      </button>
    }
  `,
})
export class SoneFlowControlsComponent {
  protected readonly flow = inject(SONE_FLOW);

  readonly position = input<SoneFlowPanelPosition>("bottom-left");
  readonly orientation = input<"horizontal" | "vertical">("vertical");
  /** Show the zoom level as a button that resets it to 100%. */
  readonly showZoom = input(false, { transform: booleanAttribute });
  readonly showLock = input(true, { transform: booleanAttribute });
  readonly labels = input<Partial<SoneFlowControlsLabels>>({});

  protected readonly text = computed(() => ({
    ...DEFAULT_LABELS,
    ...this.labels(),
  }));
  protected readonly percent = computed(
    () => `${Math.round(this.flow.zoom() * 100)}%`,
  );
  /** Away from the edge the controls sit on. */
  protected readonly tooltipSide = computed<TooltipSide>(() => {
    if (this.orientation() === "horizontal")
      return this.position().startsWith("top") ? "bottom" : "top";
    return this.position().endsWith("right") ? "left" : "right";
  });
}
