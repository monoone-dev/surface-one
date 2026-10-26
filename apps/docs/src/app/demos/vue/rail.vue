<script setup lang="ts">
import { ref } from "vue";
import { SoneRail, SoneRailButton, SoneRailGroup, type RailBadge, type ShellIcon } from "@surface-one/vue";

const current = ref("home");
const places: { id: string; label: string; icon: ShellIcon; badge: RailBadge | null }[] = [
  { id: "home", label: "Home", icon: "dashboards", badge: null },
  { id: "search", label: "Search", icon: "search", badge: null },
  { id: "runs", label: "Runs, one running", icon: "workflow", badge: "busy" },
  { id: "inbox", label: "Inbox, needs you", icon: "bell", badge: "attention" },
];
</script>

<template>
  <div
    style="display: flex; gap: var(--space-2); height: 22rem; padding: var(--space-2); border-radius: var(--island-radius); background: var(--app-backdrop)"
  >
    <SoneRail aria-label="Demo app">
      <SoneRailGroup>
        <SoneRailButton
          v-for="place in places"
          :key="place.id"
          :icon="place.icon"
          :label="place.label"
          :badge="place.badge"
          :current="current === place.id"
          @click="current = place.id"
        />
      </SoneRailGroup>
      <SoneRailGroup>
        <SoneRailButton icon="settings" label="Settings" :current="current === 'settings'" @click="current = 'settings'" />
      </SoneRailGroup>
    </SoneRail>
    <section
      style="flex: 1; padding: var(--space-4); border-radius: var(--island-radius); background: var(--surface-base); box-shadow: var(--island-shadow)"
    >
      <p class="text-hint">Current place: {{ current }}</p>
    </section>
  </div>
</template>
