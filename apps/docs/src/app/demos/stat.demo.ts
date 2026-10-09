import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_STAT_PARTS } from "@surface-one/angular/stat";

const TEMPLATE = `<div class="demo-stack" style="max-width: 48rem">
  <dl soneStatGroup>
    <div soneStat style="--i: 0">
      <dt soneStatLabel>Meetings</dt>
      <dd soneStatValue>128</dd>
      <dd soneStatHint>Since March</dd>
    </div>
    <div soneStat style="--i: 1">
      <dt soneStatLabel>Total time</dt>
      <dd soneStatValue>41h 12m</dd>
      <dd soneStatHint>About 19 min each</dd>
    </div>
    <div soneStat style="--i: 2">
      <dt soneStatLabel>This week</dt>
      <dd soneStatValue>9</dd>
      <dd soneStatTrend [delta]="3">50%</dd>
    </div>
    <div soneStat style="--i: 3">
      <dt soneStatLabel>Cloud calls</dt>
      <dd soneStatValue>56</dd>
      <!-- More cloud calls is bad news: force the tone -->
      <dd soneStatTrend [delta]="8" tone="negative">17%</dd>
    </div>
  </dl>

  <dl soneStatGroup layout="inline" separated aria-label="Your stats">
    <div soneStat variant="plain" size="sm">
      <dt soneStatLabel>Meetings</dt>
      <dd soneStatValue>128</dd>
    </div>
    <div soneStat variant="plain" size="sm">
      <dt soneStatLabel>Total time</dt>
      <dd soneStatValue>41h 12m</dd>
    </div>
    <div soneStat variant="plain" size="sm">
      <dt soneStatLabel>This week</dt>
      <dd soneStatValue>9</dd>
    </div>
  </dl>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-stat-demo",
  imports: [...SONE_STAT_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class StatDemo {}
