<script setup lang="ts">
import { SoneBanner } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 34rem">
    <SoneBanner kind="info">The model download resumes when you’re back online.</SoneBanner>
    <SoneBanner kind="success">Exported to your notes folder.</SoneBanner>
    <SoneBanner kind="warning">
      <strong>Live captions stopped.</strong> Recording continues and the full transcript runs after Stop.
    </SoneBanner>
    <SoneBanner kind="danger">Couldn’t reach the server. Your transcript is safe.</SoneBanner>
  </div>
</template>
