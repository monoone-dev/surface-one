import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: center">
    <sone-avatar size="sm"><span soneAvatarFallback>AP</span></sone-avatar>
    <sone-avatar><span soneAvatarFallback>SL</span></sone-avatar>
    <sone-avatar size="lg"><span soneAvatarFallback>KM</span></sone-avatar>
    <!-- No image and no fallback: the signed-out person glyph -->
    <sone-avatar />
  </div>
  <div class="demo-row" style="align-items: center">
    <sone-avatar><span soneAvatarFallback>AP</span></sone-avatar>
    <div>
      <div>Ada Park</div>
      <div style="color: var(--text-secondary); font-size: var(--font-size-sm)">Product design</div>
    </div>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneAvatar, SoneAvatarFallback } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneAvatar size="sm"><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar>
      <SoneAvatar><SoneAvatarFallback>SL</SoneAvatarFallback></SoneAvatar>
      <SoneAvatar size="lg"><SoneAvatarFallback>KM</SoneAvatarFallback></SoneAvatar>
      <!-- No image and no fallback: the signed-out person glyph -->
      <SoneAvatar />
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneAvatar><SoneAvatarFallback>AP</SoneAvatarFallback></SoneAvatar>
      <div>
        <div>Ada Park</div>
        <div style="color: var(--text-secondary); font-size: var(--font-size-sm)">Product design</div>
      </div>
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-avatar-demo",
  imports: [...SONE_AVATAR_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class AvatarDemo {}
