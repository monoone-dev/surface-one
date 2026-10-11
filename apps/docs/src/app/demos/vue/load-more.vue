<script setup lang="ts">
import { computed, ref } from "vue";
import { SoneLoadMore } from "@surface-one/vue";

const TOTAL = 9;
const count = ref(3);
const busy = ref(false);
const remaining = computed(() => TOTAL - count.value);

function load(): void {
  busy.value = true;
  setTimeout(() => {
    count.value = Math.min(TOTAL, count.value + 3);
    busy.value = false;
  }, 600);
}
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <ul style="margin: 0; color: var(--text-secondary)">
      <li v-for="n in count" :key="n">Meeting {{ n }}</li>
    </ul>
    <SoneLoadMore :busy="busy" :remaining="remaining" @load="load" />

    <SoneLoadMore error="The next page could not be loaded." />
  </div>
</template>
