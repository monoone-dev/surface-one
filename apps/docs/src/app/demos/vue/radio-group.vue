<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldLabel,
  SoneFieldLegend,
  SoneRadio,
  SoneRadioGroup,
} from "@surface-one/vue";

const density = ref<string | null>("comfortable");
</script>

<template>
  <SoneRadioGroup as="fieldset" v-model="density" style="max-width: 26rem">
    <SoneFieldLegend variant="label">Density</SoneFieldLegend>
    <SoneField orientation="horizontal">
      <SoneRadio id="demo-density-default" value="default" />
      <SoneFieldLabel for="demo-density-default">Default</SoneFieldLabel>
    </SoneField>
    <SoneField orientation="horizontal">
      <SoneRadio id="demo-density-comfortable" value="comfortable" />
      <SoneFieldLabel for="demo-density-comfortable">Comfortable</SoneFieldLabel>
    </SoneField>
    <SoneField orientation="horizontal">
      <SoneRadio id="demo-density-compact" value="compact" disabled />
      <SoneFieldLabel for="demo-density-compact">Compact (soon)</SoneFieldLabel>
    </SoneField>
    <SoneFieldDescription>Rows are {{ density }}.</SoneFieldDescription>
  </SoneRadioGroup>
</template>
