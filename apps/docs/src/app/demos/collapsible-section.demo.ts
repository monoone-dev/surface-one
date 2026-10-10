import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_COLLAPSIBLE_SECTION_PARTS } from "@surface-one/angular/collapsible-section";

const TEMPLATE = `<div class="demo-stack" style="max-width: 30rem">
  <sone-collapsible-section
    title="Action items"
    subtitle="From the last 3 meetings"
    [count]="items.length"
    [(open)]="open"
  >
    <button soneCollapsibleSectionActions soneBtn variant="ghost" size="xs" type="button">
      Copy
    </button>
    <ul style="margin: 0; color: var(--text-secondary)">
      @for (item of items; track item) {
        <li>{{ item }}</li>
      }
    </ul>
  </sone-collapsible-section>

  <sone-collapsible-section title="Audit trail" [count]="12">
    <p style="margin: 0; color: var(--text-secondary)">Every read of a locked note, newest first.</p>
  </sone-collapsible-section>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import { SoneButton, SoneCollapsibleSection } from "@surface-one/vue";

const open = ref(true);
const items = [
  "Ada Park: share the launch checklist",
  "Sam Lee: review the pricing page copy",
  "Kai Moreno: book the design review",
];
</script>

<template>
  <div class="demo-stack" style="max-width: 30rem">
    <SoneCollapsibleSection
      v-model:open="open"
      title="Action items"
      subtitle="From the last 3 meetings"
      :count="items.length"
    >
      <template #actions>
        <SoneButton variant="ghost" size="xs" type="button">Copy</SoneButton>
      </template>
      <ul style="margin: 0; color: var(--text-secondary)">
        <li v-for="item in items" :key="item">{{ item }}</li>
      </ul>
    </SoneCollapsibleSection>

    <SoneCollapsibleSection title="Audit trail" :count="12">
      <p style="margin: 0; color: var(--text-secondary)">Every read of a locked note, newest first.</p>
    </SoneCollapsibleSection>
  </div>
</template>
`;

@Component({
  selector: "docs-collapsible-section-demo",
  imports: [SoneButtonDirective, ...SONE_COLLAPSIBLE_SECTION_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CollapsibleSectionDemo {
  readonly open = signal(true);
  readonly items = [
    "Ada Park: share the launch checklist",
    "Sam Lee: review the pricing page copy",
    "Kai Moreno: book the design review",
  ];
}
