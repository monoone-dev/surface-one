import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneCopyButtonComponent } from "@surface-one/angular/copy-button";

const TEMPLATE = `<div class="demo-row" style="align-items: center">
  <sone-copy-button value="npm install @surface-one/angular" />
  <sone-copy-button value="mtg_01J9ZK3Q7R4M2" label="Copy meeting ID" iconOnly variant="ghost" />
  <sone-copy-button value="{ &quot;mcpServers&quot;: {} }" label="Copy config" variant="secondary" />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneCopyButton } from "@surface-one/vue";
</script>

<template>
  <div class="demo-row" style="align-items: center">
    <SoneCopyButton value="npm install @surface-one/vue" />
    <SoneCopyButton value="mtg_01J9ZK3Q7R4M2" label="Copy meeting ID" icon-only variant="ghost" />
    <SoneCopyButton value='{ "mcpServers": {} }' label="Copy config" variant="secondary" />
  </div>
</template>
`;

@Component({
  selector: "docs-copy-button-demo",
  imports: [SoneCopyButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CopyButtonDemo {}
