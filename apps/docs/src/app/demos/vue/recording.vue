<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SoneField,
  SoneFieldLabel,
  SoneLevelMeter,
  SoneMicToggle,
  SoneProcessingStatus,
  SoneRecordButton,
  SoneRecordingIndicator,
  SoneStatusOrb,
} from "@surface-one/vue";

const recording = ref(false);
const muted = ref(false);
const paused = ref(false);
const level = ref(0.45);
const seconds = ref(754);
/** Recent input levels, oldest first — a recorder would push one per tick. */
const history = Array.from(
  { length: 24 },
  (_, i) => 0.5 + 0.45 * Math.sin(i / 2.3) * Math.cos(i / 5.1),
);
/** The meter only moves while recording, unmuted and not paused. */
const meterLevel = computed(() =>
  recording.value && !muted.value && !paused.value ? level.value : 0,
);
</script>

<template>
  <div class="demo-stack" style="max-width: 360px; width: 100%">
    <div class="demo-row">
      <SoneRecordButton
        type="button"
        :state="recording ? 'recording' : 'idle'"
        :aria-label="recording ? 'Stop recording' : 'Start recording'"
        @click="recording = !recording"
      />
      <SoneMicToggle :muted="muted" :disabled="!recording" @mute-toggle="muted = !muted" />
      <SoneRecordButton
        with-label
        size="sm"
        type="button"
        :state="paused ? 'paused' : 'recording'"
        :disabled="!recording"
        @click="paused = !paused"
      >
        {{ paused ? "Resume" : "Pause" }}
      </SoneRecordButton>
    </div>
    <SoneRecordingIndicator
      v-if="recording"
      :seconds="seconds"
      :state="paused ? 'paused' : 'live'"
      :label="paused ? 'Paused' : muted ? 'Recording · muted' : 'Recording'"
    />
    <div v-else class="demo-row">
      <SoneStatusOrb state="ready" />
      <span>Ready</span>
    </div>
    <SoneField>
      <SoneFieldLabel for="recording-demo-level">Simulated input level</SoneFieldLabel>
      <input
        id="recording-demo-level"
        type="range"
        min="0"
        max="1"
        step="0.05"
        :value="level"
        @input="level = ($event.target as HTMLInputElement).valueAsNumber"
      />
    </SoneField>
    <SoneLevelMeter :level="meterLevel" />
    <SoneLevelMeter :bars="24" :history="history" />
    <div class="demo-row" style="align-items: center">
      <SoneStatusOrb state="paused" /><span>Paused</span>
      <SoneStatusOrb state="queued" /><span>Queued</span>
      <SoneStatusOrb state="error" /><span>Failed</span>
    </div>
    <SoneProcessingStatus stage="summarizing" :progress="0.42" />
    <SoneProcessingStatus stage="error" size="sm" />
  </div>
</template>
