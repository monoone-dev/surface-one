import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_COLLAPSIBLE_PARTS } from "@surface-one/angular/collapsible";

const TEMPLATE = `<section soneCollapsible [(expanded)]="open" class="demo-stack" style="max-width: 28rem">
  <button soneCollapsibleTrigger>
    <svg soneCollapsibleIcon viewBox="0 0 16 16" fill="none">
      <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <strong>Action items</strong>
  </button>
  <ul soneCollapsibleContent id="action-items" style="margin: 0; color: var(--text-secondary)">
    <li>Ada Park: share the launch checklist</li>
    <li>Sam Lee: review the pricing page copy</li>
    <li>Kai Moreno: book the design review</li>
  </ul>
</section>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import {
  SoneCollapsible,
  SoneCollapsibleContent,
  SoneCollapsibleIcon,
  SoneCollapsibleTrigger,
} from "@surface-one/vue";

const open = ref(false);
</script>

<template>
  <SoneCollapsible v-model:expanded="open" as="section" class="demo-stack" style="max-width: 28rem">
    <SoneCollapsibleTrigger>
      <SoneCollapsibleIcon as="svg" viewBox="0 0 16 16" fill="none">
        <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </SoneCollapsibleIcon>
      <strong>Action items</strong>
    </SoneCollapsibleTrigger>
    <SoneCollapsibleContent as="ul" id="action-items" style="margin: 0; color: var(--text-secondary)">
      <li>Ada Park: share the launch checklist</li>
      <li>Sam Lee: review the pricing page copy</li>
      <li>Kai Moreno: book the design review</li>
    </SoneCollapsibleContent>
  </SoneCollapsible>
</template>
`;

@Component({
  selector: "docs-collapsible-demo",
  imports: [...SONE_COLLAPSIBLE_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CollapsibleDemo {
  readonly open = signal(false);
}
