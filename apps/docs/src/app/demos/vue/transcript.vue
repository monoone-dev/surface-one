<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldLabel,
  SoneTranscript,
  foldTranscriptTurns,
  type TranscriptSegment,
} from "@surface-one/vue";

const segments: TranscriptSegment[] = [] = [
  {
    id: 0,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 0,
    endS: 6,
    text: "Thanks for joining — let's go through the launch checklist.",
  },
  {
    id: 1,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 6,
    endS: 11,
    text: "First item is the onboarding copy.",
  },
  {
    id: 2,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 11,
    endS: 19,
    text: "The draft is in the shared folder. It still needs a legal pass.",
  },
  {
    id: 3,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 19,
    endS: 25,
    text: "I can take that. Friday works for me.",
  },
  {
    id: 4,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 25,
    endS: 32,
    text: "Great. Next up: the pricing page screenshots.",
  },
  {
    id: 5,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 32,
    endS: 40,
    text: "Those are waiting on the new plan names, so let's revisit on Friday.",
  },
];

/** Consecutive segments from the same speaker fold into one turn. */
const turns = foldTranscriptTurns(segments);
const currentTime = ref(14);
const query = ref("");
</script>

<template>
  <div class="demo-stack" style="max-width: 640px; width: 100%">
    <SoneField>
      <SoneFieldLabel for="transcript-demo-filter">Filter transcript</SoneFieldLabel>
      <input id="transcript-demo-filter" v-model="query" type="search" placeholder="Try “friday”" />
    </SoneField>
    <SoneTranscript :turns="turns" :current-time="currentTime" :query="query" @seek="currentTime = $event" />
  </div>
</template>
