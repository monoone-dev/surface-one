<script setup lang="ts">
import { SoneScrollArea, SoneSeparator } from "@surface-one/vue";

const tags = Array.from({ length: 30 }, (_, i) => `v1.2.0-beta.${30 - i}`);
const swatches = ["accent", "accent-soft", "surface-hover", "success", "warning", "danger"];
</script>

<template>
  <div class="demo-row" style="align-items: flex-start">
    <SoneScrollArea
      aria-label="Release tags"
      style="height: 14rem; width: 12rem; padding: var(--space-4); border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-md)"
    >
      <p style="margin: 0 0 var(--space-3); font-weight: var(--font-weight-medium)">Tags</p>
      <template v-for="tag in tags" :key="tag">
        <div style="font-size: var(--font-size-sm)">{{ tag }}</div>
        <SoneSeparator style="margin-block: var(--space-2)" />
      </template>
    </SoneScrollArea>
    <div style="width: 18rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-md)">
      <SoneScrollArea orientation="horizontal" fade aria-label="Swatches">
        <div style="display: flex; gap: var(--space-3); padding: var(--space-4); width: max-content">
          <div v-for="swatch in swatches" :key="swatch" style="display: grid; gap: var(--space-2); justify-items: start">
            <div
              :style="{ background: `var(--${swatch})` }"
              style="width: 6rem; height: 6rem; border-radius: var(--radius-md); border: var(--border-width-thin) solid var(--border)"
            />
            <code style="font-size: var(--font-size-xs)">--{{ swatch }}</code>
          </div>
        </div>
      </SoneScrollArea>
    </div>
  </div>
</template>
