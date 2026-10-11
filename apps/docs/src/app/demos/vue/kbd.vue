<script setup lang="ts">
import { SoneButton, SoneKbd, SoneKbdGroup } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneKbd>esc</SoneKbd>
      <SoneKbdGroup><SoneKbd>⌘</SoneKbd><SoneKbd>K</SoneKbd></SoneKbdGroup>
      <SoneKbdGroup><SoneKbd>Ctrl</SoneKbd><span>+</span><SoneKbd>B</SoneKbd></SoneKbdGroup>
    </div>
    <p style="margin: 0; color: var(--text-secondary)">
      Press <SoneKbdGroup><SoneKbd>⌘</SoneKbd><SoneKbd>K</SoneKbd></SoneKbdGroup> to search,
      <SoneKbd>↑</SoneKbd> <SoneKbd>↓</SoneKbd> to move and <SoneKbd>esc</SoneKbd> to close.
    </p>
    <div class="demo-row">
      <SoneButton variant="outline" size="sm" type="button">Accept <SoneKbd>↵</SoneKbd></SoneButton>
      <SoneButton variant="ghost" size="sm" type="button">Cancel <SoneKbd>esc</SoneKbd></SoneButton>
    </div>
  </div>
</template>
