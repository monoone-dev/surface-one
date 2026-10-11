<script setup lang="ts">
import { computed, ref } from "vue";
import { SoneButton, SoneProgress } from "@surface-one/vue";

const value = ref(40);
const done = computed(() => value.value >= 100);
const step = (delta: number) => {
  value.value = Math.min(100, Math.max(0, value.value + delta));
};
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <div class="demo-stack" style="gap: var(--space-2)">
      <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm)">
        <span>Downloading model</span>
        <span style="color: var(--text-secondary)">{{ value }}%</span>
      </div>
      <SoneProgress :value="value" aria-label="Model download" />
    </div>
    <div class="demo-row">
      <SoneButton variant="outline" size="sm" type="button" :disabled="value === 0" @click="step(-20)">−20%</SoneButton>
      <SoneButton variant="outline" size="sm" type="button" :disabled="done" @click="step(20)">+20%</SoneButton>
    </div>
    <SoneProgress size="md" tone="warning" :value="80" aria-label="Storage, nearing the limit" />
    <SoneProgress size="md" tone="destructive" :value="97" aria-label="Storage, over the limit" />
    <!-- No value: indeterminate, busy for an unknown amount of time -->
    <SoneProgress aria-label="Re-indexing notes" />
  </div>
</template>
