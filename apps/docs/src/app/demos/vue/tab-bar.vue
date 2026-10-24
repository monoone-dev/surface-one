<script setup lang="ts">
import { ref } from "vue";
import { SoneTabBar, type TabBarItem } from "@surface-one/vue";

const tab = ref("home");
const items: TabBarItem[] = [
  { value: "home", label: "Home", icon: "dashboards" },
  { value: "search", label: "Search", icon: "search" },
  { value: "inbox", label: "Inbox", icon: "bell" },
  { value: "profile", label: "Profile", icon: "user" },
];
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <SoneTabBar v-model="tab" aria-label="Demo app" :items="items" />
    <SoneTabBar
      v-model="tab"
      aria-label="Demo app, full width"
      :items="items"
      :floating="false"
      labels="always"
    />
    <p class="text-hint">Active tab: {{ tab }}</p>
  </div>
</template>
