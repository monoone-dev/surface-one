<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneIcon,
  SoneMenuCheckboxItem,
  SoneMenuGroup,
  SoneMenuItem,
  SonePageActions,
  SonePageActionsLead,
} from "@surface-one/vue";

const starred = ref(false);
const notify = ref(true);
</script>

<template>
  <div class="demo-row" style="justify-content: space-between; width: 100%">
    <span>Product roadmap</span>
    <SonePageActions status="Edited Oct 08" tooltip="More actions">
      <SonePageActionsLead>
        <SoneButton type="button" variant="ghost" size="icon-sm" aria-label="Favourite"
          :aria-pressed="starred" @click="starred = !starred">
          <SoneIcon icon="star" />
        </SoneButton>
      </SonePageActionsLead>
      <SoneMenuGroup>
        <SoneMenuItem type="button"><SoneIcon icon="link" /> Copy link</SoneMenuItem>
        <SoneMenuItem type="button"><SoneIcon icon="copy" /> Duplicate</SoneMenuItem>
        <SoneMenuCheckboxItem type="button" :checked="notify" @click="notify = !notify">
          <SoneIcon icon="bell-ring" /> Notifications
        </SoneMenuCheckboxItem>
      </SoneMenuGroup>
      <SoneMenuGroup>
        <SoneMenuItem type="button" variant="destructive">
          <SoneIcon icon="trash" /> Move to Trash
        </SoneMenuItem>
      </SoneMenuGroup>
    </SonePageActions>
  </div>
</template>
