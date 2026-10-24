<script setup lang="ts">
import { ref } from "vue";
import {
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SoneMenuLabel,
  SoneRowMenu,
  SoneSidebar,
  SoneTreeRow,
} from "@surface-one/vue";

const pinned = ref(true);
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <h3 style="margin: 0">Weekly sync</h3>
      <SoneRowMenu label="Actions for Weekly sync" prominent>
        <SoneMenuGroup>
          <SoneMenuLabel>Note</SoneMenuLabel>
          <SoneMenuItem type="button">Rename</SoneMenuItem>
          <SoneMenuItem type="button">Move to folder…</SoneMenuItem>
          <SoneMenuCheckboxItem type="button" :checked="pinned" @click="pinned = !pinned">Pinned</SoneMenuCheckboxItem>
        </SoneMenuGroup>
        <SoneMenuGroup>
          <SoneMenuItem variant="destructive" type="button">Move to trash</SoneMenuItem>
        </SoneMenuGroup>
      </SoneRowMenu>
    </div>

    <SoneSidebar style="width: 16rem">
      <SoneTreeRow label="Research" :count="6">
        <SoneRowMenu label="Actions for Research">
          <SoneMenuItem type="button">Rename</SoneMenuItem>
          <SoneMenuItem variant="destructive" type="button">Delete folder</SoneMenuItem>
        </SoneRowMenu>
      </SoneTreeRow>
    </SoneSidebar>
  </div>
</template>
