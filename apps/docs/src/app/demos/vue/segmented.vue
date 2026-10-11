<script setup lang="ts">
import { ref } from "vue";
import { SoneSegmented, type SegmentOption } from "@surface-one/vue";

const themes: SegmentOption[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "display" },
];
const themesIconOnly = themes.map((o) => ({ ...o, iconOnly: true }));
const ranges: SegmentOption[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time", disabled: true },
];
const theme = ref("system");
const range = ref("30d");
</script>

<template>
  <div class="demo-stack" style="justify-items: start">
    <SoneSegmented v-model="theme" :options="themes" aria-label="Theme" />
    <SoneSegmented v-model="range" :options="ranges" variant="default" size="sm" aria-label="Date range" />
    <SoneSegmented v-model="theme" :options="themesIconOnly" aria-label="Theme (compact)" />
    <span style="color: var(--text-secondary)">Theme: {{ theme }} · Range: {{ range }}</span>
  </div>
</template>
