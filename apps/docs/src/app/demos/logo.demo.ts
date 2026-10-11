import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneLogoComponent } from "@surface-one/angular/logo";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: flex-end">
    <sone-logo size="xs" />
    <sone-logo size="sm" />
    <sone-logo />
    <sone-logo size="lg" label="SurfaceOne" />
  </div>
  <div class="demo-row" style="align-items: center">
    <!-- kind="mark": the bare mark without the app tile -->
    <sone-logo kind="mark" size="sm" />
    <sone-logo kind="mark" />
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneLogo } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: flex-end">
      <SoneLogo size="xs" />
      <SoneLogo size="sm" />
      <SoneLogo />
      <SoneLogo size="lg" label="SurfaceOne" />
    </div>
    <div class="demo-row" style="align-items: center">
      <!-- kind="mark": the bare mark without the app tile -->
      <SoneLogo kind="mark" size="sm" />
      <SoneLogo kind="mark" />
    </div>
  </div>
</template>
`;

/** The same demo with @surface-one/react (React 19 / Next.js). */
export const reactCode = `import { SoneLogo } from "@surface-one/react";

export default function LogoDemo() {
  return (
    <div className="demo-stack">
      <div className="demo-row" style={{ alignItems: "flex-end" }}>
        <SoneLogo size="xs" />
        <SoneLogo size="sm" />
        <SoneLogo />
        <SoneLogo size="lg" label="SurfaceOne" />
      </div>
      <div className="demo-row" style={{ alignItems: "center" }}>
        {/* kind="mark": the bare mark without the app tile */}
        <SoneLogo kind="mark" size="sm" />
        <SoneLogo kind="mark" />
      </div>
    </div>
  );
}
`;

@Component({
  selector: "docs-logo-demo",
  imports: [SoneLogoComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class LogoDemo {}
