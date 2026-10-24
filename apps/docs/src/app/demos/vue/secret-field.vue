<script setup lang="ts">
import { ref } from "vue";
import { SoneSecretField } from "@surface-one/vue";

const hasKey = ref(false);
const busy = ref(false);

// A real app hands the value to secure storage; the demo only simulates the round trip.
function save(_value: string) {
  busy.value = true;
  setTimeout(() => {
    busy.value = false;
    hasKey.value = true;
  }, 600);
}
</script>

<template>
  <div class="demo-stack" style="max-width: 28rem">
    <SoneSecretField
      label="API key"
      placeholder="Paste your API key"
      help="Stored in the system keychain and never logged."
      clearable
      :has-key="hasKey"
      :busy="busy"
      @save="save"
      @clear="hasKey = false"
    />
    <SoneSecretField
      label="Workspace token"
      placeholder="tok_…"
      set-label="Token set ✓"
      save-label="Save"
      :has-key="false"
      error="The keychain refused the write. Try again."
    />
  </div>
</template>
