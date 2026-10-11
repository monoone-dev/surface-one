<script setup lang="ts">
import { ref } from "vue";
import {
  SoneChoiceCard,
  SoneChoiceCardDescription,
  SoneChoiceCardIndicator,
  SoneChoiceCardTitle,
  SoneChoiceGroup,
} from "@surface-one/vue";

const plan = ref("team");
const reminders = ref(false);
</script>

<template>
  <div class="demo-stack" style="max-width: 36rem">
    <SoneChoiceGroup
      aria-label="Plan"
      style="display: grid; grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr)); gap: var(--space-2)"
    >
      <SoneChoiceCard type="button" :selected="plan === 'free'" @click="plan = 'free'">
        <SoneChoiceCardTitle>Free</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>Up to 3 projects.</SoneChoiceCardDescription>
        <SoneChoiceCardIndicator />
      </SoneChoiceCard>
      <SoneChoiceCard type="button" :selected="plan === 'team'" @click="plan = 'team'">
        <SoneChoiceCardTitle>Team</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>Unlimited projects and shared spaces.</SoneChoiceCardDescription>
        <SoneChoiceCardIndicator />
      </SoneChoiceCard>
      <SoneChoiceCard type="button" disabled>
        <SoneChoiceCardTitle>Enterprise</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>Contact sales to enable.</SoneChoiceCardDescription>
        <SoneChoiceCardIndicator />
      </SoneChoiceCard>
    </SoneChoiceGroup>
    <SoneChoiceCard type="button" orientation="horizontal" :selected="reminders" @click="reminders = !reminders">
      <span style="display: grid; gap: var(--choice-card-gap)">
        <SoneChoiceCardTitle>Email reminders</SoneChoiceCardTitle>
        <SoneChoiceCardDescription>A standalone card toggles on click.</SoneChoiceCardDescription>
      </span>
      <SoneChoiceCardIndicator />
    </SoneChoiceCard>
  </div>
</template>
