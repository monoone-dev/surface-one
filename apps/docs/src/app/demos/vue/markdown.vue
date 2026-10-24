<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldLabel,
  SoneMarkdown,
  SoneMarkdownEditor,
} from "@surface-one/vue";

const note = ref(
  [
    "**Planning sync** with Ada Park and Leo Ruiz.",
    "",
    "- Cut the onboarding checklist to *five* steps",
    "- Ship it behind the `short-onboarding` flag",
    "",
    "- [x] Draft the invite copy",
    "- [ ] Legal review by Friday",
    "",
    "[Guide][ref]",
    "",
    '[ref]: https://example.invalid/one "Guide one"',
  ].join("\n"),
);

const draft = ref(
  "## Follow-ups\n\n1. Leo shares the rollout plan\n2. Ada books the review\n\nSelect text and press **⌘B** to bold it.",
);
</script>

<template>
  <div class="demo-stack" style="max-width: 680px; width: 100%">
    <SoneField>
      <SoneFieldLabel for="markdown-source">Markdown</SoneFieldLabel>
      <textarea id="markdown-source" v-model="note" rows="6"></textarea>
    </SoneField>
    <SoneMarkdown data-testid="markdown-reference-preview" :source="note" />
    <SoneMarkdownEditor
      v-model="draft"
      aria-label="Meeting note"
      placeholder="Write in markdown…"
      :min-rows="5"
    />
  </div>
</template>
