<script setup lang="ts">
import { ref } from "vue";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneRating } from "@surface-one/vue";

const score = ref(0);
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <SoneRating :model-value="4.5" readonly size="sm" aria-label="Average rating" />
      <span class="text-hint">4.5 · 128 reviews</span>
    </div>
    <SoneField>
      <SoneFieldLabel as="span">Your rating</SoneFieldLabel>
      <SoneRating v-model="score" clearable aria-label="Your rating" />
      <SoneFieldDescription>{{ score ? score + " of 5" : "Not rated yet" }} · choose the same star again to clear.</SoneFieldDescription>
    </SoneField>
    <div class="demo-row">
      <SoneRating :model-value="3" readonly size="sm" />
      <SoneRating :model-value="3" readonly />
      <SoneRating :model-value="3" readonly size="lg" />
    </div>
  </div>
</template>
