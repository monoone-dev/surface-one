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
  SonePopover,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
} from "@surface-one/vue";

const menuOpen = ref(false);
const popoverOpen = ref(false);
const pinned = ref(true);
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; min-height: 17rem">
    <div style="position: relative" @keydown.escape="menuOpen = false">
      <SoneButton variant="outline" type="button" aria-haspopup="menu"
        :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">Note actions</SoneButton>
      <SoneMenu v-if="menuOpen" role="menu" aria-label="Note actions"
        style="position: absolute; top: calc(100% + var(--space-1)); left: 0; width: 15rem; z-index: var(--z-dropdown)">
        <SoneMenuGroup>
          <SoneMenuLabel>Note</SoneMenuLabel>
          <SoneMenuItem role="menuitem" type="button" @click="menuOpen = false">Rename <SoneMenuShortcut as="kbd">⌘R</SoneMenuShortcut></SoneMenuItem>
          <SoneMenuItem role="menuitem" type="button" disabled>Export (locked)</SoneMenuItem>
          <SoneMenuCheckboxItem type="button" :checked="pinned" @click="pinned = !pinned">Pinned</SoneMenuCheckboxItem>
        </SoneMenuGroup>
        <SoneMenuGroup>
          <SoneMenuItem variant="destructive" role="menuitem" type="button" @click="menuOpen = false">Move to Trash</SoneMenuItem>
        </SoneMenuGroup>
      </SoneMenu>
    </div>

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
