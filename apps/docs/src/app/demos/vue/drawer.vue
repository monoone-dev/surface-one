<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneDrawer,
  SoneDrawerDescription,
  SoneDrawerFooter,
  SoneDrawerHeader,
  SoneDrawerTitle,
} from "@surface-one/vue";

const open = ref(false);
const snapped = ref(false);
const snap = ref<number | null>(0.4);
const goal = ref(350);
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
</script>

<template>
  <div class="demo-row">
    <SoneButton variant="outline" type="button" @click="open = true">Open drawer</SoneButton>
    <SoneButton variant="outline" type="button" @click="snapped = true">Open with snap points</SoneButton>
  </div>

  <SoneDrawer v-model:open="open">
    <SoneDrawerHeader>
      <SoneDrawerTitle>Move goal</SoneDrawerTitle>
      <SoneDrawerDescription>Set your daily activity goal.</SoneDrawerDescription>
    </SoneDrawerHeader>
    <div class="demo-row" style="justify-content: center">
      <SoneButton variant="outline" size="icon" type="button" aria-label="Decrease" @click="goal -= 10">−</SoneButton>
      <strong style="font-size: var(--font-size-3xl); min-width: 6ch; text-align: center">{{ goal }}</strong>
      <SoneButton variant="outline" size="icon" type="button" aria-label="Increase" @click="goal += 10">+</SoneButton>
    </div>
    <SoneDrawerFooter>
      <SoneButton type="button" @click="open = false">Submit</SoneButton>
      <SoneButton variant="outline" type="button" @click="open = false">Cancel</SoneButton>
    </SoneDrawerFooter>
  </SoneDrawer>

  <SoneDrawer v-model:open="snapped" v-model:active-snap-point="snap" :snap-points="[0.4, 1]">
    <SoneDrawerHeader>
      <SoneDrawerTitle>Activity</SoneDrawerTitle>
      <SoneDrawerDescription>Drag the handle up for the whole week, down to close.</SoneDrawerDescription>
    </SoneDrawerHeader>
    <ul style="margin: 0; padding-inline: var(--space-6)">
      <li v-for="day in days" :key="day">{{ day }}: 30 minutes</li>
    </ul>
  </SoneDrawer>
</template>
