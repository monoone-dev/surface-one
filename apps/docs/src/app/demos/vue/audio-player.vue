<script setup lang="ts">
import { ref } from "vue";
import { SoneAudioPlayer } from "@surface-one/vue";

/** A tiny silent WAV inlined as a data URL, so the demo needs no audio file. */
const recording =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
const position = ref(0);
</script>

<template>
  <div class="demo-stack" style="max-width: 560px; width: 100%">
    <SoneAudioPlayer
      :src="recording"
      :skip-seconds="15"
      :rates="[1, 1.5, 2]"
      @time-update="position = $event"
    />
    <span style="color: var(--text-secondary); font-size: var(--font-size-sm)">
      Position: {{ position.toFixed(1) }} s
    </span>
  </div>
</template>
