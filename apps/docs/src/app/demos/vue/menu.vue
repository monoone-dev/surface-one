<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneMenuShortcut,
  SoneMenuTrigger,
} from "@surface-one/vue";

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
  </div>
</template>
