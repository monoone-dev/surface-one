import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneChartLegendComponent,
  SoneSwatchDirective,
} from "@surface-one/angular/chart-legend";

const TEMPLATE = `<div class="demo-stack" style="max-width: 32rem">
  <sone-chart-legend
    [items]="kinds"
    toggleable
    [(hidden)]="hidden"
    ariaLabel="Node kinds"
  />
  <sone-chart-legend [items]="storage" orientation="column" shape="square" />
  <div class="demo-row" style="font-size: var(--font-size-sm)">
    <span soneSwatch tone="chart-1"></span> Me
    <span soneSwatch tone="chart-2"></span> Others
    <span soneSwatch tone="chart-4" shape="line"></span> Trend
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
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
`;

@Component({
  selector: "docs-chart-legend-demo",
  imports: [SoneChartLegendComponent, SoneSwatchDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ChartLegendDemo {
  readonly kinds = [
    { key: "meeting", label: "Meetings", tone: "graph-meeting", value: 128 },
    { key: "note", label: "Notes", tone: "graph-note", value: 342 },
    { key: "document", label: "Documents", tone: "graph-document", value: 37 },
    { key: "person", label: "People", tone: "graph-person", value: 1204 },
  ];
  readonly storage = [
    { key: "playback", label: "Playback", value: "4.2 GB" },
    { key: "masters", label: "Masters", value: "2.8 GB" },
    { key: "locked", label: "Locked", value: "640 MB" },
  ];
  readonly hidden = signal<readonly string[]>([]);
}
