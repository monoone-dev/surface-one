import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneProgressComponent } from "@surface-one/angular/progress";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <div class="demo-stack" style="gap: var(--space-2)">
    <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm)">
      <span>Downloading model</span>
      <span style="color: var(--text-secondary)">{{ value() }}%</span>
    </div>
    <sone-progress [value]="value()" ariaLabel="Model download" />
  </div>
  <div class="demo-row">
    <button soneBtn variant="outline" size="sm" type="button" [disabled]="value() === 0" (click)="step(-20)">−20%</button>
    <button soneBtn variant="outline" size="sm" type="button" [disabled]="done()" (click)="step(20)">+20%</button>
  </div>
  <sone-progress size="md" tone="warning" [value]="80" ariaLabel="Storage, nearing the limit" />
  <sone-progress size="md" tone="destructive" [value]="97" ariaLabel="Storage, over the limit" />
  <!-- No value: indeterminate, busy for an unknown amount of time -->
  <sone-progress ariaLabel="Re-indexing notes" />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { computed, ref } from "vue";
import { SoneButton, SoneProgress } from "@surface-one/vue";

const value = ref(40);
const done = computed(() => value.value >= 100);
const step = (delta: number) => {
  value.value = Math.min(100, Math.max(0, value.value + delta));
};
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <div class="demo-stack" style="gap: var(--space-2)">
      <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm)">
        <span>Downloading model</span>
        <span style="color: var(--text-secondary)">{{ value }}%</span>
      </div>
      <SoneProgress :value="value" aria-label="Model download" />
    </div>
    <div class="demo-row">
      <SoneButton variant="outline" size="sm" type="button" :disabled="value === 0" @click="step(-20)">−20%</SoneButton>
      <SoneButton variant="outline" size="sm" type="button" :disabled="done" @click="step(20)">+20%</SoneButton>
    </div>
    <SoneProgress size="md" tone="warning" :value="80" aria-label="Storage, nearing the limit" />
    <SoneProgress size="md" tone="destructive" :value="97" aria-label="Storage, over the limit" />
    <!-- No value: indeterminate, busy for an unknown amount of time -->
    <SoneProgress aria-label="Re-indexing notes" />
  </div>
</template>
`;

@Component({
  selector: "docs-progress-demo",
  imports: [SoneProgressComponent, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ProgressDemo {
  readonly value = signal(40);
  readonly done = computed(() => this.value() >= 100);

  step(delta: number): void {
    this.value.update((v) => Math.min(100, Math.max(0, v + delta)));
  }
}
