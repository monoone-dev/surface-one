<script setup lang="ts">
import {
  SoneButton,
  SoneField,
  SoneFieldLabel,
  SonePopover,
  SonePopoverContent,
  SonePopoverDescription,
  SonePopoverHeader,
  SonePopoverTitle,
  SonePopoverTrigger,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; min-height: 17rem">
    <SonePopover>
      <SonePopoverTrigger :as="SoneButton" variant="outline" type="button">Dimensions</SonePopoverTrigger>
      <SonePopoverContent v-slot="{ close }" aria-labelledby="dimensions-title">
        <SonePopoverHeader>
          <SonePopoverTitle id="dimensions-title">Dimensions</SonePopoverTitle>
          <SonePopoverDescription>Set the size of the layer.</SonePopoverDescription>
        </SonePopoverHeader>
        <SoneField>
          <SoneFieldLabel for="dimensions-width">Width</SoneFieldLabel>
          <input id="dimensions-width" type="text" value="100%" />
        </SoneField>
        <SoneField>
          <SoneFieldLabel for="dimensions-height">Height</SoneFieldLabel>
          <input id="dimensions-height" type="text" value="25px" />
        </SoneField>
        <SoneButton size="sm" type="button" @click="close">Apply</SoneButton>
      </SonePopoverContent>
    </SonePopover>
  </div>
</template>
