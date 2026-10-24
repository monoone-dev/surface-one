<script setup lang="ts">
import { ref } from "vue";
import {
  SoneMenu,
  SoneMenubar,
  SoneMenubarTrigger,
  SoneMenuCheckboxItem,
  SoneMenuItem,
  SoneMenuSeparator,
  SoneMenuShortcut,
} from "@surface-one/vue";

const bookmarks = ref(true);
const urls = ref(false);
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; min-height: 16rem">
    <SoneMenubar aria-label="Editor">
      <SoneMenubarTrigger>
        File
        <template #menu>
          <SoneMenu aria-label="File" style="width: 14rem">
            <SoneMenuItem type="button">New Tab <SoneMenuShortcut as="kbd">⌘T</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuItem type="button">New Window <SoneMenuShortcut as="kbd">⌘N</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuSeparator />
            <SoneMenuItem type="button">Print… <SoneMenuShortcut as="kbd">⌘P</SoneMenuShortcut></SoneMenuItem>
          </SoneMenu>
        </template>
      </SoneMenubarTrigger>
      <SoneMenubarTrigger>
        Edit
        <template #menu>
          <SoneMenu aria-label="Edit" style="width: 14rem">
            <SoneMenuItem type="button">Undo <SoneMenuShortcut as="kbd">⌘Z</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuItem type="button">Redo <SoneMenuShortcut as="kbd">⇧⌘Z</SoneMenuShortcut></SoneMenuItem>
            <SoneMenuSeparator />
            <SoneMenuItem type="button">Cut</SoneMenuItem>
            <SoneMenuItem type="button">Copy</SoneMenuItem>
            <SoneMenuItem type="button">Paste</SoneMenuItem>
          </SoneMenu>
        </template>
      </SoneMenubarTrigger>
      <SoneMenubarTrigger>
        View
        <template #menu>
          <SoneMenu aria-label="View" style="width: 14rem">
            <SoneMenuCheckboxItem type="button" :checked="bookmarks" @click="bookmarks = !bookmarks">
              Show Bookmarks Bar
            </SoneMenuCheckboxItem>
            <SoneMenuCheckboxItem type="button" :checked="urls" @click="urls = !urls">
              Show Full URLs
            </SoneMenuCheckboxItem>
          </SoneMenu>
        </template>
      </SoneMenubarTrigger>
    </SoneMenubar>
  </div>
</template>
