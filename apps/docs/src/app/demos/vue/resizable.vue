<script setup lang="ts">
import { ref } from "vue";
import { SoneResizableGroup, SoneResizableHandle, SoneResizablePanel } from "@surface-one/vue";

const sizes = ref<number[]>([]);
</script>

<template>
  <div class="demo-stack" style="max-width: 32rem; width: 100%">
    <SoneResizableGroup
      v-model:sizes="sizes"
      style="height: 14rem; border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg)"
    >
      <SoneResizablePanel :default-size="30" :min-size="15" collapsible>
        <div style="display: grid; place-items: center; height: 100%; font-weight: var(--font-weight-semibold)">Sidebar</div>
      </SoneResizablePanel>
      <SoneResizableHandle with-handle />
      <SoneResizablePanel :default-size="70" :min-size="30">
        <SoneResizableGroup direction="vertical">
          <SoneResizablePanel :default-size="60">
            <div style="display: grid; place-items: center; height: 100%; font-weight: var(--font-weight-semibold)">Content</div>
          </SoneResizablePanel>
          <SoneResizableHandle />
          <SoneResizablePanel :default-size="40">
            <div style="display: grid; place-items: center; height: 100%; font-weight: var(--font-weight-semibold)">Console</div>
          </SoneResizablePanel>
        </SoneResizableGroup>
      </SoneResizablePanel>
    </SoneResizableGroup>
    <p style="margin: 0; color: var(--text-secondary)">Sidebar: {{ Math.round(sizes[0] ?? 30) }}%</p>
  </div>
</template>
