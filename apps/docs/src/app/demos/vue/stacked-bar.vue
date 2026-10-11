<script setup lang="ts">
import { SoneStackedBar } from "@surface-one/vue";

const GB = 1024 ** 3;
const limit = 20 * GB;
const storage = [
  { key: "playback", label: "Playback", value: 4.2 * GB },
  { key: "masters", label: "Masters", value: 2.8 * GB },
  { key: "locked", label: "Locked", value: 0.6 * GB },
];
const health = [
  { key: "ok", label: "Working", value: 9, tone: "success" },
  { key: "attention", label: "Need attention", value: 2, tone: "warning" },
  { key: "optional", label: "Optional", value: 3, tone: "chart-seq-1" },
];
const gigabytes = (v: number) => `${(v / GB).toFixed(1)} GB`;
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem">
    <SoneStackedBar
      aria-label="Recording storage"
      :segments="storage"
      :max="limit"
      :value-label="gigabytes"
      show-legend
    />
    <SoneStackedBar
      size="sm"
      aria-label="Health checks"
      :segments="health"
      show-legend
    />
  </div>
</template>
