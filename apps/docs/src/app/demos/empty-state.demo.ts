import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_EMPTY_PARTS,
  SoneEmptyStateComponent,
} from "@surface-one/angular/empty-state";
import { SoneIconComponent } from "@surface-one/angular/icon";

const TEMPLATE = `<sone-empty-state>
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
</sone-empty-state>`;

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
