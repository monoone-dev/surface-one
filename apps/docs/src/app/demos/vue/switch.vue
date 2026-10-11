<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneSwitch,
} from "@surface-one/vue";

const captions = ref(true);
const compact = ref(false);
</script>

<template>
  <SoneFieldGroup variant="choices" style="max-width: 26rem">
    <SoneField orientation="horizontal">
      <SoneFieldContent>
        <SoneFieldLabel for="demo-captions">Live captions</SoneFieldLabel>
        <SoneFieldDescription>{{ captions ? "On" : "Off" }} — show text while people speak.</SoneFieldDescription>
      </SoneFieldContent>
      <SoneSwitch v-model="captions" input-id="demo-captions" />
    </SoneField>
    <SoneField orientation="horizontal">
      <SoneFieldContent>
        <SoneFieldLabel for="demo-compact">Compact layout</SoneFieldLabel>
        <SoneFieldDescription>Small size, for dense settings lists.</SoneFieldDescription>
      </SoneFieldContent>
      <SoneSwitch v-model="compact" input-id="demo-compact" size="sm" />
    </SoneField>
    <SoneField orientation="horizontal" disabled>
      <SoneFieldContent>
        <SoneFieldLabel for="demo-sync">Cloud sync</SoneFieldLabel>
        <SoneFieldDescription>Managed by your administrator.</SoneFieldDescription>
      </SoneFieldContent>
      <SoneSwitch input-id="demo-sync" :model-value="true" disabled />
    </SoneField>
  </SoneFieldGroup>
</template>
