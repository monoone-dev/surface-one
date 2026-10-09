import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  SoneButtonDirective,
  SoneButtonGroupDirective,
} from "@surface-one/angular/button";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <button soneBtn type="button">Default</button>
    <button soneBtn type="button" variant="secondary">Secondary</button>
    <button soneBtn type="button" variant="outline">Outline</button>
    <button soneBtn type="button" variant="ghost">Ghost</button>
    <button soneBtn type="button" variant="destructive">Destructive</button>
    <button soneBtn type="button" variant="link">Link</button>
  </div>
  <div class="demo-row">
    <button soneBtn type="button" size="xs">Extra small</button>
    <button soneBtn type="button" size="sm">Small</button>
    <button soneBtn type="button">Default</button>
    <button soneBtn type="button" size="lg">Large</button>
    <button soneBtn type="button" disabled>Disabled</button>
  </div>
  <div soneButtonGroup>
    <button soneBtn type="button" variant="outline">Day</button>
    <button soneBtn type="button" variant="outline">Week</button>
    <button soneBtn type="button" variant="outline">Month</button>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneButton, SoneButtonGroup } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row">
      <SoneButton type="button">Default</SoneButton>
      <SoneButton type="button" variant="secondary">Secondary</SoneButton>
      <SoneButton type="button" variant="outline">Outline</SoneButton>
      <SoneButton type="button" variant="ghost">Ghost</SoneButton>
      <SoneButton type="button" variant="destructive">Destructive</SoneButton>
      <SoneButton type="button" variant="link">Link</SoneButton>
    </div>
    <div class="demo-row">
      <SoneButton type="button" size="xs">Extra small</SoneButton>
      <SoneButton type="button" size="sm">Small</SoneButton>
      <SoneButton type="button">Default</SoneButton>
      <SoneButton type="button" size="lg">Large</SoneButton>
      <SoneButton type="button" disabled>Disabled</SoneButton>
    </div>
    <SoneButtonGroup>
      <SoneButton type="button" variant="outline">Day</SoneButton>
      <SoneButton type="button" variant="outline">Week</SoneButton>
      <SoneButton type="button" variant="outline">Month</SoneButton>
    </SoneButtonGroup>
  </div>
</template>
`;

@Component({
  selector: "docs-button-demo",
  imports: [SoneButtonDirective, SoneButtonGroupDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ButtonDemo {}
