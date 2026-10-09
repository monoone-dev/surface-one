import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneSelectComponent } from "@surface-one/angular/select";

const TEMPLATE = `<div soneFieldGroup style="max-width: 20rem">
  <div soneField>
    <label soneFieldLabel for="demo-language">Language</label>
    <sone-select selectId="demo-language" [(value)]="language">
      <option value="auto">Detect automatically</option>
      <option value="en">English</option>
      <option value="de">Deutsch</option>
      <option value="fr">Français</option>
    </sone-select>
    <p soneFieldDescription>Selected: {{ language() }}</p>
  </div>
  <div soneField invalid>
    <label soneFieldLabel for="demo-workspace">Workspace</label>
    <sone-select selectId="demo-workspace" invalid value="">
      <option value="">Choose a workspace…</option>
      <option value="team">Team workspace</option>
    </sone-select>
    <p soneFieldError>Pick a workspace to continue.</p>
  </div>
  <div class="demo-row">
    <sone-select size="sm" ariaLabel="Sort order" value="newest">
      <option value="newest">Newest first</option>
      <option value="oldest">Oldest first</option>
    </sone-select>
    <sone-select disabled ariaLabel="Region (locked)" value="eu">
      <option value="eu">Europe</option>
    </sone-select>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneSelect,
} from "@surface-one/vue";

const language = ref("en");
</script>

<template>
  <SoneFieldGroup style="max-width: 20rem">
    <SoneField>
      <SoneFieldLabel for="demo-language">Language</SoneFieldLabel>
      <SoneSelect v-model="language" select-id="demo-language">
        <option value="auto">Detect automatically</option>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="fr">Français</option>
      </SoneSelect>
      <SoneFieldDescription>Selected: {{ language }}</SoneFieldDescription>
    </SoneField>
    <SoneField invalid>
      <SoneFieldLabel for="demo-workspace">Workspace</SoneFieldLabel>
      <SoneSelect select-id="demo-workspace" invalid model-value="">
        <option value="">Choose a workspace…</option>
        <option value="team">Team workspace</option>
      </SoneSelect>
      <SoneFieldError>Pick a workspace to continue.</SoneFieldError>
    </SoneField>
    <div class="demo-row">
      <SoneSelect size="sm" aria-label="Sort order" model-value="newest">
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </SoneSelect>
      <SoneSelect disabled aria-label="Region (locked)" model-value="eu">
        <option value="eu">Europe</option>
      </SoneSelect>
    </div>
  </SoneFieldGroup>
</template>
`;

@Component({
  selector: "docs-select-demo",
  imports: [SoneSelectComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SelectDemo {
  readonly language = signal("en");
}
