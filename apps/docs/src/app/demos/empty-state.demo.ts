import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_EMPTY_PARTS,
  SoneEmptyStateComponent,
} from "@surface-one/angular/empty-state";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<div class="demo-stack">
<sone-empty-state>
  <div soneEmptyHeader>
    <div soneEmptyMedia variant="icon"><sone-icon icon="meetings" /></div>
    <h3 soneEmptyTitle>No meetings yet</h3>
    <p soneEmptyDescription>Record a meeting and it is transcribed right here, on this device.</p>
  </div>
  <div soneEmptyContent>
    <div class="demo-row">
      <button soneBtn type="button">Start recording</button>
      <button soneBtn variant="outline" type="button">Import audio</button>
    </div>
  </div>
</sone-empty-state>

<!-- Composed: icon / title / description / tone draw the header; projected content follows -->
<sone-empty-state
  tone="locked"
  title="This folder is locked"
  description="Its notes and transcripts stay encrypted until you unlock it."
>
  <div soneEmptyContent>
    <button soneBtn type="button">Unlock</button>
    <p class="text-hint">Touch ID unlocks it for this session.</p>
  </div>
</sone-empty-state>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import {
  SoneButton,
  SoneEmpty,
  SoneEmptyContent,
  SoneEmptyDescription,
  SoneEmptyHeader,
  SoneEmptyMedia,
  SoneEmptyTitle,
  SoneIcon,
} from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
  <SoneEmpty>
    <SoneEmptyHeader>
      <SoneEmptyMedia variant="icon"><SoneIcon icon="meetings" /></SoneEmptyMedia>
      <SoneEmptyTitle>No meetings yet</SoneEmptyTitle>
      <SoneEmptyDescription>Record a meeting and it is transcribed right here, on this device.</SoneEmptyDescription>
    </SoneEmptyHeader>
    <SoneEmptyContent>
      <div class="demo-row">
        <SoneButton type="button">Start recording</SoneButton>
        <SoneButton variant="outline" type="button">Import audio</SoneButton>
      </div>
    </SoneEmptyContent>
  </SoneEmpty>

  <!-- Composed: icon / title / description / tone draw the header; the slot follows -->
  <SoneEmpty
    tone="locked"
    title="This folder is locked"
    description="Its notes and transcripts stay encrypted until you unlock it."
  >
    <SoneEmptyContent>
      <SoneButton type="button">Unlock</SoneButton>
      <p class="text-hint">Touch ID unlocks it for this session.</p>
    </SoneEmptyContent>
  </SoneEmpty>
  </div>
</template>
`;

@Component({
  selector: "docs-empty-state-demo",
  imports: [
    SoneEmptyStateComponent,
    ...SONE_EMPTY_PARTS,
    SoneButtonDirective,
    SoneIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class EmptyStateDemo {}
