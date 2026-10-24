<script setup lang="ts">
import { ref } from "vue";
import {
  SoneCombobox,
  SoneField,
  SoneFieldLabel,
  type SoneComboboxItems,
  type SoneComboboxValue,
} from "@surface-one/vue";

const frameworks: SoneComboboxItems = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix", disabled: true },
  { value: "astro", label: "Astro" },
];
const cities: SoneComboboxItems = [
  {
    label: "Europe",
    options: [
      { value: "warsaw", label: "Warsaw" },
      { value: "lisbon", label: "Lisbon" },
      { value: "krakow", label: "Kraków" },
    ],
  },
  {
    label: "Asia",
    options: [
      { value: "tokyo", label: "Tokyo" },
      { value: "seoul", label: "Seoul" },
    ],
  },
];
const framework = ref<SoneComboboxValue>("nuxt");
const picked = ref<SoneComboboxValue>(["lisbon", "tokyo"]);
</script>

<template>
  <div class="demo-row" style="align-items: flex-start; flex-wrap: wrap; min-height: 20rem">
    <SoneField style="width: 16rem">
      <SoneFieldLabel for="demo-framework">Framework</SoneFieldLabel>
      <SoneCombobox input-id="demo-framework" :options="frameworks" v-model="framework" placeholder="Select a framework" clearable />
    </SoneField>
    <SoneField style="width: 20rem">
      <SoneFieldLabel for="demo-cities">Cities</SoneFieldLabel>
      <SoneCombobox input-id="demo-cities" :options="cities" v-model="picked" multiple placeholder="Add a city" />
    </SoneField>
  </div>
</template>
