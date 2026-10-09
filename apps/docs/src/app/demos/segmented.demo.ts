import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";

const TEMPLATE = `<div class="demo-stack" style="justify-items: start">
  <sone-segmented [options]="themes" [(value)]="theme" ariaLabel="Theme" />
  <sone-segmented [options]="ranges" [(value)]="range" variant="default" size="sm" ariaLabel="Date range" />
  <sone-segmented [options]="themesIconOnly" [(value)]="theme" ariaLabel="Theme (compact)" />
  <span style="color: var(--text-secondary)">Theme: {{ theme() }} · Range: {{ range() }}</span>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
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
`;

@Component({
  selector: "docs-segmented-demo",
  imports: [SoneSegmentedComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SegmentedDemo {
  readonly themes: readonly SegmentOption[] = [
    { value: "light", label: "Light", icon: "sun" },
    { value: "dark", label: "Dark", icon: "moon" },
    { value: "system", label: "System", icon: "display" },
  ];
  readonly themesIconOnly = this.themes.map((o) => ({ ...o, iconOnly: true }));
  readonly ranges: readonly SegmentOption[] = [
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "90d", label: "90 days" },
    { value: "all", label: "All time", disabled: true },
  ];
  readonly theme = signal("system");
  readonly range = signal("30d");
}
