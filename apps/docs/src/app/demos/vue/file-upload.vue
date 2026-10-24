<script setup lang="ts">
import { ref } from "vue";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneFileUpload } from "@surface-one/vue";

const files = ref<File[]>([]);
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem">
    <SoneField>
      <SoneFieldLabel for="demo-attachments">Attachments</SoneFieldLabel>
      <SoneFileUpload
        v-model="files"
        input-id="demo-attachments"
        multiple
        accept="image/*,.pdf"
        :max-size="2000000"
        :max-files="4"
        description="PNG, JPG or PDF, up to 2 MB each"
      />
      <SoneFieldDescription>Up to four files, attached to the meeting notes.</SoneFieldDescription>
    </SoneField>
  </div>
</template>
