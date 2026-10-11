<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SonePasswordInput,
} from "@surface-one/vue";

const current = ref("");
const next = ref("");
const tooShort = computed(() => next.value.length > 0 && next.value.length < 8);
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <SoneField>
      <SoneFieldLabel for="demo-current-password">Current password</SoneFieldLabel>
      <SonePasswordInput v-model="current" input-id="demo-current-password" />
    </SoneField>
    <SoneField :invalid="tooShort">
      <SoneFieldLabel for="demo-new-password">New password</SoneFieldLabel>
      <SonePasswordInput
        v-model="next"
        input-id="demo-new-password"
        autocomplete="new-password"
        placeholder="At least 8 characters"
        :invalid="tooShort"
      />
      <SoneFieldError v-if="tooShort">Use at least 8 characters.</SoneFieldError>
      <SoneFieldDescription v-else>Other devices are signed out after the change.</SoneFieldDescription>
    </SoneField>
  </div>
</template>
