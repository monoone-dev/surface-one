<script setup lang="ts">
import { SoneButton, SoneIcon, vSoneTooltip } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <SoneButton v-sone-tooltip="'New note (⌘N)'" variant="ghost" size="icon" type="button" aria-label="New note">
        <SoneIcon icon="note-add" />
      </SoneButton>
      <SoneButton v-sone-tooltip="'Search'" variant="ghost" size="icon" type="button" aria-label="Search">
        <SoneIcon icon="search" />
      </SoneButton>
      <SoneButton v-sone-tooltip="'Move to trash'" variant="ghost" size="icon" type="button" aria-label="Move to trash">
        <SoneIcon icon="trash" />
      </SoneButton>
    </div>
    <div class="demo-row">
      <SoneButton v-sone-tooltip:top="'Opens above'" variant="outline" size="sm" type="button">Top</SoneButton>
      <SoneButton v-sone-tooltip:right="'Opens to the right'" variant="outline" size="sm" type="button">Right</SoneButton>
      <SoneButton v-sone-tooltip="'Opens below (default)'" variant="outline" size="sm" type="button">Bottom</SoneButton>
      <SoneButton v-sone-tooltip:left="'Opens to the left'" variant="outline" size="sm" type="button">Left</SoneButton>
      <SoneButton
        v-sone-tooltip="{ text: 'Shown instantly, no arrow', showDelay: 0, arrow: false }"
        variant="outline"
        size="sm"
        type="button"
        >No delay</SoneButton
      >
    </div>
  </div>
</template>
