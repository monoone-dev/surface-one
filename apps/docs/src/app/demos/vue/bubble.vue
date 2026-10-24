<script setup lang="ts">
import {
  SoneBubble,
  SoneBubbleContent,
  SoneBubbleGroup,
  type BubbleVariant,
} from "@surface-one/vue";

const variants: readonly BubbleVariant[] = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
];
</script>

<template>
  <div class="demo-stack" style="max-width: 480px; width: 100%">
    <SoneBubbleGroup>
      <SoneBubble v-for="variant in variants" :key="variant" :variant="variant">
        <SoneBubbleContent>{{ variant }} — the agenda is in the shared doc.</SoneBubbleContent>
      </SoneBubble>
    </SoneBubbleGroup>
    <SoneBubble align="end">
      <SoneBubbleContent>Aligned to the end, for the current user.</SoneBubbleContent>
    </SoneBubble>
  </div>
</template>
