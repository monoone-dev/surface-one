import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from "@angular/core";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SonePasswordInputComponent } from "@surface-one/angular/password-input";

const TEMPLATE = `<div class="demo-stack" style="max-width: 24rem">
  <div soneField>
    <label soneFieldLabel for="demo-current-password">Current password</label>
    <sone-password-input inputId="demo-current-password" [(value)]="current" />
  </div>
  <div soneField [invalid]="tooShort()">
    <label soneFieldLabel for="demo-new-password">New password</label>
    <sone-password-input inputId="demo-new-password" autocomplete="new-password"
      placeholder="At least 8 characters" [(value)]="next" [invalid]="tooShort()" />
    @if (tooShort()) {
      <p soneFieldError>Use at least 8 characters.</p>
    } @else {
      <p soneFieldDescription>Other devices are signed out after the change.</p>
    }
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { computed, ref } from "vue";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SonePasswordInput,
} from "@surface-one/vue";

const current = ref("");
const next = ref("");
const tooShort = computed(() => next.value.length > 0 && next.value.length < 8);
</script>

<template>
  <div class="demo-stack" style="max-width: 24rem">
    <SoneField>
      <SoneFieldLabel for="demo-current-password">Current password</SoneFieldLabel>
      <SonePasswordInput v-model="current" input-id="demo-current-password" />
    </SoneField>
    <SoneField :invalid="tooShort">
      <SoneFieldLabel for="demo-new-password">New password</SoneFieldLabel>
      <SonePasswordInput
        v-model="next"
        input-id="demo-new-password"
        autocomplete="new-password"
        placeholder="At least 8 characters"
        :invalid="tooShort"
      />
      <SoneFieldError v-if="tooShort">Use at least 8 characters.</SoneFieldError>
      <SoneFieldDescription v-else>Other devices are signed out after the change.</SoneFieldDescription>
    </SoneField>
  </div>
</template>
`;

/** The same demo with @surface-one/react (React 19 / Next.js). */
export const reactCode = `import { useState } from "react";
import {
  SoneField,
  SoneFieldDescription,
  SoneFieldError,
  SoneFieldLabel,
  SonePasswordInput,
} from "@surface-one/react";

export default function PasswordInputDemo() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const tooShort = next.length > 0 && next.length < 8;
  return (
    <div className="demo-stack" style={{ maxWidth: "24rem" }}>
      <SoneField>
        <SoneFieldLabel htmlFor="demo-current-password">Current password</SoneFieldLabel>
        <SonePasswordInput value={current} onValueChange={setCurrent} inputId="demo-current-password" />
      </SoneField>
      <SoneField invalid={tooShort}>
        <SoneFieldLabel htmlFor="demo-new-password">New password</SoneFieldLabel>
        <SonePasswordInput
          value={next}
          onValueChange={setNext}
          inputId="demo-new-password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          invalid={tooShort}
        />
        {tooShort ? (
          <SoneFieldError>Use at least 8 characters.</SoneFieldError>
        ) : (
          <SoneFieldDescription>Other devices are signed out after the change.</SoneFieldDescription>
        )}
      </SoneField>
    </div>
  );
}
`;

@Component({
  selector: "docs-password-input-demo",
  imports: [SonePasswordInputComponent, ...SONE_FIELD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PasswordInputDemo {
  readonly current = signal("");
  readonly next = signal("");
  readonly tooShort = computed(() => {
    const n = this.next().length;
    return n > 0 && n < 8;
  });
}
