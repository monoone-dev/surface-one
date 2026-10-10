import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  signal,
  viewChild,
} from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_CONFIRM_PARTS } from "@surface-one/angular/confirm";

const TEMPLATE = `<div class="demo-stack" style="max-width: 32rem">
  <!-- Inline: render it with @if in place of the button that asked -->
  @if (confirming()) {
    <div
      soneConfirm
      variant="destructive"
      confirmLabel="Delete"
      busyLabel="Deleting…"
      [busy]="busy()"
      (confirm)="remove()"
      (cancel)="close()"
    >
      <p soneConfirmTitle>Delete “Weekly sync”?</p>
      <p soneConfirmDescription>It moves to the trash for 30 days.</p>
    </div>
  } @else {
    <div class="demo-row">
      <button #opener soneBtn variant="outline" type="button" (click)="confirming.set(true)">
        Delete note
      </button>
      <span role="status" style="color: var(--text-secondary)">{{ status() }}</span>
    </div>
  }

  <!-- Card: a bordered panel; extra controls go in soneConfirmActions -->
  <div soneConfirm layout="card" variant="destructive" confirmLabel="Remove lock" [autoFocus]="false">
    <h3 soneConfirmTitle>Remove the lock from “Board”?</h3>
    <p soneConfirmDescription>Its notes are decrypted and stay readable without Touch ID.</p>
    <p soneConfirmError>Touch ID was cancelled. Try again.</p>
  </div>
</div>`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { nextTick, ref } from "vue";
import {
  SoneButton,
  SoneConfirm,
  SoneConfirmDescription,
  SoneConfirmError,
  SoneConfirmTitle,
} from "@surface-one/vue";

const confirming = ref(false);
const busy = ref(false);
const status = ref("");
const opener = ref<InstanceType<typeof SoneButton> | null>(null);

function remove(): void {
  busy.value = true;
  setTimeout(() => {
    busy.value = false;
    status.value = "Deleted";
    close();
  }, 800);
}

async function close(): Promise<void> {
  confirming.value = false;
  // Give focus back to the button that opened it, once it is rendered again.
  await nextTick();
  (opener.value?.$el as HTMLElement | undefined)?.focus();
}
</script>

<template>
  <div class="demo-stack" style="max-width: 32rem">
    <!-- Inline: render it with v-if in place of the button that asked -->
    <SoneConfirm
      v-if="confirming"
      variant="destructive"
      confirm-label="Delete"
      busy-label="Deleting…"
      :busy="busy"
      @confirm="remove"
      @cancel="close"
    >
      <SoneConfirmTitle>Delete “Weekly sync”?</SoneConfirmTitle>
      <SoneConfirmDescription>It moves to the trash for 30 days.</SoneConfirmDescription>
    </SoneConfirm>
    <div v-else class="demo-row">
      <SoneButton ref="opener" variant="outline" type="button" @click="confirming = true">
        Delete note
      </SoneButton>
      <span role="status" style="color: var(--text-secondary)">{{ status }}</span>
    </div>

    <!-- Card: a bordered panel; extra controls go in SoneConfirmActions (or #actions) -->
    <SoneConfirm layout="card" variant="destructive" confirm-label="Remove lock" :auto-focus="false">
      <SoneConfirmTitle as="h3">Remove the lock from “Board”?</SoneConfirmTitle>
      <SoneConfirmDescription>Its notes are decrypted and stay readable without Touch ID.</SoneConfirmDescription>
      <SoneConfirmError>Touch ID was cancelled. Try again.</SoneConfirmError>
    </SoneConfirm>
  </div>
</template>
`;

@Component({
  selector: "docs-confirm-demo",
  imports: [SoneButtonDirective, ...SONE_CONFIRM_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ConfirmDemo {
  readonly confirming = signal(false);
  readonly busy = signal(false);
  readonly status = signal("");
  private readonly opener = viewChild<ElementRef<HTMLButtonElement>>("opener");

  remove(): void {
    this.busy.set(true);
    setTimeout(() => {
      this.busy.set(false);
      this.status.set("Deleted");
      this.close();
    }, 800);
  }

  close(): void {
    this.confirming.set(false);
    // Give focus back to the button that opened it, once it is rendered again.
    setTimeout(() => this.opener()?.nativeElement.focus());
  }
}
