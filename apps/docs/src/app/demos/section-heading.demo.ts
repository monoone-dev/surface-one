import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_SECTION_HEADING_PARTS } from "@surface-one/angular/section-heading";

const TEMPLATE = `<div class="demo-stack" style="max-width: 36rem">
  <sone-section-heading title="Meetings" [count]="24">
    <button soneSectionHeadingActions soneBtn variant="outline" size="sm" type="button">
      New meeting
    </button>
  </sone-section-heading>
  <sone-section-heading title="Pinned" [level]="3" [count]="3" />
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneButton, SoneSectionHeading } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack" style="max-width: 36rem">
    <SoneSectionHeading title="Meetings" :count="24">
      <template #actions>
        <SoneButton variant="outline" size="sm" type="button">New meeting</SoneButton>
      </template>
    </SoneSectionHeading>
    <SoneSectionHeading title="Pinned" :level="3" :count="3" />
  </div>
</template>
`;

@Component({
  selector: "docs-section-heading-demo",
  imports: [SoneButtonDirective, ...SONE_SECTION_HEADING_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SectionHeadingDemo {}
