import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneStatusDotComponent } from "@surface-one/angular/status-dot";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="gap: var(--space-4)">
    <sone-status-dot />
    <sone-status-dot tone="live" />
    <sone-status-dot tone="success" />
    <sone-status-dot tone="warning" />
    <sone-status-dot tone="destructive" />
    <sone-status-dot tone="accent" />
  </div>
  <div class="demo-row">
    <span class="demo-row" style="gap: var(--space-2)">
      <sone-status-dot tone="live" pulse /> Running
    </span>
    <span class="demo-row" style="gap: var(--space-2); color: var(--success-text)">
      <sone-status-dot tone="current" size="sm" /> Following
    </span>
    <span soneBadge variant="outline">
      <sone-status-dot tone="warning" size="sm" label="Needs you" /> 2
    </span>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-status-dot-demo",
  imports: [SoneStatusDotComponent, SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class StatusDotDemo {}
