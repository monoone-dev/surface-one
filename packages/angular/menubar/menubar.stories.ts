import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SONE_MENUBAR_PARTS } from "./menubar.directive";

const meta: Meta = {
  title: "Components/Overlays/Menubar",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [...SONE_MENUBAR_PARTS, ...SONE_MENU_PARTS] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneMenubar]` + `[soneMenubarTrigger]` — a WAI-ARIA menubar built from the menu family. The bar " +
          'is `role="menubar"` with one Tab stop (roving tabindex); ArrowLeft / ArrowRight (wrapping), Home ' +
          'and End move between the triggers (`role="menuitem"`, `aria-haspopup="menu"`, `aria-expanded`). ' +
          "Enter, Space and ArrowDown open a trigger's `[soneMenu]` on its first item, ArrowUp on the last; " +
          "inside it the menu keys apply, and ArrowLeft / ArrowRight close it and open the neighbouring menu. " +
          "Once a menu is open, hovering another trigger switches to it. Escape closes and returns focus to " +
          "the trigger. Name the bar with `aria-label`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [menubar](https://spartan.ng/components/menubar)\n" +
          "- shadcn/ui — [menubar](https://ui.shadcn.com/docs/components/menubar)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: { bookmarks: true, urls: false, profile: "benoit", recent: false },
    template: `
      <div style="min-height: 20rem">
        <div soneMenubar aria-label="Editor">
          <button type="button" [soneMenubarTrigger]="file">File</button>
          <button type="button" [soneMenubarTrigger]="edit">Edit</button>
          <button type="button" [soneMenubarTrigger]="view">View</button>
          <button type="button" [soneMenubarTrigger]="profiles">Profiles</button>
        </div>
        <ng-template #file>
          <div soneMenu aria-label="File" style="width: 14rem">
            <button soneMenuItem type="button">New Tab <kbd soneMenuShortcut>⌘T</kbd></button>
            <button soneMenuItem type="button">New Window <kbd soneMenuShortcut>⌘N</kbd></button>
            <button soneMenuItem type="button" disabled>New Incognito Window</button>
            <div soneMenuSeparator></div>
            <button soneMenuSubTrigger type="button" #share [open]="recent" (click)="recent = !recent">Share</button>
            @if (recent) {
              <div soneMenuSub role="menu" aria-label="Share" [anchor]="share">
                <button soneMenuItem type="button">Email link</button>
                <button soneMenuItem type="button">Messages</button>
              </div>
            }
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
            <button soneMenuCheckboxItem type="button" data-menu-keep-open [checked]="bookmarks" (click)="bookmarks = !bookmarks">Always Show Bookmarks Bar</button>
            <button soneMenuCheckboxItem type="button" data-menu-keep-open [checked]="urls" (click)="urls = !urls">Always Show Full URLs</button>
            <div soneMenuSeparator></div>
            <button soneMenuItem inset type="button">Reload <kbd soneMenuShortcut>⌘R</kbd></button>
            <button soneMenuItem inset type="button">Toggle Fullscreen</button>
          </div>
        </ng-template>
        <ng-template #profiles>
          <div soneMenu aria-label="Profiles" style="width: 12rem">
            <button soneMenuRadioItem type="button" [checked]="profile === 'andy'" (click)="profile = 'andy'">Andy</button>
            <button soneMenuRadioItem type="button" [checked]="profile === 'benoit'" (click)="profile = 'benoit'">Benoit</button>
            <button soneMenuRadioItem type="button" [checked]="profile === 'luis'" (click)="profile = 'luis'">Luis</button>
            <div soneMenuSeparator></div>
            <button soneMenuItem inset type="button">Edit…</button>
          </div>
        </ng-template>
      </div>`,
  }),
};
