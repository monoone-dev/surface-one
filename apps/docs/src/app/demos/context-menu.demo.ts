import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneContextMenuTriggerDirective } from "@surface-one/angular/context-menu";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";

const TEMPLATE = `<div class="demo-row" style="align-items: flex-start; min-height: 20rem">
  <div
    [soneContextMenuTrigger]="menu"
    tabindex="0"
    style="display: grid; place-items: center; width: 18rem; height: 9rem; border: var(--border-width-thin) dashed var(--border); border-radius: var(--radius-lg); color: var(--text-secondary); font-size: var(--font-size-sm)"
  >
    Right-click or long-press here
  </div>
  <ng-template #menu>
    <div soneMenu aria-label="Page actions" style="width: 14rem">
      <button soneMenuItem type="button">Back <kbd soneMenuShortcut>⌘[</kbd></button>
      <button soneMenuItem type="button" disabled>Forward <kbd soneMenuShortcut>⌘]</kbd></button>
      <button soneMenuItem type="button">Reload <kbd soneMenuShortcut>⌘R</kbd></button>
      <div soneMenuSeparator></div>
      <button soneMenuCheckboxItem type="button" [checked]="bookmarks()" (click)="bookmarks.set(!bookmarks())">
        Show bookmarks
      </button>
      <div soneMenuSeparator></div>
      <button soneMenuItem variant="destructive" type="button">Delete page</button>
    </div>
  </ng-template>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-context-menu-demo",
  imports: [SoneContextMenuTriggerDirective, ...SONE_MENU_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ContextMenuDemo {
  readonly bookmarks = signal(true);
}
