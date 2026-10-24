<script setup lang="ts">
import { ref } from "vue";
import {
  SoneCard,
  SoneCarousel,
  SoneCarouselContent,
  SoneCarouselDots,
  SoneCarouselItem,
  SoneCarouselNext,
  SoneCarouselPrevious,
} from "@surface-one/vue";

const index = ref(0);
const slides = [
  { title: "Tokens", text: "Every colour and step has a name." },
  { title: "Skins", text: "Six looks, light and dark." },
  { title: "Accents", text: "One palette across the brand." },
  { title: "Twins", text: "Angular, Vue and React alike." },
];
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem; width: 100%">
    <SoneCarousel v-model:index="index" aria-label="Release highlights" loop>
      <SoneCarouselContent>
        <SoneCarouselItem v-for="slide in slides" :key="slide.title">
          <SoneCard style="display: grid; place-content: center; gap: var(--space-1); aspect-ratio: 4 / 3; text-align: center">
            <strong style="font-size: var(--font-size-2xl)">{{ slide.title }}</strong>
            <span style="color: var(--text-secondary)">{{ slide.text }}</span>
          </SoneCard>
        </SoneCarouselItem>
      </SoneCarouselContent>
      <SoneCarouselPrevious />
      <SoneCarouselNext />
      <SoneCarouselDots />
    </SoneCarousel>
    <p style="margin: 0; color: var(--text-secondary); text-align: center">Slide {{ index + 1 }} of {{ slides.length }}</p>
  </div>
</template>
