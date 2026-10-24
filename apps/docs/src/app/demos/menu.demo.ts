import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_MENU_PARTS,
  SoneMenuTriggerDirective,
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
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-menu-demo",
  imports: [...SONE_MENU_PARTS, SoneButtonDirective, SoneMenuTriggerDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MenuDemo {
  readonly pinned = signal(true);
}
