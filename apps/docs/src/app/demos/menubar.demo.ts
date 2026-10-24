import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_MENUBAR_PARTS } from "@surface-one/angular/menubar";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; min-height: 16rem">
  <div soneMenubar aria-label="Editor">
    <button type="button" [soneMenubarTrigger]="file">File</button>
    <button type="button" [soneMenubarTrigger]="edit">Edit</button>
    <button type="button" [soneMenubarTrigger]="view">View</button>
  </div>
  <ng-template #file>
    <div soneMenu aria-label="File" style="width: 14rem">
      <button soneMenuItem type="button">New Tab <kbd soneMenuShortcut>⌘T</kbd></button>
      <button soneMenuItem type="button">New Window <kbd soneMenuShortcut>⌘N</kbd></button>
      <div soneMenuSeparator></div>
      <button soneMenuItem type="button">Print… <kbd soneMenuShortcut>⌘P</kbd></button>
    </div>
  </ng-template>
  <ng-template #edit>
    <div soneMenu aria-label="Edit" style="width: 14rem">
      <button soneMenuItem type="button">Undo <kbd soneMenuShortcut>⌘Z</kbd></button>
      <button soneMenuItem type="button">Redo <kbd soneMenuShortcut>⇧⌘Z</kbd></button>
      <div soneMenuSeparator></div>
      <button soneMenuItem type="button">Cut</button>
      <button soneMenuItem type="button">Copy</button>
      <button soneMenuItem type="button">Paste</button>
    </div>
  </ng-template>
  <ng-template #view>
    <div soneMenu aria-label="View" style="width: 14rem">
      <button soneMenuCheckboxItem type="button" [checked]="bookmarks()" (click)="bookmarks.set(!bookmarks())">
        Show Bookmarks Bar
      </button>
      <button soneMenuCheckboxItem type="button" [checked]="urls()" (click)="urls.set(!urls())">
        Show Full URLs
      </button>
    </div>
  </ng-template>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-menubar-demo",
  imports: [...SONE_MENUBAR_PARTS, ...SONE_MENU_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class MenubarDemo {
  readonly bookmarks = signal(true);
  readonly urls = signal(false);
}
