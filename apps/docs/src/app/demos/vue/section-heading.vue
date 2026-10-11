<script setup lang="ts">
import { SoneButton, SoneSectionHeading } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 36rem">
    <SoneSectionHeading title="Meetings" :count="24">
      <template #actions>
        <SoneButton variant="outline" size="sm" type="button">New meeting</SoneButton>
      </template>
    </SoneSectionHeading>
    <SoneSectionHeading title="Pinned" :level="3" :count="3" />
  </div>
</template>
