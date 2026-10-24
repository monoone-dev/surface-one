<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SoneTagInput,
  type SoneTagRejection,
} from "@surface-one/vue";

const tags = ref<string[]>(["design", "planning", "q3"]);
const suggestions = ["design", "engineering", "hiring", "planning", "sales"];
const error = ref<string | null>(null);

function onRejected(r: SoneTagRejection) {
  error.value =
    r.reason === "duplicate"
      ? `“${r.tag}” is already there.`
      : r.reason === "max"
        ? "Six tags at most."
        : `“${r.tag}” is not a valid tag.`;
}
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem">
    <SoneField :invalid="!!error">
      <SoneFieldLabel for="demo-tags">Tags</SoneFieldLabel>
      <SoneTagInput
        v-model="tags"
        input-id="demo-tags"
        placeholder="Add tag…"
        :max="6"
        :max-visible="4"
        :suggestions="suggestions"
        @rejected="onRejected"
        @added="error = null"
      />
      <SoneFieldError v-if="error">{{ error }}</SoneFieldError>
      <SoneFieldDescription v-else>Press Enter or type a comma to add a tag.</SoneFieldDescription>
    </SoneField>
  </div>
</template>
