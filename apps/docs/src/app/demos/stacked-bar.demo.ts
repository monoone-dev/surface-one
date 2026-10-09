import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneStackedBarComponent } from "@surface-one/angular/stacked-bar";

const TEMPLATE = `<div class="demo-stack" style="max-width: 28rem">
  <sone-stacked-bar
    ariaLabel="Recording storage"
    [segments]="storage"
    [max]="limit"
    [valueLabel]="gigabytes"
    showLegend
  />
  <sone-stacked-bar
    size="sm"
    ariaLabel="Health checks"
    [segments]="health"
    showLegend
  />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
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
const gigabytes = (v: number) => \`\${(v / GB).toFixed(1)} GB\`;
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
`;

const GB = 1024 ** 3;

@Component({
  selector: "docs-stacked-bar-demo",
  imports: [SoneStackedBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class StackedBarDemo {
  readonly limit = 20 * GB;
  readonly storage = [
    { key: "playback", label: "Playback", value: 4.2 * GB },
    { key: "masters", label: "Masters", value: 2.8 * GB },
    { key: "locked", label: "Locked", value: 0.6 * GB },
  ];
  readonly health = [
    { key: "ok", label: "Working", value: 9, tone: "success" },
    { key: "attention", label: "Need attention", value: 2, tone: "warning" },
    { key: "optional", label: "Optional", value: 3, tone: "chart-seq-1" },
  ];
  readonly gigabytes = (v: number) => `${(v / GB).toFixed(1)} GB`;
}
