<script setup lang="ts">
import { SoneSpeakerChip } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneSpeakerChip speaker="me" />
      <SoneSpeakerChip speaker="others" />
      <SoneSpeakerChip speaker="others-0" />
      <SoneSpeakerChip speaker="others-1" />
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneSpeakerChip speaker="others-0" label="Ada Park" />
      <SoneSpeakerChip speaker="me" size="sm" />
      <SoneSpeakerChip speaker="speaker-3" size="sm" />
    </div>
  </div>
</template>
