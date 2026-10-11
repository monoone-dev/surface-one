<script setup lang="ts">
import { SoneButton, SoneIcon } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: flex-end">
      <SoneIcon icon="sparkles" size="xs" />
      <SoneIcon icon="sparkles" size="sm" />
      <SoneIcon icon="sparkles" size="base" />
      <SoneIcon icon="sparkles" size="lg" />
      <SoneIcon icon="sparkles" size="xl" />
    </div>
    <div class="demo-row" style="align-items: center">
      <!-- Icons draw in currentColor; give a label only when the icon carries the meaning alone -->
      <span style="color: var(--text-secondary)"><SoneIcon icon="lock" label="Locked" /></span>
      <span style="color: var(--danger)"><SoneIcon icon="alert-circle" label="Error" /></span>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneButton variant="outline" type="button"><SoneIcon icon="plus" inline="start" /> New note</SoneButton>
      <SoneButton variant="outline" type="button">Next <SoneIcon icon="chevron-right" inline="end" /></SoneButton>
      <SoneButton variant="ghost" size="icon" type="button" aria-label="Search"><SoneIcon icon="search" /></SoneButton>
    </div>
  </div>
</template>
