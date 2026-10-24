<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldLabel,
  SoneImagePicker,
  type ImagePickerValue,
} from "@surface-one/vue";

const cover = ref<ImagePickerValue>(null);
</script>

<template>
  <div class="demo-stack" style="max-width: 20rem">
    <SoneField>
      <SoneFieldLabel for="demo-cover">Cover image</SoneFieldLabel>
      <SoneImagePicker v-model="cover" input-id="demo-cover" label="Add a cover" :max-size="2000000" />
      <SoneFieldDescription>PNG or JPG, up to 2 MB.</SoneFieldDescription>
    </SoneField>
  </div>
</template>
