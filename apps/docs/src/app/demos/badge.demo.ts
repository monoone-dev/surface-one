import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_BADGE_PARTS } from "@surface-one/angular/badge";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: center">
    <span soneBadge>Default</span>
    <span soneBadge variant="secondary">Secondary</span>
    <span soneBadge variant="outline">Outline</span>
    <span soneBadge variant="ghost">Ghost</span>
    <span soneBadge variant="destructive">Destructive</span>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="live" dot>Recording</span>
    <span soneBadge variant="accent" dot>Transcribed</span>
    <span soneBadge variant="success" dot>Exported</span>
    <span soneBadge variant="warning" dot>Paused</span>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="secondary">3</span>
    <span soneBadge variant="destructive">99+</span>
    <button soneBadge variant="outline" type="button">Filter: Design</button>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="secondary">
      design
      <button soneBadgeRemove aria-label="Remove design"><sone-icon icon="close" /></button>
    </span>
    <span soneBadge variant="accent">
      roadmap
      <button soneBadgeRemove aria-label="Remove roadmap"><sone-icon icon="close" /></button>
    </span>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-badge-demo",
  imports: [...SONE_BADGE_PARTS, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BadgeDemo {}
