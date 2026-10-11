<script setup lang="ts">
import { nextTick, ref } from "vue";
import {
  SoneButton,
  SoneConfirm,
  SoneConfirmDescription,
  SoneConfirmError,
  SoneConfirmTitle,
} from "@surface-one/vue";

const confirming = ref(false);
const busy = ref(false);
const status = ref("");
const opener = ref<InstanceType<typeof SoneButton> | null>(null);

function remove(): void {
  busy.value = true;
  setTimeout(() => {
    busy.value = false;
    status.value = "Deleted";
    close();
  }, 800);
}

async function close(): Promise<void> {
  confirming.value = false;
  // Give focus back to the button that opened it, once it is rendered again.
  await nextTick();
  (opener.value?.$el as HTMLElement | undefined)?.focus();
}
</script>

<template>
  <div class="demo-stack" style="max-width: 32rem">
    <!-- Inline: render it with v-if in place of the button that asked -->
    <SoneConfirm
      v-if="confirming"
      variant="destructive"
      confirm-label="Delete"
      busy-label="Deleting…"
      :busy="busy"
      @confirm="remove"
      @cancel="close"
    >
      <SoneConfirmTitle>Delete “Weekly sync”?</SoneConfirmTitle>
      <SoneConfirmDescription>It moves to the trash for 30 days.</SoneConfirmDescription>
    </SoneConfirm>
    <div v-else class="demo-row">
      <SoneButton ref="opener" variant="outline" type="button" @click="confirming = true">
        Delete note
      </SoneButton>
      <span role="status" style="color: var(--text-secondary)">{{ status }}</span>
    </div>

    <!-- Card: a bordered panel; extra controls go in SoneConfirmActions (or #actions) -->
    <SoneConfirm layout="card" variant="destructive" confirm-label="Remove lock" :auto-focus="false">
      <SoneConfirmTitle as="h3">Remove the lock from “Board”?</SoneConfirmTitle>
      <SoneConfirmDescription>Its notes are decrypted and stay readable without Touch ID.</SoneConfirmDescription>
      <SoneConfirmError>Touch ID was cancelled. Try again.</SoneConfirmError>
    </SoneConfirm>
  </div>
</template>
