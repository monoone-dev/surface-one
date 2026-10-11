<script setup lang="ts">
import { SoneLogo } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: flex-end">
      <SoneLogo size="xs" />
      <SoneLogo size="sm" />
      <SoneLogo />
      <SoneLogo size="lg" label="SurfaceOne" />
    </div>
    <div class="demo-row" style="align-items: center">
      <!-- kind="mark": the bare mark without the app tile -->
      <SoneLogo kind="mark" size="sm" />
      <SoneLogo kind="mark" />
    </div>
  </div>
</template>
