import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneSeparatorDirective } from "@surface-one/angular/separator";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <div>
    <strong>SurfaceOne</strong>
    <p style="margin: var(--space-1) 0 0; color: var(--text-secondary)">An Angular component library.</p>
  </div>
  <div soneSeparator></div>
  <div class="demo-row" style="height: 20px; color: var(--text-secondary)">
    <span>Docs</span>
    <span soneSeparator orientation="vertical"></span>
    <span>Components</span>
    <span soneSeparator orientation="vertical"></span>
    <span>Changelog</span>
  </div>
  <hr soneSeparator [decorative]="false" />
  <span style="color: var(--text-secondary)">A non-decorative separator is announced to screen readers.</span>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneSeparator } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <div>
      <strong>SurfaceOne</strong>
      <p style="margin: var(--space-1) 0 0; color: var(--text-secondary)">An Angular component library.</p>
    </div>
    <SoneSeparator />
    <div class="demo-row" style="height: 20px; color: var(--text-secondary)">
      <span>Docs</span>
      <SoneSeparator as="span" orientation="vertical" />
      <span>Components</span>
      <SoneSeparator as="span" orientation="vertical" />
      <span>Changelog</span>
    </div>
    <SoneSeparator as="hr" :decorative="false" />
    <span style="color: var(--text-secondary)">A non-decorative separator is announced to screen readers.</span>
  </div>
</template>
`;

@Component({
  selector: "docs-separator-demo",
  imports: [SoneSeparatorDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SeparatorDemo {}
