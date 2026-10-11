<script setup lang="ts">
import { SoneSkeleton } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" role="status" aria-label="Loading profile">
    <div class="demo-row" style="gap: var(--space-4)">
      <SoneSkeleton style="width: 48px; height: 48px; border-radius: var(--radius-pill)" />
      <div style="display: grid; gap: var(--space-2)">
        <SoneSkeleton style="width: 220px; height: 16px" />
        <SoneSkeleton style="width: 160px; height: 16px" />
      </div>
    </div>
    <div style="display: grid; gap: var(--space-2); max-width: 22rem">
      <SoneSkeleton style="height: 120px" />
      <SoneSkeleton style="width: 80%; height: 14px" />
      <SoneSkeleton style="width: 60%; height: 14px" />
    </div>
  </div>
</template>
