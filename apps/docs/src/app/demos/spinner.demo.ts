import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="gap: var(--space-5); color: var(--text-secondary)">
    <sone-spinner [size]="12" />
    <sone-spinner />
    <sone-spinner [size]="24" />
    <sone-spinner [size]="40" label="Loading results" />
  </div>
  <div class="demo-row">
    <button soneBtn type="button" size="sm" disabled>
      <sone-spinner [label]="null" /> Saving…
    </button>
    <button soneBtn type="button" variant="outline" size="sm" disabled>
      <sone-spinner [label]="null" /> Please wait
    </button>
    <span soneBadge variant="secondary"><sone-spinner [size]="12" [label]="null" /> Syncing</span>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneBadge, SoneButton, SoneSpinner } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="gap: var(--space-5); color: var(--text-secondary)">
      <SoneSpinner :size="12" />
      <SoneSpinner />
      <SoneSpinner :size="24" />
      <SoneSpinner :size="40" label="Loading results" />
    </div>
    <div class="demo-row">
      <SoneButton type="button" size="sm" disabled>
        <SoneSpinner :label="null" /> Saving…
      </SoneButton>
      <SoneButton type="button" variant="outline" size="sm" disabled>
        <SoneSpinner :label="null" /> Please wait
      </SoneButton>
      <SoneBadge variant="secondary"><SoneSpinner :size="12" :label="null" /> Syncing</SoneBadge>
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-spinner-demo",
  imports: [SoneSpinnerComponent, SoneButtonDirective, SoneBadgeDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SpinnerDemo {}
