<script setup lang="ts">
import { ref } from "vue";
import {
  SoneCheckbox,
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldGroup,
  SoneFieldLabel,
} from "@surface-one/vue";

const terms = ref(false);
const partial = ref(true);
const updates = ref(true);
</script>

<template>
  <SoneFieldGroup variant="choices" style="max-width: 26rem">
    <SoneField orientation="horizontal">
      <SoneCheckbox id="demo-terms" v-model="terms" v-model:indeterminate="partial" />
      <SoneFieldContent>
        <SoneFieldLabel for="demo-terms">Accept terms and conditions</SoneFieldLabel>
        <SoneFieldDescription>{{ partial ? "Partly read" : terms ? "Accepted" : "Not accepted" }}.</SoneFieldDescription>
      </SoneFieldContent>
    </SoneField>
    <SoneField orientation="horizontal">
      <SoneCheckbox id="demo-updates" v-model="updates" />
      <SoneFieldLabel for="demo-updates">Email me product updates</SoneFieldLabel>
    </SoneField>
    <SoneField orientation="horizontal" disabled>
      <SoneCheckbox id="demo-locked" :model-value="true" disabled />
      <SoneFieldLabel for="demo-locked">Keep a backup (managed)</SoneFieldLabel>
    </SoneField>
  </SoneFieldGroup>
</template>
