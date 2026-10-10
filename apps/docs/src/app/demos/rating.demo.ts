import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneRatingComponent } from "@surface-one/angular/rating";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <sone-rating [value]="4.5" readonly size="sm" ariaLabel="Average rating" />
    <span class="text-hint">4.5 · 128 reviews</span>
  </div>
  <div soneField>
    <span soneFieldLabel id="demo-rating-label">Your rating</span>
    <sone-rating [(value)]="score" clearable ariaLabel="Your rating" />
    <p soneFieldDescription>{{ score() ? score() + ' of 5' : 'Not rated yet' }} · choose the same star again to clear.</p>
  </div>
  <div class="demo-row">
    <sone-rating [value]="3" readonly size="sm" />
    <sone-rating [value]="3" readonly />
    <sone-rating [value]="3" readonly size="lg" />
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import { SoneField, SoneFieldDescription, SoneFieldLabel, SoneRating } from "@surface-one/vue";

const score = ref(0);
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <SoneRating :model-value="4.5" readonly size="sm" aria-label="Average rating" />
      <span class="text-hint">4.5 · 128 reviews</span>
    </div>
    <SoneField>
      <SoneFieldLabel as="span">Your rating</SoneFieldLabel>
      <SoneRating v-model="score" clearable aria-label="Your rating" />
      <SoneFieldDescription>{{ score ? score + " of 5" : "Not rated yet" }} · choose the same star again to clear.</SoneFieldDescription>
    </SoneField>
    <div class="demo-row">
      <SoneRating :model-value="3" readonly size="sm" />
      <SoneRating :model-value="3" readonly />
      <SoneRating :model-value="3" readonly size="lg" />
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-rating-demo",
  imports: [SoneRatingComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class RatingDemo {
  readonly score = signal(0);
}
