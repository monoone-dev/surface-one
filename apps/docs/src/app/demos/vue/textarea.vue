<script setup lang="ts">
import { ref } from "vue";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneTextarea } from "@surface-one/vue";

const bio = ref("Designer in Kraków. I write about type, tokens and tidy interfaces.");
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem">
    <SoneField>
      <SoneFieldLabel for="demo-message">Message</SoneFieldLabel>
      <SoneTextarea id="demo-message" placeholder="Type your message here." />
    </SoneField>
    <SoneField>
      <SoneFieldLabel for="demo-bio">Bio</SoneFieldLabel>
      <SoneTextarea
        id="demo-bio"
        v-model="bio"
        autosize
        :min-rows="2"
        :max-rows="6"
        :maxlength="160"
        show-count
      />
      <SoneFieldDescription>Grows from two to six rows. Shown on your public profile.</SoneFieldDescription>
    </SoneField>
  </div>
</template>
