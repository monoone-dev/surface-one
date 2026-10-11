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
