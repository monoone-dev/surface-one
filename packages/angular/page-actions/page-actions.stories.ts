import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SonePageActionsComponent } from "./page-actions.component";
import { SONE_PAGE_ACTIONS_PARTS } from "./page-actions-parts.directive";

const MENU = `
    <div soneMenuGroup>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="settings" /> Customize page</button>
      <button soneMenuCheckboxItem type="button" [checked]="wiki" (click)="wiki = !wiki"><sone-icon icon="document" /> Turn into wiki</button>
    </div>
    <div soneMenuGroup>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="link" /> Copy link</button>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="copy" /> Duplicate</button>
      <button #moveTrigger soneMenuSubTrigger type="button" [open]="moveOpen" (click)="moveOpen = !moveOpen"><sone-icon icon="move" /> Move to</button>
      @if (moveOpen) {
        <div soneMenuSub [anchor]="moveTrigger" role="menu" aria-label="Move to">
          <button soneMenuItem type="button" role="menuitem"><sone-icon icon="folder" /> Product</button>
          <button soneMenuItem type="button" role="menuitem"><sone-icon icon="folder" /> Research</button>
        </div>
      }
      <button soneMenuItem variant="destructive" type="button" role="menuitem"><sone-icon icon="trash" /> Move to Trash</button>
    </div>
    <div soneMenuGroup>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="history" /> Undo</button>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="analytics" /> View analytics</button>
      <button soneMenuItem type="button" role="menuitem" disabled><sone-icon icon="refresh" /> Version history</button>
      <button soneMenuCheckboxItem type="button" [checked]="notify" (click)="notify = !notify"><sone-icon icon="bell-ring" /> Notifications</button>
    </div>
    <div soneMenuGroup>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="download" /> Import</button>
      <button soneMenuItem type="button" role="menuitem"><sone-icon icon="share" /> Export</button>
    </div>`;

const meta: Meta<SonePageActionsComponent> = {
  title: "Components/Overlays/Page actions",
  component: SonePageActionsComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_MENU_PARTS,
        ...SONE_PAGE_ACTIONS_PARTS,
        SoneIconComponent,
        SoneButtonDirective,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-page-actions>` — a document page's header actions, shadcn/ui sidebar-10's `NavActions`: " +
          "an optional muted `status` (or a projected `[sonePageActionsStatus]`), an optional projected " +
          "`[sonePageActionsLead]` control (a favourite toggle, or the ONE primary state control a page " +
          "must keep visible), and a ghost `⋯` (`<sone-row-menu [prominent]>`) opening ONE right-aligned, " +
          "OPAQUE dropdown whose content is projected menu parts: `soneMenuGroup`s (divided " +
          "automatically) of `soneMenuItem` / `soneMenuCheckboxItem` / `soneMenuSubTrigger` + " +
          "`soneMenuSub [anchor]`, each with a leading `<sone-icon>`. `label` names the trigger; " +
          "`tooltip` gives it a styled explanation and names the menu. Activating an item closes the " +
          "menu (a sub-menu trigger and a `data-menu-keep-open` item do not); `openChange` reports " +
          "open/close so the owner can reset transient menu state." +
          "\n\n**Reference**\n" +
          "- shadcn/ui — [sidebar-10 block](https://ui.shadcn.com/blocks/sidebar#sidebar-10) (`nav-actions.tsx`)\n" +
          "- spartan/ui — [dropdown-menu](https://spartan.ng/components/dropdown-menu)",
      },
    },
  },
  argTypes: {
    status: { control: "text" },
    label: { control: "text" },
    tooltip: { control: "text" },
    disabled: { control: "boolean" },
  },
  args: {
    status: "Edited Oct 08",
    label: "More",
    tooltip: "More actions",
    disabled: false,
  },
  render: (args) => ({
    props: {
      ...args,
      wiki: false,
      notify: true,
      moveOpen: false,
      starred: false,
    },
    template: `
      <div style="display: flex; justify-content: space-between; align-items: center; min-height: 420px; align-content: flex-start; flex-wrap: wrap">
        <h3 style="margin: 0">Project roadmap</h3>
        <sone-page-actions [status]="status" [label]="label" [tooltip]="tooltip" [disabled]="disabled"
          (openChange)="$event || (moveOpen = false)">
          <span sonePageActionsLead>
            <button soneBtn variant="ghost" size="icon-sm" type="button"
              [attr.aria-pressed]="starred" aria-label="Favourite" (click)="starred = !starred">
              <sone-icon icon="star" />
            </button>
          </span>${MENU}
        </sone-page-actions>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SonePageActionsComponent>;

export const Default: Story = {};
export const MenuOnly: Story = {
  args: { status: null },
  render: (args) => ({
    props: { ...args, wiki: false, notify: false, moveOpen: false },
    template: `
      <div style="display: flex; justify-content: flex-end; min-height: 420px; align-items: flex-start">
        <sone-page-actions [label]="label" [tooltip]="tooltip" (openChange)="$event || (moveOpen = false)">${MENU}
        </sone-page-actions>
      </div>`,
  }),
};
export const Disabled: Story = { args: { disabled: true } };
