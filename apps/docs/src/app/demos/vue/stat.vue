<script setup lang="ts">
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
