<script setup lang="ts">
import { SoneMeter } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 22rem; gap: var(--space-2)">
    <SoneMeter label="Accuracy" :value="4" :max="4" detail="Best available" />
    <SoneMeter label="Speed" :value="2" :max="4" />
    <SoneMeter label="Battery use" :value="1" :max="4" detail="Light" />
    <SoneMeter label="Storage" :value="3" :max="5" detail="About 2 GB" />
  </div>
</template>
