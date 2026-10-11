<script setup lang="ts">
import { ref } from "vue";
import { SoneButton, SoneCollapsibleSection } from "@surface-one/vue";

const open = ref(true);
const items = [
  "Ada Park: share the launch checklist",
  "Sam Lee: review the pricing page copy",
  "Kai Moreno: book the design review",
];
</script>

<template>
  <div class="demo-stack" style="max-width: 30rem">
    <SoneCollapsibleSection
      v-model:open="open"
      title="Action items"
      subtitle="From the last 3 meetings"
      :count="items.length"
    >
      <template #actions>
        <SoneButton variant="ghost" size="xs" type="button">Copy</SoneButton>
      </template>
      <ul style="margin: 0; color: var(--text-secondary)">
        <li v-for="item in items" :key="item">{{ item }}</li>
      </ul>
    </SoneCollapsibleSection>

    <SoneCollapsibleSection title="Audit trail" :count="12">
      <p style="margin: 0; color: var(--text-secondary)">Every read of a locked note, newest first.</p>
    </SoneCollapsibleSection>
  </div>
</template>
