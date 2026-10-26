<script setup lang="ts">
import { MARK_TONES, SoneMark } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div style="display: flex; flex-wrap: wrap; gap: var(--space-3)">
      <SoneMark v-for="tone in MARK_TONES" :key="tone" :tone="tone" icon="sparkles" :label="tone" />
    </div>
    <div style="display: flex; align-items: center; gap: var(--space-3)">
      <SoneMark size="sm" icon="code" tone="iris" />
      <SoneMark icon="code" tone="iris" />
      <SoneMark size="lg" icon="code" tone="iris" />
      <SoneMark :size="56" icon="code" tone="iris" label="Code" />
    </div>
  </div>
</template>
