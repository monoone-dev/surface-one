<script setup lang="ts">
import { ref } from "vue";
import { SoneChartLegend, SoneSwatch } from "@surface-one/vue";

const kinds = [
  { key: "meeting", label: "Meetings", tone: "graph-meeting", value: 128 },
  { key: "note", label: "Notes", tone: "graph-note", value: 342 },
  { key: "document", label: "Documents", tone: "graph-document", value: 37 },
  { key: "person", label: "People", tone: "graph-person", value: 1204 },
];
const storage = [
  { key: "playback", label: "Playback", value: "4.2 GB" },
  { key: "masters", label: "Masters", value: "2.8 GB" },
  { key: "locked", label: "Locked", value: "640 MB" },
];
const hidden = ref<readonly string[]>([]);
</script>

<template>
  <div class="demo-stack" style="max-width: 32rem">
    <SoneChartLegend
      v-model:hidden="hidden"
      :items="kinds"
      toggleable
      aria-label="Node kinds"
    />
    <SoneChartLegend :items="storage" orientation="column" shape="square" />
    <div class="demo-row" style="font-size: var(--font-size-sm)">
      <SoneSwatch tone="chart-1" /> Me
      <SoneSwatch tone="chart-2" /> Others
      <SoneSwatch tone="chart-4" shape="line" /> Trend
    </div>
  </div>
</template>
