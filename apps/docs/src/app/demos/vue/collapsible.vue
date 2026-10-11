<script setup lang="ts">
import { ref } from "vue";
import {
  SoneCollapsible,
  SoneCollapsibleContent,
  SoneCollapsibleIcon,
  SoneCollapsibleTrigger,
} from "@surface-one/vue";

const open = ref(false);
</script>

<template>
  <SoneCollapsible v-model:expanded="open" as="section" class="demo-stack" style="max-width: 28rem">
    <SoneCollapsibleTrigger>
      <SoneCollapsibleIcon as="svg" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </SoneCollapsibleIcon>
      <strong>Action items</strong>
    </SoneCollapsibleTrigger>
    <SoneCollapsibleContent as="ul" id="action-items" style="margin: 0; color: var(--text-secondary)">
      <li>Ada Park: share the launch checklist</li>
      <li>Sam Lee: review the pricing page copy</li>
      <li>Kai Moreno: book the design review</li>
    </SoneCollapsibleContent>
  </SoneCollapsible>
</template>
