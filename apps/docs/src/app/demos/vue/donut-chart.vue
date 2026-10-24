<script setup lang="ts">
import { SoneDonutChart, type SoneDonutChartSegment } from "@surface-one/vue";

const browsers: SoneDonutChartSegment[] = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 187 },
  { key: "edge", label: "Edge", value: 173 },
  { key: "other", label: "Other", value: 90 },
];
</script>

<template>
  <div class="demo-stack" style="align-items: center">
    <SoneDonutChart
      :segments="browsers"
      label="Visitors"
      aria-label="Visitors by browser, January to June 2026"
      category-header="Browser"
      value-header="Visitors"
    />
  </div>
</template>
