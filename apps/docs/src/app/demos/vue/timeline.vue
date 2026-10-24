<script setup lang="ts">
import { ref } from "vue";
import { SoneTimeline, type TimelineData, type TimelineLaneSuggestion } from "@surface-one/vue";

const currentTime = ref(290);

const data: TimelineData = {
  blocks: [
    { lane: "Ada Park", startS: 0, endS: 95 },
    { lane: "others-1", startS: 95, endS: 260 },
    { lane: "Ada Park", startS: 260, endS: 310 },
    { lane: "Leo Ruiz", startS: 310, endS: 520 },
    { lane: "others-1", startS: 520, endS: 610 },
    { lane: "Ada Park", startS: 610, endS: 720 },
  ],
  chapters: [
    { label: "Intro", startS: 0, endS: 60 },
    { label: "Launch checklist", startS: 60, endS: 330 },
    { label: "Pricing page", startS: 330, endS: 560 },
    { label: "Next steps", startS: 560, endS: 720 },
  ],
};

// Unnamed lanes ("others-1") can be renamed from the legend; these are offered.
const suggestions: TimelineLaneSuggestion[] = [{ lane: "others-1", label: "Mia Chen" }];
</script>

<template>
  <div class="demo-stack" style="max-width: 760px; width: 100%">
    <SoneTimeline
      :data="data"
      :total="720"
      :current-time="currentTime"
      :suggestions="suggestions"
      @seek="currentTime = $event"
    />
    <span style="color: var(--text-secondary); font-size: var(--font-size-sm)">
      Playhead at {{ currentTime }} s — click a block or chapter to seek.
    </span>
  </div>
</template>
