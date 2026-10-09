import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

const TEMPLATE = `<div soneFieldGroup variant="choices" style="max-width: 26rem">
  <div soneField orientation="horizontal">
    <div soneFieldContent>
      <label soneFieldLabel for="demo-captions">Live captions</label>
      <p soneFieldDescription>{{ captions() ? 'On' : 'Off' }} — show text while people speak.</p>
    </div>
    <sone-switch inputId="demo-captions" [(checked)]="captions" />
  </div>
  <div soneField orientation="horizontal">
    <div soneFieldContent>
      <label soneFieldLabel for="demo-compact">Compact layout</label>
      <p soneFieldDescription>Small size, for dense settings lists.</p>
    </div>
    <sone-switch inputId="demo-compact" size="sm" [(checked)]="compact" />
  </div>
  <div soneField orientation="horizontal" disabled>
    <div soneFieldContent>
      <label soneFieldLabel for="demo-sync">Cloud sync</label>
      <p soneFieldDescription>Managed by your administrator.</p>
    </div>
    <sone-switch inputId="demo-sync" checked disabled />
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldContent,
  SoneFieldDescription,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneSwitch,
} from "@surface-one/vue";

const captions = ref(true);
const compact = ref(false);
</script>

<template>
  <SoneFieldGroup variant="choices" style="max-width: 26rem">
    <SoneField orientation="horizontal">
      <SoneFieldContent>
        <SoneFieldLabel for="demo-captions">Live captions</SoneFieldLabel>
        <SoneFieldDescription>{{ captions ? "On" : "Off" }} — show text while people speak.</SoneFieldDescription>
      </SoneFieldContent>
      <SoneSwitch v-model="captions" input-id="demo-captions" />
    </SoneField>
    <SoneField orientation="horizontal">
      <SoneFieldContent>
        <SoneFieldLabel for="demo-compact">Compact layout</SoneFieldLabel>
        <SoneFieldDescription>Small size, for dense settings lists.</SoneFieldDescription>
      </SoneFieldContent>
      <SoneSwitch v-model="compact" input-id="demo-compact" size="sm" />
    </SoneField>
    <SoneField orientation="horizontal" disabled>
      <SoneFieldContent>
        <SoneFieldLabel for="demo-sync">Cloud sync</SoneFieldLabel>
        <SoneFieldDescription>Managed by your administrator.</SoneFieldDescription>
      </SoneFieldContent>
      <SoneSwitch input-id="demo-sync" :model-value="true" disabled />
    </SoneField>
  </SoneFieldGroup>
</template>
`;

@Component({
  selector: "docs-switch-demo",
  imports: [SoneSwitchComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SwitchDemo {
  readonly captions = signal(true);
  readonly compact = signal(false);
}
