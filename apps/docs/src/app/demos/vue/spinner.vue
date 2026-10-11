<script setup lang="ts">
import { SoneBadge, SoneButton, SoneSpinner } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="gap: var(--space-5); color: var(--text-secondary)">
      <SoneSpinner :size="12" />
      <SoneSpinner />
      <SoneSpinner :size="24" />
      <SoneSpinner :size="40" label="Loading results" />
    </div>
    <div class="demo-row">
      <SoneButton type="button" size="sm" disabled>
        <SoneSpinner :label="null" /> Saving…
      </SoneButton>
      <SoneButton type="button" variant="outline" size="sm" disabled>
        <SoneSpinner :label="null" /> Please wait
      </SoneButton>
      <SoneBadge variant="secondary"><SoneSpinner :size="12" :label="null" /> Syncing</SoneBadge>
    </div>
  </div>
</template>
