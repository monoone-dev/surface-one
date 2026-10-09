import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneDisclosureComponent } from "@surface-one/angular/disclosure";

const TEMPLATE = `<div class="demo-stack" style="max-width: 30rem">
  <sone-disclosure [(open)]="advancedOpen" panelLabel="Advanced settings">
    <span soneDisclosureSummary>Advanced settings</span>
    <p style="margin: 0; color: var(--text-secondary)">
      Model size, language detection and the silence threshold live here.
    </p>
  </sone-disclosure>
  <sone-disclosure panelLabel="Storage">
    <span soneDisclosureSummary>Storage</span>
    <p style="margin: 0; color: var(--text-secondary)">Retention period and the audio budget.</p>
  </sone-disclosure>
  <sone-disclosure disabled panelLabel="Sync">
    <span soneDisclosureSummary>Sync (unavailable offline)</span>
    <p style="margin: 0">Never shown while disabled.</p>
  </sone-disclosure>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import { SoneDisclosure } from "@surface-one/vue";

const advancedOpen = ref(true);
</script>

<template>
  <div class="demo-stack" style="max-width: 30rem">
    <SoneDisclosure v-model:open="advancedOpen" panel-label="Advanced settings">
      <template #summary>Advanced settings</template>
      <p style="margin: 0; color: var(--text-secondary)">
        Model size, language detection and the silence threshold live here.
      </p>
    </SoneDisclosure>
    <SoneDisclosure panel-label="Storage">
      <template #summary>Storage</template>
      <p style="margin: 0; color: var(--text-secondary)">Retention period and the audio budget.</p>
    </SoneDisclosure>
    <SoneDisclosure disabled panel-label="Sync">
      <template #summary>Sync (unavailable offline)</template>
      <p style="margin: 0">Never shown while disabled.</p>
    </SoneDisclosure>
  </div>
</template>
`;

@Component({
  selector: "docs-disclosure-demo",
  imports: [SoneDisclosureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DisclosureDemo {
  readonly advancedOpen = signal(true);
}
