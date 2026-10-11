<script setup lang="ts">
import { SoneAvatar, SoneAvatarFallback } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneAvatar size="sm"><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar>
      <SoneAvatar><SoneAvatarFallback>SL</SoneAvatarFallback></SoneAvatar>
      <SoneAvatar size="lg"><SoneAvatarFallback>KM</SoneAvatarFallback></SoneAvatar>
      <!-- No image and no fallback: the signed-out person glyph -->
      <SoneAvatar />
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneAvatar><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar>
      <div>
        <div>Ada Park</div>
        <div style="color: var(--text-secondary); font-size: var(--font-size-sm)">Product design</div>
      </div>
    </div>
  </div>
</template>
