import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneBannerComponent } from "@surface-one/angular/banner";

const TEMPLATE = `<div class="demo-stack" style="max-width: 34rem">
  <sone-banner kind="info">The model download resumes when you’re back online.</sone-banner>
  <sone-banner kind="success">Exported to your notes folder.</sone-banner>
  <sone-banner kind="warning">
    <strong>Live captions stopped.</strong> Recording continues and the full transcript runs after Stop.
  </sone-banner>
  <sone-banner kind="danger">Couldn’t reach the server. Your transcript is safe.</sone-banner>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneBanner } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 34rem">
    <SoneBanner kind="info">The model download resumes when you’re back online.</SoneBanner>
    <SoneBanner kind="success">Exported to your notes folder.</SoneBanner>
    <SoneBanner kind="warning">
      <strong>Live captions stopped.</strong> Recording continues and the full transcript runs after Stop.
    </SoneBanner>
    <SoneBanner kind="danger">Couldn’t reach the server. Your transcript is safe.</SoneBanner>
  </div>
</template>
`;

@Component({
  selector: "docs-banner-demo",
  imports: [SoneBannerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BannerDemo {}
