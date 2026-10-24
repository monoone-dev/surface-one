<script setup lang="ts">
import { computed, ref } from "vue";
import { SoneSidebar, SoneTreeRow, type TreeRowIcon } from "@surface-one/vue";

interface TreeLine {
  id: string;
  label: string;
  icon: TreeRowIcon;
  depth: number;
  parent: string | null;
  count: number | null;
  expandable: boolean;
}

// The tree stays FLAT: one list of depth-tagged lines, nesting is indentation.
const lines: TreeLine[] = [
  { id: "product", label: "Product", icon: "folder", depth: 0, parent: null, count: 4, expandable: true },
  { id: "roadmap", label: "Roadmap review", icon: "meeting", depth: 1, parent: "product", count: null, expandable: false },
  { id: "launch", label: "Launch checklist", icon: "task", depth: 1, parent: "product", count: null, expandable: false },
  { id: "pricing", label: "Pricing notes", icon: "note", depth: 1, parent: "product", count: null, expandable: false },
  { id: "metrics", label: "Metrics board", icon: "dashboard", depth: 1, parent: "product", count: null, expandable: false },
  { id: "one-on-ones", label: "1:1s", icon: "locked", depth: 0, parent: null, count: 2, expandable: false },
];
const expanded = ref(new Set(["product"]));
const selectedId = ref("roadmap");

const visibleLines = computed(() =>
  lines.filter((line) => line.parent === null || expanded.value.has(line.parent)),
);

function toggle(id: string) {
  const next = new Set(expanded.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  expanded.value = next;
}
</script>

<template>
  <SoneSidebar style="width: 18rem">
    <SoneTreeRow
      v-for="line in visibleLines"
      :key="line.id"
      :label="line.label"
      :icon="line.icon"
      :depth="line.depth"
      :count="line.count"
      :expandable="line.expandable"
      :expanded="expanded.has(line.id)"
      :selected="selectedId === line.id"
      @activate="selectedId = line.id"
      @toggle-expand="toggle(line.id)"
    />
  </SoneSidebar>
</template>
