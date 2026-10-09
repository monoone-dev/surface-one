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

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import {
  SoneStat,
  SoneStatGroup,
  SoneStatHint,
  SoneStatLabel,
  SoneStatTrend,
  SoneStatValue,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 48rem">
    <SoneStatGroup>
      <SoneStat style="--i: 0">
        <SoneStatLabel>Meetings</SoneStatLabel>
        <SoneStatValue>128</SoneStatValue>
        <SoneStatHint>Since March</SoneStatHint>
      </SoneStat>
      <SoneStat style="--i: 1">
        <SoneStatLabel>Total time</SoneStatLabel>
        <SoneStatValue>41h 12m</SoneStatValue>
        <SoneStatHint>About 19 min each</SoneStatHint>
      </SoneStat>
      <SoneStat style="--i: 2">
        <SoneStatLabel>This week</SoneStatLabel>
        <SoneStatValue>9</SoneStatValue>
        <SoneStatTrend :delta="3">50%</SoneStatTrend>
      </SoneStat>
      <SoneStat style="--i: 3">
        <SoneStatLabel>Cloud calls</SoneStatLabel>
        <SoneStatValue>56</SoneStatValue>
        <!-- More cloud calls is bad news: force the tone -->
        <SoneStatTrend :delta="8" tone="negative">17%</SoneStatTrend>
      </SoneStat>
    </SoneStatGroup>

    <SoneStatGroup layout="inline" separated aria-label="Your stats">
      <SoneStat variant="plain" size="sm">
        <SoneStatLabel>Meetings</SoneStatLabel>
        <SoneStatValue>128</SoneStatValue>
      </SoneStat>
      <SoneStat variant="plain" size="sm">
        <SoneStatLabel>Total time</SoneStatLabel>
        <SoneStatValue>41h 12m</SoneStatValue>
      </SoneStat>
      <SoneStat variant="plain" size="sm">
        <SoneStatLabel>This week</SoneStatLabel>
        <SoneStatValue>9</SoneStatValue>
      </SoneStat>
    </SoneStatGroup>
  </div>
</template>
`;

@Component({
  selector: "docs-stat-demo",
  imports: [...SONE_STAT_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class StatDemo {}
