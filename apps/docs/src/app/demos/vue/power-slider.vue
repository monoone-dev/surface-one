<script setup lang="ts">
import { ref } from "vue";
import { SonePowerSlider, type PowerRung } from "@surface-one/vue";

const rungs: readonly PowerRung[] = [
  { id: "battery", name: "Battery saver" },
  { id: "balanced", name: "Balanced" },
  { id: "sharp", name: "Sharp" },
  { id: "max", name: "Maximum" },
];
const power = ref("balanced");
</script>

<template>
  <div class="demo-stack" style="max-width: 26rem">
    <div style="display: grid; gap: var(--space-2)">
      <SonePowerSlider v-model="power" :rungs="rungs" aria-label="Processing power" />
      <span style="color: var(--text-secondary)">Committed: {{ power }}</span>
    </div>
    <SonePowerSlider :rungs="rungs" model-value="battery" disabled aria-label="Processing power (locked)" />
  </div>
</template>
