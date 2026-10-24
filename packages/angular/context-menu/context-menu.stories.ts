import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SoneContextMenuTriggerDirective } from "./context-menu.directive";

const AREA =
  'tabindex="0" style="display: grid; place-items: center; width: 18rem; height: 9rem; ' +
  "border: var(--border-width-thin) dashed var(--border); border-radius: var(--radius-lg); " +
  'color: var(--text-secondary); font-size: var(--font-size-sm)"';

const meta: Meta = {
  title: "Components/Overlays/Context Menu",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_MENU_PARTS, SoneContextMenuTriggerDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneContextMenuTrigger]` — an area that opens a `[soneMenu]` (an `<ng-template>` or a panel by " +
          "reference) where it is asked for: a right click at the pointer, a long press (500 ms, touch and " +
          "pen) at the finger, the ContextMenu key or Shift+F10 at the area's corner with focus on the first " +
          "item. A click on the area closes it. The menu is the menu family's — items, groups, labels, " +
          "shortcuts, checkbox / radio items, submenus, Arrow keys, Home / End, typeahead; it closes on " +
          "activation, Escape, Tab or a click outside and gives focus back to the area. `disabled` leaves the " +
          'browser\'s own menu alone. Give the area `tabindex="0"` so the keyboard can reach it.' +
          "\n\n**Reference**\n" +
          "- spartan/ui — [context-menu](https://spartan.ng/components/context-menu)\n" +
          "- shadcn/ui — [context-menu](https://ui.shadcn.com/docs/components/context-menu)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: { bookmarks: true, urls: false, person: "pedro", share: false },
    template: `
      <div style="min-height: 22rem">
        <div [soneContextMenuTrigger]="menu" ${AREA}>Right-click here</div>
        <ng-template #menu>
          <div soneMenu aria-label="Page actions" style="width: 14rem">
            <button soneMenuItem type="button">Back <kbd soneMenuShortcut>⌘[</kbd></button>
            <button soneMenuItem type="button" disabled>Forward <kbd soneMenuShortcut>⌘]</kbd></button>
            <button soneMenuItem type="button">Reload <kbd soneMenuShortcut>⌘R</kbd></button>
            <button soneMenuSubTrigger type="button" [open]="share" (click)="share = !share" #more>More tools</button>
            @if (share) {
              <div soneMenuSub role="menu" aria-label="More tools" [anchor]="more">
                <button soneMenuItem type="button">Save page…</button>
                <button soneMenuItem type="button">Developer tools</button>
              </div>
            }
            <div soneMenuSeparator></div>
            <button soneMenuCheckboxItem type="button" data-menu-keep-open [checked]="bookmarks" (click)="bookmarks = !bookmarks">Show bookmarks</button>
            <button soneMenuCheckboxItem type="button" data-menu-keep-open [checked]="urls" (click)="urls = !urls">Show full URLs</button>
            <div soneMenuSeparator></div>
            <p soneMenuLabel inset>People</p>
            <button soneMenuRadioItem type="button" data-menu-keep-open [checked]="person === 'pedro'" (click)="person = 'pedro'">Pedro Duarte</button>
            <button soneMenuRadioItem type="button" data-menu-keep-open [checked]="person === 'colm'" (click)="person = 'colm'">Colm Tuite</button>
          </div>
        </ng-template>
      </div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div [soneContextMenuTrigger]="menu" disabled ${AREA}>The browser's own menu</div>
      <ng-template #menu>
        <div soneMenu aria-label="Unused"><button soneMenuItem type="button">Never shown</button></div>
      </ng-template>`,
  }),
};
