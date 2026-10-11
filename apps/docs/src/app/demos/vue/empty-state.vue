<script setup lang="ts">
import {
  SoneButton,
  SoneEmpty,
  SoneEmptyContent,
  SoneEmptyDescription,
  SoneEmptyHeader,
  SoneEmptyMedia,
  SoneEmptyTitle,
  SoneIcon,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
  <SoneEmpty>
    <SoneEmptyHeader>
      <SoneEmptyMedia variant="icon"><SoneIcon icon="meetings" /></SoneEmptyMedia>
      <SoneEmptyTitle>No meetings yet</SoneEmptyTitle>
      <SoneEmptyDescription>Record a meeting and it is transcribed right here, on this device.</SoneEmptyDescription>
    </SoneEmptyHeader>
    <SoneEmptyContent>
      <div class="demo-row">
        <SoneButton type="button">Start recording</SoneButton>
        <SoneButton variant="outline" type="button">Import audio</SoneButton>
      </div>
    </SoneEmptyContent>
  </SoneEmpty>

  <!-- Composed: icon / title / description / tone draw the header; the slot follows -->
  <SoneEmpty
    tone="locked"
    title="This folder is locked"
    description="Its notes and transcripts stay encrypted until you unlock it."
  >
    <SoneEmptyContent>
      <SoneButton type="button">Unlock</SoneButton>
      <p class="text-hint">Touch ID unlocks it for this session.</p>
    </SoneEmptyContent>
  </SoneEmpty>
  </div>
</template>
