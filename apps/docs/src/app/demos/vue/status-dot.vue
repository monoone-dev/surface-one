<script setup lang="ts">
import { SoneBadge, SoneStatusDot } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="gap: var(--space-4)">
      <SoneStatusDot />
      <SoneStatusDot tone="live" />
      <SoneStatusDot tone="success" />
      <SoneStatusDot tone="warning" />
      <SoneStatusDot tone="destructive" />
      <SoneStatusDot tone="accent" />
    </div>
    <div class="demo-row">
      <span class="demo-row" style="gap: var(--space-2)">
        <SoneStatusDot tone="live" pulse /> Running
      </span>
      <span class="demo-row" style="gap: var(--space-2); color: var(--success-text)">
        <SoneStatusDot tone="current" size="sm" /> Following
      </span>
      <SoneBadge variant="outline">
        <SoneStatusDot tone="warning" size="sm" label="Needs you" /> 2
      </SoneBadge>
    </div>
  </div>
</template>
