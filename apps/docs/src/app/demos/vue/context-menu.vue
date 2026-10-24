<script setup lang="ts">
import { ref } from "vue";
import {
  SoneContextMenuTrigger,
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuItem,
  SoneMenuSeparator,
  SoneMenuShortcut,
} from "@surface-one/vue";

const bookmarks = ref(true);
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; min-height: 20rem">
    <SoneContextMenuTrigger
      tabindex="0"
      style="display: grid; place-items: center; width: 18rem; height: 9rem; border: var(--border-width-thin) dashed var(--border); border-radius: var(--radius-lg); color: var(--text-secondary); font-size: var(--font-size-sm)"
    >
      Right-click or long-press here
      <template #menu>
        <SoneMenu aria-label="Page actions" style="width: 14rem">
          <SoneMenuItem type="button">Back <SoneMenuShortcut as="kbd">⌘[</SoneMenuShortcut></SoneMenuItem>
          <SoneMenuItem type="button" disabled>Forward <SoneMenuShortcut as="kbd">⌘]</SoneMenuShortcut></SoneMenuItem>
          <SoneMenuItem type="button">Reload <SoneMenuShortcut as="kbd">⌘R</SoneMenuShortcut></SoneMenuItem>
          <SoneMenuSeparator />
          <SoneMenuCheckboxItem type="button" :checked="bookmarks" @click="bookmarks = !bookmarks">
            Show bookmarks
          </SoneMenuCheckboxItem>
          <SoneMenuSeparator />
          <SoneMenuItem variant="destructive" type="button">Delete page</SoneMenuItem>
        </SoneMenu>
      </template>
    </SoneContextMenuTrigger>
  </div>
</template>
