import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SONE_HOVER_CARD_PARTS } from "@surface-one/angular/hover-card";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; min-height: 11rem">
  <p style="margin: 0">
    Notes taken by
    <a href="#ada-park" [soneHoverCardTrigger]="profile" [openDelay]="300">Ada Park</a>
    in the weekly sync.
  </p>
  <ng-template #profile>
    <div soneHoverCard>
      <div style="display: flex; gap: var(--space-3)">
        <sone-avatar><span soneAvatarFallback>AP</span></sone-avatar>
        <div style="display: flex; flex-direction: column; gap: var(--space-1)">
          <strong>Ada Park</strong>
          <span>Product design. Writes up every sync within the hour.</span>
          <span style="color: var(--text-secondary); font-size: var(--font-size-xs)">Joined March 2021</span>
        </div>
      </div>
    </div>
  </ng-template>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-hover-card-demo",
  imports: [...SONE_HOVER_CARD_PARTS, ...SONE_AVATAR_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class HoverCardDemo {}
