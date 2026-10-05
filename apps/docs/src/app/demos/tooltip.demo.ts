import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <button soneBtn variant="ghost" size="icon" type="button" aria-label="New note" soneTooltip="New note (⌘N)">
      <sone-icon icon="note-add" />
    </button>
    <button soneBtn variant="ghost" size="icon" type="button" aria-label="Search" soneTooltip="Search">
      <sone-icon icon="search" />
    </button>
    <button soneBtn variant="ghost" size="icon" type="button" aria-label="Move to trash" soneTooltip="Move to trash">
      <sone-icon icon="trash" />
    </button>
  </div>
  <div class="demo-row">
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens above" soneTooltipSide="top">Top</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens to the right" soneTooltipSide="right">Right</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens below (default)">Bottom</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens to the left" soneTooltipSide="left">Left</button>
    <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Shown instantly, no arrow"
      [soneTooltipShowDelay]="0" [soneTooltipArrow]="false">No delay</button>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-tooltip-demo",
  imports: [SoneButtonDirective, SoneIconComponent, SoneTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TooltipDemo {}
