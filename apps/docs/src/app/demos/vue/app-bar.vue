<script setup lang="ts">
import { ref } from "vue";
import { SoneAppBar, SoneButton, SoneIcon } from "@surface-one/vue";

const backs = ref(0);
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <SoneAppBar title="Inbox" subtitle="12 unread" :level="3" show-back @back="backs++">
      <template #trailing>
        <SoneButton type="button" variant="ghost" size="icon" aria-label="Search">
          <SoneIcon icon="search" />
        </SoneButton>
      </template>
    </SoneAppBar>
    <p class="text-hint" aria-live="polite">Back pressed {{ backs }} times</p>
  </div>
</template>
