<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SoneButton,
  SoneFloatingBar,
  SoneStatusOrb,
  type FloatingBarState,
  type StatusOrbState,
} from "@surface-one/vue";

const states: FloatingBarState[] = ["idle", "live", "processing"];
const state = ref<FloatingBarState>("idle");
const visible = ref(true);
const orb = computed<StatusOrbState>(() =>
  state.value === "idle" ? "ready" : state.value,
);
</script>

<template>
  <div class="demo-stack" style="max-width: 420px; width: 100%">
    <div v-if="visible" style="height: 3rem">
      <SoneFloatingBar :state="state" @closed="visible = false">
        <SoneStatusOrb :state="orb" />
        <span>{{
          state === "live" ? "Recording · 02:14" : state === "processing" ? "Writing the note…" : "Ready · ⌘⇧R"
        }}</span>
      </SoneFloatingBar>
    </div>
    <SoneButton v-else variant="outline" type="button" @click="visible = true">Show the bar</SoneButton>
    <div class="demo-row">
      <SoneButton
        v-for="s in states"
        :key="s"
        size="sm"
        :variant="state === s ? 'default' : 'outline'"
        type="button"
        @click="state = s"
      >
        {{ s }}
      </SoneButton>
    </div>
  </div>
</template>
