<script setup lang="ts">
import {
  SoneMarker,
  SoneMarkerContent,
  SoneMarkerIcon,
  SoneSpinner,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 480px; width: 100%">
    <SoneMarker>
      <SoneMarkerIcon><SoneSpinner :size="16" :label="null" /></SoneMarkerIcon>
      <SoneMarkerContent class="shimmer">Thinking…</SoneMarkerContent>
    </SoneMarker>
    <SoneMarker>
      <SoneMarkerIcon>✓</SoneMarkerIcon>
      <SoneMarkerContent>Searched 4 meeting notes</SoneMarkerContent>
    </SoneMarker>
    <SoneMarker variant="separator">
      <SoneMarkerContent>Conversation compacted</SoneMarkerContent>
    </SoneMarker>
    <SoneMarker variant="border">
      <SoneMarkerContent>Earlier today</SoneMarkerContent>
    </SoneMarker>
  </div>
</template>
