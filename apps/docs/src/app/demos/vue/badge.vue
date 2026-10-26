<script setup lang="ts">
import { SoneBadge, SoneBadgeRemove, SoneIcon } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneBadge>Default</SoneBadge>
      <SoneBadge variant="secondary">Secondary</SoneBadge>
      <SoneBadge variant="outline">Outline</SoneBadge>
      <SoneBadge variant="ghost">Ghost</SoneBadge>
      <SoneBadge variant="destructive">Destructive</SoneBadge>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneBadge variant="live" dot>Recording</SoneBadge>
      <SoneBadge variant="accent" dot>Transcribed</SoneBadge>
      <SoneBadge variant="success" dot>Exported</SoneBadge>
      <SoneBadge variant="warning" dot>Paused</SoneBadge>
      <SoneBadge variant="info" dot>Syncing</SoneBadge>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneBadge variant="count">3</SoneBadge>
      <SoneBadge variant="count">128</SoneBadge>
      <SoneBadge variant="destructive">99+</SoneBadge>
      <SoneBadge as="button" variant="outline" type="button">Filter: Design</SoneBadge>
      <SoneBadge variant="dashed">Local only</SoneBadge>
      <SoneBadge variant="secondary" interactive>Interactive</SoneBadge>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneBadge variant="secondary">
        design
        <SoneBadgeRemove aria-label="Remove design"><SoneIcon icon="close" /></SoneBadgeRemove>
      </SoneBadge>
      <SoneBadge variant="accent">
        roadmap
        <SoneBadgeRemove aria-label="Remove roadmap"><SoneIcon icon="close" /></SoneBadgeRemove>
      </SoneBadge>
    </div>
  </div>
</template>
