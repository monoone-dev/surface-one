import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import {
  SONE_PAGE_ACTIONS_PARTS,
  SonePageActionsComponent,
} from "@surface-one/angular/page-actions";

const TEMPLATE = `<div class="demo-row" style="justify-content: space-between; width: 100%">
  <span>Product roadmap</span>
  <sone-page-actions status="Edited Oct 08" tooltip="More actions">
    <span sonePageActionsLead>
      <button soneBtn type="button" variant="ghost" size="icon-sm" aria-label="Favourite"
        [attr.aria-pressed]="starred()" (click)="starred.set(!starred())">
        <sone-icon icon="star" />
      </button>
    </span>
    <div soneMenuGroup>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="link" /> Copy link</button>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="copy" /> Duplicate</button>
      <button soneMenuCheckboxItem type="button" [checked]="notify()" (click)="notify.set(!notify())">
        <sone-icon icon="bell-ring" /> Notifications
      </button>
    </div>
    <div soneMenuGroup>
      <button soneMenuItem type="button" role="menuitem" variant="destructive">
        <sone-icon icon="trash" /> Move to Trash
      </button>
    </div>
  </sone-page-actions>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-page-actions-demo",
  imports: [
    SonePageActionsComponent,
    ...SONE_PAGE_ACTIONS_PARTS,
    ...SONE_MENU_PARTS,
    SoneButtonDirective,
    SoneIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PageActionsDemo {
  readonly starred = signal(false);
  readonly notify = signal(true);
}
