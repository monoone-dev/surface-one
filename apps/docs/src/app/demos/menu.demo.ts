import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import {
  SONE_MENU_PARTS,
  SONE_POPOVER_PARTS,
  SoneMenuTriggerDirective,
  SonePopoverTriggerDirective,
} from "@surface-one/angular/menu";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start">
  <button soneBtn variant="outline" type="button" [soneMenuTrigger]="noteMenu">Note actions</button>
  <ng-template #noteMenu>
    <div soneMenu aria-label="Note actions" style="width: 15rem">
      <div soneMenuGroup>
        <p soneMenuLabel>Note</p>
        <button soneMenuItem type="button">Rename <kbd soneMenuShortcut>⌘R</kbd></button>
        <button soneMenuItem type="button">Duplicate</button>
        <button soneMenuItem type="button" disabled>Export (locked)</button>
        <button soneMenuCheckboxItem type="button" [checked]="pinned()" (click)="pinned.set(!pinned())">Pinned</button>
      </div>
      <div soneMenuGroup>
        <button soneMenuItem variant="destructive" type="button">Move to Trash</button>
      </div>
    </div>
  </ng-template>

  <button soneBtn variant="outline" type="button" [sonePopoverTrigger]="dimensions" align="end">Dimensions</button>
  <ng-template #dimensions let-close="close">
    <div sonePopover role="dialog" aria-labelledby="dimensions-title">
      <div sonePopoverHeader>
        <p sonePopoverTitle id="dimensions-title">Dimensions</p>
        <p sonePopoverDescription>Set the size of the layer.</p>
      </div>
      <div soneField>
        <label soneFieldLabel for="dimensions-width">Width</label>
        <input id="dimensions-width" type="text" value="100%" />
      </div>
      <button soneBtn size="sm" type="button" (click)="close()">Apply</button>
    </div>
  </ng-template>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-menu-demo",
  imports: [
    ...SONE_MENU_PARTS,
    ...SONE_POPOVER_PARTS,
    ...SONE_FIELD_PARTS,
    SoneButtonDirective,
    SoneMenuTriggerDirective,
    SonePopoverTriggerDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MenuDemo {
  readonly pinned = signal(true);
}
