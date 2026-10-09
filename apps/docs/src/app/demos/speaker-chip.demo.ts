import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SoneSpeakerChipComponent } from "@surface-one/angular/speaker-chip";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row" style="align-items: center">
    <sone-speaker-chip speaker="me" />
    <sone-speaker-chip speaker="others" />
    <sone-speaker-chip speaker="others-0" />
    <sone-speaker-chip speaker="others-1" />
  </div>
  <div class="demo-row" style="align-items: center">
    <sone-speaker-chip speaker="others-0" label="Ada Park" />
    <sone-speaker-chip speaker="me" size="sm" />
    <sone-speaker-chip speaker="speaker-3" size="sm" />
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { SoneSpeakerChip } from "@surface-one/vue";
</script>

<template>
  <div class="demo-stack">
    <div class="demo-row" style="align-items: center">
      <SoneSpeakerChip speaker="me" />
      <SoneSpeakerChip speaker="others" />
      <SoneSpeakerChip speaker="others-0" />
      <SoneSpeakerChip speaker="others-1" />
    </div>
    <div class="demo-row" style="align-items: center">
      <SoneSpeakerChip speaker="others-0" label="Ada Park" />
      <SoneSpeakerChip speaker="me" size="sm" />
      <SoneSpeakerChip speaker="speaker-3" size="sm" />
    </div>
  </div>
</template>
`;

@Component({
  selector: "docs-speaker-chip-demo",
  imports: [SoneSpeakerChipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SpeakerChipDemo {}
