import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneSearchFieldComponent } from "@surface-one/angular/search-field";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <sone-search-field
    [(value)]="query"
    clearable
    placeholder="Search notes"
    ariaLabel="Search notes"
    (submit)="submitted.set($event)"
  />
  <p role="status" style="margin: 0; color: var(--text-secondary)">
    Searched for: {{ submitted() || "nothing yet" }}
  </p>

  <sone-search-field size="sm" placeholder="Filter" ariaLabel="Filter sources" />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import { SoneSearchField } from "@surface-one/vue";

const query = ref("");
const submitted = ref("");
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <SoneSearchField
      v-model="query"
      clearable
      placeholder="Search notes"
      aria-label="Search notes"
      @submit="submitted = $event"
    />
    <p role="status" style="margin: 0; color: var(--text-secondary)">
      Searched for: {{ submitted || "nothing yet" }}
    </p>

    <SoneSearchField size="sm" placeholder="Filter" aria-label="Filter sources" />
  </div>
</template>
`;

@Component({
  selector: "docs-search-field-demo",
  imports: [SoneSearchFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SearchFieldDemo {
  readonly query = signal("");
  readonly submitted = signal("");
}
