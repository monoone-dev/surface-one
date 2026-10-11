<script setup lang="ts">
import { ref } from "vue";
import { SoneDock, SoneDockItem, SoneDockSeparator, SoneIcon, SoneSegmented, type DockPosition } from "@surface-one/vue";

const positions = ["top", "bottom", "left", "right"].map((p) => ({ value: p, label: p[0].toUpperCase() + p.slice(1) }));
const position = ref<DockPosition>("bottom");
const tool = ref("select");
const tools = [
  { id: "select", label: "Select", key: "V", icon: "mouse-pointer" },
  { id: "hand", label: "Hand", key: "H", icon: "hand" },
  { id: "rect", label: "Rectangle", key: "R", icon: "square" },
  { id: "diamond", label: "Decision", key: "D", icon: "diamond" },
  { id: "connector", label: "Connector", key: "C", icon: "spline" },
  { id: "text", label: "Text", key: "T", icon: "type" },
  { id: "note", label: "Sticky note", key: "N", icon: "sticky-note" },
] as const;
</script>

<template>
  <div class="demo-stack" style="width: 100%">
    <SoneSegmented v-model="position" size="sm" aria-label="Dock position" :options="positions" />
    <div style="position: relative; height: 24rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg); background: var(--surface-base)">
      <SoneDock :position="position" aria-label="Drawing tools">
        <SoneDockItem v-for="t in tools" :key="t.id" :label="t.label" :shortcut="t.key" :active="tool === t.id" @click="tool = t.id">
          <SoneIcon :icon="t.icon" />
        </SoneDockItem>
        <SoneDockSeparator />
        <SoneDockItem label="Undo" shortcut="Ctrl+Z"><SoneIcon icon="undo" /></SoneDockItem>
        <SoneDockItem label="Redo" shortcut="Ctrl+Shift+Z"><SoneIcon icon="redo" /></SoneDockItem>
      </SoneDock>
    </div>
    <p class="text-hint">Tool: {{ tool }} · Tab into the dock, then use the arrow keys.</p>
  </div>
</template>
