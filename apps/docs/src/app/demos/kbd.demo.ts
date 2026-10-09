import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SoneKbdComponent,
  SoneKbdGroupComponent,
} from "@surface-one/angular/kbd";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: center">
    <sone-kbd>esc</sone-kbd>
    <sone-kbd-group><sone-kbd>⌘</sone-kbd><sone-kbd>K</sone-kbd></sone-kbd-group>
    <sone-kbd-group><sone-kbd>Ctrl</sone-kbd><span>+</span><sone-kbd>B</sone-kbd></sone-kbd-group>
  </div>
  <p style="margin: 0; color: var(--text-secondary)">
    Press <sone-kbd-group><sone-kbd>⌘</sone-kbd><sone-kbd>K</sone-kbd></sone-kbd-group> to search,
    <sone-kbd>↑</sone-kbd> <sone-kbd>↓</sone-kbd> to move and <sone-kbd>esc</sone-kbd> to close.
  </p>
  <div class="demo-row">
    <button soneBtn variant="outline" size="sm" type="button">Accept <sone-kbd>↵</sone-kbd></button>
    <button soneBtn variant="ghost" size="sm" type="button">Cancel <sone-kbd>esc</sone-kbd></button>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneButton, SoneKbd, SoneKbdGroup } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneKbd>esc</SoneKbd>
      <SoneKbdGroup><SoneKbd>⌘</SoneKbd><SoneKbd>K</SoneKbd></SoneKbdGroup>
      <SoneKbdGroup><SoneKbd>Ctrl</SoneKbd><span>+</span><SoneKbd>B</SoneKbd></SoneKbdGroup>
    </div>
    <p style="margin: 0; color: var(--text-secondary)">
      Press <SoneKbdGroup><SoneKbd>⌘</SoneKbd><SoneKbd>K</SoneKbd></SoneKbdGroup> to search,
      <SoneKbd>↑</SoneKbd> <SoneKbd>↓</SoneKbd> to move and <SoneKbd>esc</SoneKbd> to close.
    </p>
    <div class="demo-row">
      <SoneButton variant="outline" size="sm" type="button">Accept <SoneKbd>↵</SoneKbd></SoneButton>
      <SoneButton variant="ghost" size="sm" type="button">Cancel <SoneKbd>esc</SoneKbd></SoneButton>
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-kbd-demo",
  imports: [SoneKbdComponent, SoneKbdGroupComponent, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class KbdDemo {}
