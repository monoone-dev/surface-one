import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: center">
    <span soneBadge>Default</span>
    <span soneBadge variant="secondary">Secondary</span>
    <span soneBadge variant="outline">Outline</span>
    <span soneBadge variant="ghost">Ghost</span>
    <span soneBadge variant="destructive">Destructive</span>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="live"><span class="badge-dot"></span>Recording</span>
    <span soneBadge variant="accent"><span class="badge-dot"></span>Transcribed</span>
    <span soneBadge variant="success"><span class="badge-dot"></span>Exported</span>
    <span soneBadge variant="warning"><span class="badge-dot"></span>Paused</span>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="secondary">3</span>
    <span soneBadge variant="destructive">99+</span>
    <button soneBadge variant="outline" type="button">Filter: Design</button>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-badge-demo",
  imports: [SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BadgeDemo {}
