<script setup lang="ts">
import { ref } from "vue";
import { SoneButton, SoneToaster, type SoneToast } from "@surface-one/vue";

const toasts = ref<SoneToast[]>([]);
let nextId = 1;

// The host owns the queue: push a toast, drop it on dismiss or action.
function push(kind: SoneToast["kind"], message: string, actionLabel?: string) {
  const toast: SoneToast = { id: nextId++, kind, message };
  if (actionLabel) toast.action = { label: actionLabel };
  toasts.value = [...toasts.value, toast];
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter((t) => t.id !== id);
}
</script>

<template>
  <div class="demo-row">
    <SoneButton variant="outline" type="button" @click="push('success', 'Exported to your vault.')">Success</SoneButton>
    <SoneButton variant="outline" type="button" @click="push('info', 'A new version is ready.', 'Restart')">Info with action</SoneButton>
    <SoneButton variant="outline" type="button" @click="push('danger', 'Couldn’t reach the server.', 'Retry')">Error</SoneButton>
  </div>

  <SoneToaster :toasts="toasts" @dismiss="dismiss" @action="dismiss" />
</template>
