import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SONE_BADGE_PARTS } from "@surface-one/angular/badge";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: center">
    <span soneBadge>Default</span>
    <span soneBadge variant="secondary">Secondary</span>
    <span soneBadge variant="outline">Outline</span>
    <span soneBadge variant="ghost">Ghost</span>
    <span soneBadge variant="destructive">Destructive</span>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="live" dot>Recording</span>
    <span soneBadge variant="accent" dot>Transcribed</span>
    <span soneBadge variant="success" dot>Exported</span>
    <span soneBadge variant="warning" dot>Paused</span>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="secondary">3</span>
    <span soneBadge variant="destructive">99+</span>
    <button soneBadge variant="outline" type="button">Filter: Design</button>
  </div>
  <div class="demo-row" style="align-items: center">
    <span soneBadge variant="secondary">
      design
      <button soneBadgeRemove aria-label="Remove design"><sone-icon icon="close" /></button>
    </span>
    <span soneBadge variant="accent">
      roadmap
      <button soneBadgeRemove aria-label="Remove roadmap"><sone-icon icon="close" /></button>
    </span>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneBadge, SoneBadgeRemove, SoneIcon } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneBadge>Default</SoneBadge>
      <SoneBadge variant="secondary">Secondary</SoneBadge>
      <SoneBadge variant="outline">Outline</SoneBadge>
      <SoneBadge variant="ghost">Ghost</SoneBadge>
      <SoneBadge variant="destructive">Destructive</SoneBadge>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneBadge variant="live" dot>Recording</SoneBadge>
      <SoneBadge variant="accent" dot>Transcribed</SoneBadge>
      <SoneBadge variant="success" dot>Exported</SoneBadge>
      <SoneBadge variant="warning" dot>Paused</SoneBadge>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneBadge variant="secondary">3</SoneBadge>
      <SoneBadge variant="destructive">99+</SoneBadge>
      <SoneBadge as="button" variant="outline" type="button">Filter: Design</SoneBadge>
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneBadge variant="secondary">
        design
        <SoneBadgeRemove aria-label="Remove design"><SoneIcon icon="close" /></SoneBadgeRemove>
      </SoneBadge>
      <SoneBadge variant="accent">
        roadmap
        <SoneBadgeRemove aria-label="Remove roadmap"><SoneIcon icon="close" /></SoneBadgeRemove>
      </SoneBadge>
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-badge-demo",
  imports: [...SONE_BADGE_PARTS, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class BadgeDemo {}
