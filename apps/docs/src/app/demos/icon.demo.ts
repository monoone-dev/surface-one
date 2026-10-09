import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: flex-end">
    <sone-icon icon="sparkles" size="xs" />
    <sone-icon icon="sparkles" size="sm" />
    <sone-icon icon="sparkles" size="base" />
    <sone-icon icon="sparkles" size="lg" />
    <sone-icon icon="sparkles" size="xl" />
  </div>
  <div class="demo-row" style="align-items: center">
    <!-- Icons draw in currentColor; give a label only when the icon carries the meaning alone -->
    <span style="color: var(--text-secondary)"><sone-icon icon="lock" label="Locked" /></span>
    <span style="color: var(--danger)"><sone-icon icon="alert-circle" label="Error" /></span>
  </div>
  <div class="demo-row" style="align-items: center">
    <button soneBtn variant="outline" type="button"><sone-icon icon="plus" inline="start" /> New note</button>
    <button soneBtn variant="outline" type="button">Next <sone-icon icon="chevron-right" inline="end" /></button>
    <button soneBtn variant="ghost" size="icon" type="button" aria-label="Search"><sone-icon icon="search" /></button>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneButton, SoneIcon } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: flex-end">
      <SoneIcon icon="sparkles" size="xs" />
      <SoneIcon icon="sparkles" size="sm" />
      <SoneIcon icon="sparkles" size="base" />
      <SoneIcon icon="sparkles" size="lg" />
      <SoneIcon icon="sparkles" size="xl" />
    </div>
    <div class="demo-row" style="align-items: center">
      <!-- Icons draw in currentColor; give a label only when the icon carries the meaning alone -->
      <span style="color: var(--text-secondary)"><SoneIcon icon="lock" label="Locked" /></span>
      <span style="color: var(--danger)"><SoneIcon icon="alert-circle" label="Error" /></span>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneButton variant="outline" type="button"><SoneIcon icon="plus" inline="start" /> New note</SoneButton>
      <SoneButton variant="outline" type="button">Next <SoneIcon icon="chevron-right" inline="end" /></SoneButton>
      <SoneButton variant="ghost" size="icon" type="button" aria-label="Search"><SoneIcon icon="search" /></SoneButton>
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-icon-demo",
  imports: [SoneIconComponent, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class IconDemo {}
