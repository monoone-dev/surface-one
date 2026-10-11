<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneField,
  SoneFieldLabel,
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneMenuShortcut,
  SoneMenuTrigger,
  SonePopover,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
} from "@surface-one/vue";

const popoverOpen = ref(false);
const pinned = ref(true);
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; min-height: 17rem">
    <SoneMenuTrigger :as="SoneButton" variant="outline" type="button">
      Note actions
      <template #menu>
        <SoneMenu aria-label="Note actions" style="width: 15rem">
          <SoneMenuGroup>
            <SoneMenuLabel>Note</SoneMenuLabel>
            <SoneMenuItem type="button">Rename <SoneMenuShortcut as="kbd">⌘R</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuItem type="button">Duplicate</SoneMenuItem>
            <SoneMenuItem type="button" disabled>Export (locked)</SoneMenuItem>
            <SoneMenuCheckboxItem type="button" :checked="pinned" @click="pinned = !pinned">Pinned</SoneMenuCheckboxItem>
          </SoneMenuGroup>
          <SoneMenuGroup>
            <SoneMenuItem variant="destructive" type="button">Move to Trash</SoneMenuItem>
          </SoneMenuGroup>
        </SoneMenu>
      </template>
    </SoneMenuTrigger>

    <div style="position: relative" @keydown.escape="popoverOpen = false">
      <SoneButton variant="outline" type="button" aria-haspopup="dialog"
        :aria-expanded="popoverOpen" @click="popoverOpen = !popoverOpen">Dimensions</SoneButton>
      <SonePopover v-if="popoverOpen" role="dialog" aria-labelledby="dimensions-title"
        style="position: absolute; top: calc(100% + var(--space-1)); left: 0; z-index: var(--z-popover)">
        <SonePopoverHeader>
          <SonePopoverTitle id="dimensions-title">Dimensions</SonePopoverTitle>
          <SonePopoverDescription>Set the size of the layer.</SonePopoverDescription>
        </SonePopoverHeader>
        <SoneField>
          <SoneFieldLabel for="dimensions-width">Width</SoneFieldLabel>
          <input id="dimensions-width" type="text" value="100%" />
        </SoneField>
        <SoneButton size="sm" type="button" @click="popoverOpen = false">Apply</SoneButton>
      </SonePopover>
    </div>
  </div>
</template>
