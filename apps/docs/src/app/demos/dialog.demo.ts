import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_DIALOG_PARTS,
  SoneAlertDialogComponent,
  SoneDialogComponent,
} from "@surface-one/angular/dialog";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import {
  SONE_POPOVER_PARTS,
  SonePopoverTriggerDirective,
} from "@surface-one/angular/menu";

const TEMPLATE = `<div class="demo-row">
  <button soneBtn variant="outline" type="button" (click)="renameOpen.set(true)">Rename note…</button>
  <button soneBtn variant="destructive" type="button" (click)="deleteOpen.set(true)">Delete note…</button>
</div>

@if (renameOpen()) {
  <sone-dialog (dismiss)="renameOpen.set(false)">
    <header soneDialogHeader>
      <h2 soneDialogTitle>Rename note</h2>
      <p soneDialogDescription>The new name shows everywhere this note appears.</p>
    </header>
    <div soneField>
      <label soneFieldLabel for="rename-note">Name</label>
      <input id="rename-note" type="text" value="Q4 planning" data-autofocus="select" />
    </div>
    <div soneField>
      <span soneFieldLabel id="rename-folder-label">Folder</span>
      <button soneBtn variant="outline" type="button" aria-describedby="rename-folder-label"
        [sonePopoverTrigger]="folderPicker">{{ folder() }}</button>
      <ng-template #folderPicker let-close="close">
        <div sonePopover role="dialog" aria-label="Choose a folder">
          @for (f of folders; track f) {
            <button soneBtn variant="ghost" size="sm" type="button" (click)="folder.set(f); close()">{{ f }}</button>
          }
        </div>
      </ng-template>
    </div>
    <footer soneDialogFooter>
      <button soneBtn variant="outline" type="button" (click)="renameOpen.set(false)">Cancel</button>
      <button soneBtn type="button" (click)="renameOpen.set(false)">Save</button>
    </footer>
  </sone-dialog>
}

@if (deleteOpen()) {
  <sone-alert-dialog (dismiss)="deleteOpen.set(false)">
    <header soneDialogHeader>
      <h2 soneDialogTitle>Delete “Q4 planning”?</h2>
      <p soneDialogDescription>The note moves to Trash. You can restore it for 30 days.</p>
    </header>
    <footer soneDialogFooter>
      <button soneBtn variant="outline" type="button" data-autofocus (click)="deleteOpen.set(false)">Cancel</button>
      <button soneBtn variant="destructive" type="button" (click)="deleteOpen.set(false)">Delete</button>
    </footer>
  </sone-alert-dialog>
}`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import {
  SoneAlertDialog,
  SoneButton,
  SoneDialog,
  SoneDialogDescription,
  SoneDialogFooter,
  SoneDialogHeader,
  SoneDialogTitle,
  SoneField,
  SoneFieldLabel,
} from "@surface-one/vue";

const renameOpen = ref(false);
const deleteOpen = ref(false);
</script>

<template>
  <div class="demo-row">
    <SoneButton variant="outline" type="button" @click="renameOpen = true">Rename note…</SoneButton>
    <SoneButton variant="destructive" type="button" @click="deleteOpen = true">Delete note…</SoneButton>
  </div>

  <SoneDialog v-if="renameOpen" @dismiss="renameOpen = false">
    <SoneDialogHeader as="header">
      <SoneDialogTitle>Rename note</SoneDialogTitle>
      <SoneDialogDescription>The new name shows everywhere this note appears.</SoneDialogDescription>
    </SoneDialogHeader>
    <SoneField>
      <SoneFieldLabel for="rename-note">Name</SoneFieldLabel>
      <input id="rename-note" type="text" value="Q4 planning" data-autofocus="select" />
    </SoneField>
    <SoneDialogFooter as="footer">
      <SoneButton variant="outline" type="button" @click="renameOpen = false">Cancel</SoneButton>
      <SoneButton type="button" @click="renameOpen = false">Save</SoneButton>
    </SoneDialogFooter>
  </SoneDialog>

  <SoneAlertDialog v-if="deleteOpen" @dismiss="deleteOpen = false">
    <SoneDialogHeader as="header">
      <SoneDialogTitle>Delete “Q4 planning”?</SoneDialogTitle>
      <SoneDialogDescription>The note moves to Trash. You can restore it for 30 days.</SoneDialogDescription>
    </SoneDialogHeader>
    <SoneDialogFooter as="footer">
      <SoneButton variant="outline" type="button" data-autofocus @click="deleteOpen = false">Cancel</SoneButton>
      <SoneButton variant="destructive" type="button" @click="deleteOpen = false">Delete</SoneButton>
    </SoneDialogFooter>
  </SoneAlertDialog>
</template>
`;

@Component({
  selector: "docs-dialog-demo",
  imports: [
    SoneButtonDirective,
    SoneDialogComponent,
    SoneAlertDialogComponent,
    ...SONE_DIALOG_PARTS,
    ...SONE_FIELD_PARTS,
    ...SONE_POPOVER_PARTS,
    SonePopoverTriggerDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class DialogDemo {
  readonly renameOpen = signal(false);
  readonly deleteOpen = signal(false);
  readonly folders = ["Inbox", "Product", "Design reviews", "1:1s"];
  readonly folder = signal("Product");
}
