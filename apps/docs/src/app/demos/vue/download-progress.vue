<script setup lang="ts">
import { ref } from "vue";
import { SoneButton, SoneDownloadProgress } from "@surface-one/vue";

const cancelled = ref(false);
</script>

<template>
  <div class="demo-stack" style="max-width: 26rem">
    <div v-if="cancelled" class="demo-row">
      <span style="color: var(--text-secondary)">Download cancelled.</span>
      <SoneButton type="button" size="sm" variant="outline" @click="cancelled = false">Retry</SoneButton>
    </div>
    <SoneDownloadProgress
      v-else
      :frac="0.42"
      cancellable
      aria-label="Example model download"
      @cancel-requested="cancelled = true"
    />
    <SoneDownloadProgress :frac="null" label="Preparing…" aria-label="Preparing files" />
    <SoneDownloadProgress label="Example-3B" separator=" · " :frac="0.63" aria-label="Example-3B download" />
    <SoneDownloadProgress size="md" :frac="0.7" aria-label="Setup progress" />
  </div>
</template>
