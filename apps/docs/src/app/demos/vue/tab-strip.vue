<script setup lang="ts">
import { ref } from "vue";
import { SoneTabStrip, type TabStripTab } from "@surface-one/vue";

const tabs = ref<TabStripTab[]>([
  { id: "plan", label: "Release plan", status: "done" },
  { id: "agent", label: "Agent run", status: "busy", note: "4 min" },
  { id: "review", label: "Review notes", status: "waiting", note: "waits" },
]);
const active = ref<string | null>("agent");
let count = 0;

function close(id: string) {
  const i = tabs.value.findIndex((t) => t.id === id);
  const rest = tabs.value.filter((t) => t.id !== id);
  if (active.value === id) active.value = (rest[i] ?? rest[i - 1])?.id ?? null;
  tabs.value = rest;
}

function add() {
  const id = `new-${++count}`;
  tabs.value = [...tabs.value, { id, label: `Untitled ${count}` }];
  active.value = id;
}
</script>

<template>
  <div
    style="display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-2); border-radius: var(--island-radius); background: var(--app-backdrop)"
  >
    <SoneTabStrip
      v-model:active="active"
      aria-label="Documents"
      panel-id-prefix="doc"
      :tabs="tabs"
      closable
      addable
      @close="close"
      @add="add"
    >
      <template #trailing>
        <span class="text-hint">{{ tabs.length }} open</span>
      </template>
    </SoneTabStrip>
    <section
      v-for="tab in tabs"
      :id="`doc-${tab.id}`"
      :key="tab.id"
      role="tabpanel"
      :aria-labelledby="`doc-tab-${tab.id}`"
      :hidden="tab.id !== active"
      tabindex="0"
      style="min-height: 8rem; padding: var(--space-4); border-radius: var(--island-radius); background: var(--surface-base); box-shadow: var(--island-shadow)"
    >
      <p>{{ tab.label }}</p>
    </section>
  </div>
</template>
