<script setup lang="ts">
import { ref } from "vue";
import { SoneCalendar, type SoneCalendarValue } from "@surface-one/vue";

const date = ref<SoneCalendarValue>("2026-06-12");
const stay = ref<SoneCalendarValue>({ start: "2026-06-08", end: "2026-06-12" });
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; flex-wrap: wrap">
    <SoneCalendar v-model="date" aria-label="Delivery date" />
    <SoneCalendar mode="range" v-model="stay" :week-starts-on="1" aria-label="Stay" />
  </div>
</template>
