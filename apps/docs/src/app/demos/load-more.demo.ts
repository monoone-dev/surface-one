import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SoneLoadMoreComponent } from "@surface-one/angular/load-more";

const TOTAL = 9;

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <ul style="margin: 0; color: var(--text-secondary)">
    @for (n of shown(); track n) {
      <li>Meeting {{ n }}</li>
    }
  </ul>
  <sone-load-more [busy]="busy()" [remaining]="remaining()" (load)="load()" />

  <sone-load-more error="The next page could not be loaded." />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
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
`;

@Component({
  selector: "docs-load-more-demo",
  imports: [SoneLoadMoreComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class LoadMoreDemo {
  readonly count = signal(3);
  readonly busy = signal(false);
  readonly shown = computed(() =>
    Array.from({ length: this.count() }, (_, i) => i + 1),
  );
  readonly remaining = computed(() => TOTAL - this.count());

  load(): void {
    this.busy.set(true);
    setTimeout(() => {
      this.count.update((n) => Math.min(TOTAL, n + 3));
      this.busy.set(false);
    }, 600);
  }
}
