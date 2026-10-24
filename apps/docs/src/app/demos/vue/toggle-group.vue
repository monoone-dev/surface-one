<script setup lang="ts">
import { ref } from "vue";
import {
  SoneIcon,
  SoneTabsList,
  SoneTabsTrigger,
  SoneToggle,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "@surface-one/vue";

const view = ref<string | readonly string[] | null>("List");
const pinned = ref(true);
const locked = ref(false);
const tab = ref("Overview");
const dest = ref("Existing folder");
const kind = ref("Folder");
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <!-- type="single": the group presses the item whose value matches v-model -->
      <SoneToggleGroup v-model="view" variant="outline" type="single" aria-label="View">
        <SoneToggleGroupItem v-for="v in ['List', 'Board', 'Calendar']" :key="v" type="button" :value="v">
          {{ v }}
        </SoneToggleGroupItem>
      </SoneToggleGroup>
      <SoneToggle variant="outline" type="button" :pressed="pinned" @click="pinned = !pinned">
        <SoneIcon icon="star" inline="start" /> Pinned
      </SoneToggle>
      <SoneToggle type="button" aria-label="Lock editing" :pressed="locked" @click="locked = !locked">
        <SoneIcon icon="lock" />
      </SoneToggle>
    </div>
    <div style="display: grid; gap: var(--space-3)">
      <SoneTabsList role="tablist" aria-label="Project">
        <SoneTabsTrigger
          v-for="t in ['Overview', 'Activity', 'Settings']"
          :id="'demo-tab-' + t"
          :key="t"
          role="tab"
          type="button"
          :active="tab === t"
          @click="tab = t"
          >{{ t }}</SoneTabsTrigger
        >
      </SoneTabsList>
      <div role="tabpanel" :aria-labelledby="'demo-tab-' + tab" style="color: var(--text-secondary)">
        {{ tab }} content goes here.
      </div>
    </div>
    <div style="display: grid; gap: var(--space-3); max-width: 24rem">
      <SoneToggleGroup variant="dashed" size="sm" :spacing="2" stretch role="group" aria-label="Destination">
        <SoneToggleGroupItem
          v-for="d in ['Existing folder', 'New folder']"
          :key="d"
          type="button"
          :pressed="dest === d"
          @click="dest = d"
          >{{ d }}</SoneToggleGroupItem
        >
      </SoneToggleGroup>
      <SoneTabsList stretch aria-label="Kind">
        <SoneTabsTrigger
          v-for="k in ['Folder', 'Workspace']"
          :key="k"
          type="button"
          :active="kind === k"
          @click="kind = k"
          >{{ k }}</SoneTabsTrigger
        >
      </SoneTabsList>
    </div>
  </div>
</template>
