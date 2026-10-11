<script setup lang="ts">
import { ref } from "vue";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneInputNumber } from "@surface-one/vue";

const qty = ref<number | null>(2);
const weight = ref<number | null>(1.5);
</script>

<template>
  <div class="demo-stack" style="max-width: 20rem">
    <SoneField>
      <SoneFieldLabel for="demo-qty">Quantity</SoneFieldLabel>
      <SoneInputNumber v-model="qty" input-id="demo-qty" :min="1" :max="10" />
      <SoneFieldDescription>{{ qty }} × €24.00 = €{{ ((qty ?? 0) * 24).toFixed(2) }}</SoneFieldDescription>
    </SoneField>
    <SoneField>
      <SoneFieldLabel for="demo-weight">Weight (kg)</SoneFieldLabel>
      <SoneInputNumber v-model="weight" input-id="demo-weight" size="sm" :min="0" :step="0.5" />
    </SoneField>
  </div>
</template>
