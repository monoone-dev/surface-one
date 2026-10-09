import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_DIALOG_PARTS } from "@surface-one/angular/dialog";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { type SheetSide, SoneSheetComponent } from "@surface-one/angular/sheet";

const TEMPLATE = `<div class="demo-row">
  @for (side of sides; track side) {
    <button soneBtn variant="outline" type="button" (click)="openSide.set(side)">Open {{ side }}</button>
  }
</div>

@if (openSide(); as side) {
  <sone-sheet [side]="side" (dismiss)="openSide.set(null)">
    <header soneSheetHeader>
      <h2 soneSheetTitle>Edit profile</h2>
      <p soneSheetDescription>Changes are saved when you press Save.</p>
    </header>
    <div class="demo-stack">
      <div soneField>
        <label soneFieldLabel for="sheet-name">Name</label>
        <input id="sheet-name" type="text" value="Ada Park" autofocus />
      </div>
      <div soneField>
        <label soneFieldLabel for="sheet-role">Role</label>
        <input id="sheet-role" type="text" value="Product designer" />
      </div>
    </div>
    <footer soneSheetFooter>
      <button soneBtn variant="outline" type="button" (click)="openSide.set(null)">Cancel</button>
      <button soneBtn type="button" (click)="openSide.set(null)">Save</button>
    </footer>
  </sone-sheet>
}`;

export const code = TEMPLATE;

/** The same demo with @surface-one/vue (Vue 3 / Nuxt). */
export const vueCode = `<script setup lang="ts">
import { ref } from "vue";
import {
  SoneButton,
  SoneField,
  SoneFieldLabel,
  SoneSheet,
  SoneSheetDescription,
  SoneSheetFooter,
  SoneSheetHeader,
  SoneSheetTitle,
  type SheetSide,
} from "@surface-one/vue";

const sides: SheetSide[] = ["right", "left", "bottom"];
const openSide = ref<SheetSide | null>(null);
</script>

<template>
  <div class="demo-row">
    <SoneButton v-for="side in sides" :key="side" variant="outline" type="button" @click="openSide = side">
      Open {{ side }}
    </SoneButton>
  </div>

  <SoneSheet v-if="openSide" :side="openSide" @dismiss="openSide = null">
    <SoneSheetHeader as="header">
      <SoneSheetTitle>Edit profile</SoneSheetTitle>
      <SoneSheetDescription>Changes are saved when you press Save.</SoneSheetDescription>
    </SoneSheetHeader>
    <div class="demo-stack">
      <SoneField>
        <SoneFieldLabel for="sheet-name">Name</SoneFieldLabel>
        <input id="sheet-name" type="text" value="Ada Park" autofocus />
      </SoneField>
      <SoneField>
        <SoneFieldLabel for="sheet-role">Role</SoneFieldLabel>
        <input id="sheet-role" type="text" value="Product designer" />
      </SoneField>
    </div>
    <SoneSheetFooter as="footer">
      <SoneButton variant="outline" type="button" @click="openSide = null">Cancel</SoneButton>
      <SoneButton type="button" @click="openSide = null">Save</SoneButton>
    </SoneSheetFooter>
  </SoneSheet>
</template>
`;

@Component({
  selector: "docs-sheet-demo",
  imports: [
    SoneButtonDirective,
    SoneSheetComponent,
    ...SONE_DIALOG_PARTS,
    ...SONE_FIELD_PARTS,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class SheetDemo {
  readonly sides: SheetSide[] = ["right", "left", "bottom"];
  readonly openSide = signal<SheetSide | null>(null);
}
