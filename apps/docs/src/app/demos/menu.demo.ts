import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_MENU_PARTS, SONE_POPOVER_PARTS } from "@surface-one/angular/menu";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; min-height: 17rem">
  <div style="position: relative" (keydown.escape)="menuOpen.set(false)">
    <button soneBtn variant="outline" type="button" aria-haspopup="menu"
      [attr.aria-expanded]="menuOpen()" (click)="menuOpen.set(!menuOpen())">Note actions</button>
    @if (menuOpen()) {
      <div soneMenu role="menu" aria-label="Note actions"
        style="position: absolute; top: calc(100% + var(--space-1)); left: 0; width: 15rem; z-index: var(--z-dropdown)">
        <div soneMenuGroup>
          <p soneMenuLabel>Note</p>
          <button soneMenuItem role="menuitem" type="button" (click)="menuOpen.set(false)">Rename <kbd soneMenuShortcut>⌘R</kbd></button>
          <button soneMenuItem role="menuitem" type="button" disabled>Export (locked)</button>
          <button soneMenuCheckboxItem type="button" [checked]="pinned()" (click)="pinned.set(!pinned())">Pinned</button>
        </div>
        <div soneMenuGroup>
          <button soneMenuItem variant="destructive" role="menuitem" type="button" (click)="menuOpen.set(false)">Move to Trash</button>
        </div>
      </div>
    }
  </div>

  <div style="position: relative" (keydown.escape)="popoverOpen.set(false)">
    <button soneBtn variant="outline" type="button" aria-haspopup="dialog"
      [attr.aria-expanded]="popoverOpen()" (click)="popoverOpen.set(!popoverOpen())">Dimensions</button>
    @if (popoverOpen()) {
      <div sonePopover role="dialog" aria-labelledby="dimensions-title"
        style="position: absolute; top: calc(100% + var(--space-1)); left: 0; z-index: var(--z-popover)">
        <div sonePopoverHeader>
          <p sonePopoverTitle id="dimensions-title">Dimensions</p>
          <p sonePopoverDescription>Set the size of the layer.</p>
        </div>
        <div soneField>
          <label soneFieldLabel for="dimensions-width">Width</label>
          <input id="dimensions-width" type="text" value="100%" />
        </div>
        <button soneBtn size="sm" type="button" (click)="popoverOpen.set(false)">Apply</button>
      </div>
    }
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-menu-demo",
  imports: [
    ...SONE_MENU_PARTS,
    ...SONE_POPOVER_PARTS,
    ...SONE_FIELD_PARTS,
    SoneButtonDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MenuDemo {
  readonly menuOpen = signal(false);
  readonly popoverOpen = signal(false);
  readonly pinned = signal(true);
}
