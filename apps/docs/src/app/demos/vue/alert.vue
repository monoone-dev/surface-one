<script setup lang="ts">
import { ref } from "vue";
import {
  SoneAlert,
  SoneAlertAction,
  SoneAlertDescription,
  SoneAlertTitle,
  SoneButton,
  SoneIcon,
} from "@surface-one/vue";

const hint = ref(true);
</script>

<template>
  <div class="demo-stack" style="max-width: 34rem">
    <SoneAlert>
      <SoneIcon icon="alert-circle" />
      <SoneAlertTitle>Heads up</SoneAlertTitle>
      <SoneAlertDescription>Summaries are generated on this device by default.</SoneAlertDescription>
    </SoneAlert>
    <SoneAlert variant="success" role="status">
      <SoneIcon icon="check" />
      <SoneAlertTitle>Export complete</SoneAlertTitle>
      <SoneAlertDescription>Weekly sync.md was saved to your notes folder.</SoneAlertDescription>
    </SoneAlert>
    <SoneAlert variant="warning" role="status">
      <SoneIcon icon="lock" />
      <SoneAlertTitle>3 items are in a locked folder</SoneAlertTitle>
      <SoneAlertDescription>Unlock the folder to restore or delete them.</SoneAlertDescription>
      <SoneAlertAction><SoneButton variant="outline" size="xs" type="button">Unlock</SoneButton></SoneAlertAction>
    </SoneAlert>
    <SoneAlert variant="destructive" role="alert">
      <SoneIcon icon="alert-circle" />
      <SoneAlertTitle>Couldn’t reach the server</SoneAlertTitle>
      <SoneAlertDescription>Your transcript is safe. Try again in a moment.</SoneAlertDescription>
      <SoneAlertAction><SoneButton variant="outline" size="xs" type="button">Retry</SoneButton></SoneAlertAction>
    </SoneAlert>
    <SoneAlert v-if="hint" variant="info" role="status" dismissible @dismissed="hint = false">
      <SoneIcon icon="sparkles" />
      <SoneAlertTitle>Ivy noticed a follow-up</SoneAlertTitle>
      <SoneAlertDescription>“Send the budget draft by Friday” was added to Tasks.</SoneAlertDescription>
    </SoneAlert>
    <SoneButton v-else variant="outline" size="sm" type="button" @click="hint = true">Show the hint again</SoneButton>
  </div>
</template>
