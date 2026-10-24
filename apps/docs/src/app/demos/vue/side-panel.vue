<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneSidePanel,
  SoneSidePanelActions,
  SoneSidePanelClose,
  SoneSidePanelContent,
  SoneSidePanelHeader,
  SoneSidePanelTitle,
} from "@surface-one/vue";

const open = ref(true);
</script>

<template>
  <div class="demo-row" style="align-items: stretch; width: 100%; min-height: 280px">
    <div class="demo-stack" style="flex: 1">
      <p>Weekly sync — the note stays in place while the panel docks beside it.</p>
      <SoneButton v-if="!open" variant="outline" type="button" @click="open = true">Open details</SoneButton>
    </div>
    <SoneSidePanel v-if="open" aria-labelledby="side-panel-demo-title">
      <SoneSidePanelHeader>
        <SoneSidePanelTitle id="side-panel-demo-title">Details</SoneSidePanelTitle>
        <SoneSidePanelActions>
          <SoneSidePanelClose label="Close details" @closed="open = false" />
        </SoneSidePanelActions>
      </SoneSidePanelHeader>
      <SoneSidePanelContent>
        <p>Created 9 October · 3 participants · 42 minutes.</p>
      </SoneSidePanelContent>
    </SoneSidePanel>
  </div>
</template>
