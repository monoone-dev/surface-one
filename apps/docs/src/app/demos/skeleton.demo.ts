import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneSkeletonDirective } from "@surface-one/angular/skeleton";

const TEMPLATE = `<div class="demo-stack" role="status" aria-label="Loading profile">
  <div class="demo-row" style="gap: var(--space-4)">
    <div soneSkeleton style="width: 48px; height: 48px; border-radius: var(--radius-pill)"></div>
    <div style="display: grid; gap: var(--space-2)">
      <div soneSkeleton style="width: 220px; height: 16px"></div>
      <div soneSkeleton style="width: 160px; height: 16px"></div>
    </div>
  </div>
  <div style="display: grid; gap: var(--space-2); max-width: 22rem">
    <div soneSkeleton style="height: 120px"></div>
    <div soneSkeleton style="width: 80%; height: 14px"></div>
    <div soneSkeleton style="width: 60%; height: 14px"></div>
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-skeleton-demo",
  imports: [SoneSkeletonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SkeletonDemo {}
