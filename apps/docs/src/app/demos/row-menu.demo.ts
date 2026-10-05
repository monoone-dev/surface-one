import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import { SoneSidebarComponent } from "@surface-one/angular/sidebar";
import { SoneTreeRowComponent } from "@surface-one/angular/tree-row";

const TEMPLATE = `<div class="demo-stack">
  <div class="demo-row">
    <h3 style="margin: 0">Weekly sync</h3>
    <sone-row-menu label="Actions for Weekly sync" [prominent]="true">
      <div soneMenuGroup>
        <p soneMenuLabel>Note</p>
        <button soneMenuItem type="button" role="menuitem">Rename</button>
        <button soneMenuItem type="button" role="menuitem">Move to folder…</button>
        <button soneMenuCheckboxItem type="button" [checked]="pinned()" (click)="pinned.set(!pinned())">Pinned</button>
      </div>
      <div soneMenuGroup>
        <button soneMenuItem variant="destructive" type="button" role="menuitem">Move to trash</button>
      </div>
    </sone-row-menu>
  </div>

  <sone-sidebar style="width: 16rem">
    <sone-tree-row label="Research" [count]="6">
      <sone-row-menu label="Actions for Research">
        <button soneMenuItem type="button" role="menuitem">Rename</button>
        <button soneMenuItem variant="destructive" type="button" role="menuitem">Delete folder</button>
      </sone-row-menu>
    </sone-tree-row>
  </sone-sidebar>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-row-menu-demo",
  imports: [
    SoneRowMenuComponent,
    ...SONE_MENU_PARTS,
    SoneSidebarComponent,
    SoneTreeRowComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class RowMenuDemo {
  readonly pinned = signal(true);
}
