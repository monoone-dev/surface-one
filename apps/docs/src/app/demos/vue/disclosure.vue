<script setup lang="ts">
import { ref } from "vue";
import { SoneDisclosure } from "@surface-one/vue";

const advancedOpen = ref(true);
</script>

<template>
  <div class="demo-stack" style="max-width: 30rem">
    <SoneDisclosure v-model:open="advancedOpen" panel-label="Advanced settings">
      <template #summary>Advanced settings</template>
      <p style="margin: 0; color: var(--text-secondary)">
        Model size, language detection and the silence threshold live here.
      </p>
    </SoneDisclosure>
    <SoneDisclosure panel-label="Storage">
      <template #summary>Storage</template>
      <p style="margin: 0; color: var(--text-secondary)">Retention period and the audio budget.</p>
    </SoneDisclosure>
    <SoneDisclosure disabled panel-label="Sync">
      <template #summary>Sync (unavailable offline)</template>
      <p style="margin: 0">Never shown while disabled.</p>
    </SoneDisclosure>
  </div>
</template>
