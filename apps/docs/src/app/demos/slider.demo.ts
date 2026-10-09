import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneSliderComponent } from "@surface-one/angular/slider";

const TEMPLATE = `<div class="demo-stack" style="max-width: 22rem">
  <div style="display: grid; gap: var(--space-2)">
    <span style="color: var(--text-secondary)">Volume: {{ volume() }}%</span>
    <sone-slider [(value)]="volume" ariaLabel="Volume" />
  </div>
  <div style="display: grid; gap: var(--space-2)">
    <span style="color: var(--text-secondary)">Rating: {{ rating() }} of 10</span>
    <sone-slider [(value)]="rating" [min]="0" [max]="10" [step]="1" ariaLabel="Rating" />
  </div>
  <sone-slider [value]="60" [disabled]="true" ariaLabel="Brightness (locked)" />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import { SoneSlider } from "@surface-one/vue";

const volume = ref(40);
const rating = ref(7);
</script>

<template>
  <div class="demo-stack" style="max-width: 22rem">
    <div style="display: grid; gap: var(--space-2)">
      <span style="color: var(--text-secondary)">Volume: {{ volume }}%</span>
      <SoneSlider v-model="volume" aria-label="Volume" />
    </div>
    <div style="display: grid; gap: var(--space-2)">
      <span style="color: var(--text-secondary)">Rating: {{ rating }} of 10</span>
      <SoneSlider v-model="rating" :min="0" :max="10" :step="1" aria-label="Rating" />
    </div>
    <SoneSlider :model-value="60" disabled aria-label="Brightness (locked)" />
  </div>
</template>
`;

@Component({
  selector: "docs-slider-demo",
  imports: [SoneSliderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SliderDemo {
  readonly volume = signal(40);
  readonly rating = signal(7);
}
