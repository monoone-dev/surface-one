<script setup lang="ts">
import { ref } from "vue";
import { SoneDatePicker, SoneField, SoneFieldLabel, type SoneCalendarValue } from "@surface-one/vue";

const due = ref<SoneCalendarValue>("2026-06-12");
const trip = ref<SoneCalendarValue>(null);
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; flex-wrap: wrap; min-height: 24rem">
    <SoneField style="width: 15rem">
      <SoneFieldLabel for="demo-due-date">Due date</SoneFieldLabel>
      <SoneDatePicker trigger-id="demo-due-date" v-model="due" />
    </SoneField>
    <SoneField style="width: 18rem">
      <SoneFieldLabel for="demo-trip">Trip</SoneFieldLabel>
      <SoneDatePicker trigger-id="demo-trip" mode="range" v-model="trip" :week-starts-on="1" placeholder="Pick the dates" />
    </SoneField>
  </div>
</template>
