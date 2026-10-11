<script setup lang="ts">
import { ref } from "vue";
import { SoneButton, SoneStepper, type SoneStep } from "@surface-one/vue";

const steps: SoneStep[] = [
  { key: "account", label: "Account", description: "Email and password" },
  { key: "verify", label: "Verify", description: "Enter the code" },
  { key: "recovery", label: "Recovery", description: "Save the phrase" },
];
const setup = ref(1);
const account = ref(1);
const last = steps.length - 1;

const back = () => {
  setup.value = Math.max(setup.value - 1, 0);
  account.value = Math.max(account.value - 1, 0);
};
const next = () => {
  setup.value = Math.min(setup.value + 1, last);
  account.value = Math.min(account.value + 1, last);
};
</script>

<template>
  <div class="demo-stack" style="max-width: 40rem">
    <SoneStepper v-model:current="setup" :steps="steps" aria-label="Setup progress" disabled />
    <SoneStepper v-model:current="account" :steps="steps" variant="numbered" linear aria-label="Account setup" />
    <div style="display: flex; gap: var(--space-2)">
      <SoneButton variant="outline" size="sm" type="button" @click="back">Back</SoneButton>
      <SoneButton size="sm" type="button" @click="next">Next</SoneButton>
    </div>
  </div>
</template>
