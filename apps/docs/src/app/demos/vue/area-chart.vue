<script setup lang="ts">
import { SoneAreaChart, type SoneLineChartSeries } from "@surface-one/vue";

const visitors = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const series: SoneLineChartSeries[] = [
  { key: "mobile", label: "Mobile", tone: "chart-2" },
  { key: "desktop", label: "Desktop", tone: "chart-1" },
];
</script>

<template>
  <div class="demo-stack" style="padding-top: var(--space-4)">
    <SoneAreaChart
      :data="visitors"
      :series="series"
      x-key="month"
      curve="smooth"
      stacked
      aria-label="Visitors, January to June 2026"
      category-header="Month"
    />
  </div>
</template>
