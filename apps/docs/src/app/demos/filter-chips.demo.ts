import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  type FilterChipOption,
  SoneFilterChipsComponent,
} from "@surface-one/angular/filter-chips";

const TEMPLATE = `<div class="demo-stack">
  <sone-filter-chips [options]="levels" [(value)]="level" ariaLabel="Filter by level" />
  <sone-filter-chips variant="tabs" [options]="views" [(value)]="view" ariaLabel="Reminder views" />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import { SoneFilterChips, type FilterChipOption } from "@surface-one/vue";

const level = ref("all");
const view = ref("inbox");
const levels: FilterChipOption[] = [
  { value: "all", label: "All", count: 128 },
  { value: "error", label: "Errors", count: 3, tone: "danger" },
  { value: "warn", label: "Warnings", count: 11, tone: "warning" },
];
const views: FilterChipOption[] = [
  { value: "inbox", label: "Inbox", count: 4 },
  { value: "upcoming", label: "Upcoming" },
  { value: "done", label: "Done" },
];
</script>

<template>
  <div class="demo-stack">
    <SoneFilterChips v-model="level" :options="levels" aria-label="Filter by level" />
    <SoneFilterChips v-model="view" variant="tabs" :options="views" aria-label="Reminder views" />
  </div>
</template>
`;

@Component({
  selector: "docs-filter-chips-demo",
  imports: [SoneFilterChipsComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class FilterChipsDemo {
  readonly level = signal("all");
  readonly view = signal("inbox");
  readonly levels: readonly FilterChipOption[] = [
    { value: "all", label: "All", count: 128 },
    { value: "error", label: "Errors", count: 3, tone: "danger" },
    { value: "warn", label: "Warnings", count: 11, tone: "warning" },
  ];
  readonly views: readonly FilterChipOption[] = [
    { value: "inbox", label: "Inbox", count: 4 },
    { value: "upcoming", label: "Upcoming" },
    { value: "done", label: "Done" },
  ];
}
