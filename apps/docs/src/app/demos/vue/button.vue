<script setup lang="ts">
import { ref } from "vue";
import { SoneButton, SoneButtonGroup, SoneIcon } from "@surface-one/vue";

const starred = ref(true);
const pinned = ref(true);
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <SoneButton type="button">Default</SoneButton>
      <SoneButton type="button" variant="accent">Accent</SoneButton>
      <SoneButton type="button" variant="secondary">Secondary</SoneButton>
      <SoneButton type="button" variant="soft">Soft</SoneButton>
      <SoneButton type="button" variant="outline">Outline</SoneButton>
      <SoneButton type="button" variant="ghost">Ghost</SoneButton>
      <SoneButton type="button" variant="destructive">Destructive</SoneButton>
      <SoneButton type="button" variant="link">Link</SoneButton>
    </div>
    <div class="demo-row">
      <SoneButton type="button" size="xs">Extra small</SoneButton>
      <SoneButton type="button" size="sm">Small</SoneButton>
      <SoneButton type="button">Default</SoneButton>
      <SoneButton type="button" size="lg">Large</SoneButton>
      <SoneButton type="button" disabled>Disabled</SoneButton>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneButton type="button" variant="ghost" size="icon" aria-label="Share"><SoneIcon icon="share" /></SoneButton>
      <SoneButton type="button" variant="soft" size="icon" aria-label="Settings"><SoneIcon icon="settings" /></SoneButton>
      <SoneButton type="button" variant="outline" size="icon" aria-label="Copy"><SoneIcon icon="copy" /></SoneButton>
      <!-- Toggle buttons: aria-pressed="true" draws the pressed fill -->
      <SoneButton type="button" variant="ghost" size="icon" aria-label="Star"
        :aria-pressed="starred" @click="starred = !starred"><SoneIcon icon="star" /></SoneButton>
      <SoneButton type="button" variant="outline" size="icon" aria-label="Pin to sidebar"
        :aria-pressed="pinned" @click="pinned = !pinned"><SoneIcon icon="bookmark" /></SoneButton>
    </div>
    <SoneButtonGroup>
      <SoneButton type="button" variant="outline">Day</SoneButton>
      <SoneButton type="button" variant="outline">Week</SoneButton>
      <SoneButton type="button" variant="outline">Month</SoneButton>
    </SoneButtonGroup>
  </div>
</template>
