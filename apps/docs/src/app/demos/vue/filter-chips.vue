<script setup lang="ts">
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
