import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_PAGE_HEADER_PARTS } from "@surface-one/angular/page-header";

const TEMPLATE = `<div sonePageHeader>
  <div sonePageHeaderContent>
    <p sonePageHeaderEyebrow>Workspace</p>
    <h3 sonePageHeaderTitle>Product planning</h3>
    <p sonePageHeaderDescription>
      Notes, decisions and follow-ups from the weekly planning meeting.
    </p>
  </div>
  <div sonePageHeaderActions>
    <button soneBtn type="button" variant="outline">Share</button>
    <button soneBtn type="button">New note</button>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import {
  SoneButton,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
} from "@surface-one/vue";
</script>

<template>
  <SonePageHeader as="div">
    <SonePageHeaderContent>
      <SonePageHeaderEyebrow>Workspace</SonePageHeaderEyebrow>
      <SonePageHeaderTitle as="h3">Product planning</SonePageHeaderTitle>
      <SonePageHeaderDescription>
        Notes, decisions and follow-ups from the weekly planning meeting.
      </SonePageHeaderDescription>
    </SonePageHeaderContent>
    <SonePageHeaderActions>
      <SoneButton type="button" variant="outline">Share</SoneButton>
      <SoneButton type="button">New note</SoneButton>
    </SonePageHeaderActions>
  </SonePageHeader>
</template>
`;

@Component({
  selector: "docs-page-header-demo",
  imports: [...SONE_PAGE_HEADER_PARTS, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PageHeaderDemo {}
