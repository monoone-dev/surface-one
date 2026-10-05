import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_MENU_PARTS, SONE_POPOVER_PARTS } from "./menu.directive";

const ICON = {
  pencil: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M10.5 2.5l3 3L6 13H3v-3l7.5-7.5z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  folder: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 4.5A1.5 1.5 0 013.5 3h3l1.5 1.5h4.5A1.5 1.5 0 0114 6v5.5a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 11.5v-7z" stroke="currentColor" stroke-width="1.4"/></svg>`,
  share: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 10V2.5M5 5.5l3-3 3 3M3 9v3.5A1.5 1.5 0 004.5 14h7a1.5 1.5 0 001.5-1.5V9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  trash: `<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.1a1.5 1.5 0 001.5 1.4h2.8a1.5 1.5 0 001.5-1.4l.6-8.1" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

const PANEL = `role="menu" aria-label="Note actions" style="width: 15rem"`;

const meta: Meta = {
  title: "Components/Overlays/Menu",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_MENU_PARTS,
        ...SONE_POPOVER_PARTS,
        ...SONE_FIELD_PARTS,
        SoneButtonDirective,
        SoneIconComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          '`[soneMenu]` + `soneMenuGroup` / `soneMenuLabel` / `soneMenuItem` (`variant="destructive"`, ' +
          "`inset`) / `soneMenuCheckboxItem` / `soneMenuRadioItem` (`[checked]`, `inset`; the check / dot is " +
          "drawn by CSS in a reserved trailing slot, pr-8 / right-2, in every skin) / `soneMenuSubTrigger` + `soneMenuSub` / `soneMenuSeparator` / `soneMenuShortcut` — " +
          "spartan/ui Dropdown Menu. Density follows the Skin: Studio = Vega (32px rows), Paper = Maia " +
          "(36px rows, rounded-2xl panel), Minimalist = Nova (28px rows). `[sonePopover]` " +
          "(+ header/title/description) — spartan/ui Popover. Structure only: the owner anchors and " +
          "dismisses it (or use `<sone-row-menu>`). Both panels are OPAQUE (`--surface-overlay`, T3) and " +
          "have NO entrance animation — they are in place on their first painted frame. " +
          "Hover paints the neutral wash; keyboard focus (Tab / arrow keys) adds a 1px inset ring. " +
          "Consecutive `soneMenuGroup`s are divided automatically, like a `soneMenuSeparator`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [dropdown-menu](https://spartan.ng/components/dropdown-menu), " +
          "[context-menu](https://spartan.ng/components/context-menu), " +
          "[popover](https://spartan.ng/components/popover)\n" +
          "- shadcn/ui — [dropdown-menu](https://ui.shadcn.com/docs/components/dropdown-menu), " +
          "[context-menu](https://ui.shadcn.com/docs/components/context-menu), " +
          "[popover](https://ui.shadcn.com/docs/components/popover)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const DropdownMenu: Story = {
  render: () => ({
    template: `
      <div soneMenu ${PANEL}>
        <div soneMenuGroup>
          <p soneMenuLabel>Note</p>
          <button soneMenuItem role="menuitem" type="button">Rename <kbd soneMenuShortcut>⌘R</kbd></button>
          <button soneMenuItem role="menuitem" type="button">Move to… <kbd soneMenuShortcut>⇧⌘M</kbd></button>
          <button soneMenuItem role="menuitem" type="button" disabled>Export (locked)</button>
        </div>
        <div soneMenuGroup>
          <button soneMenuItem variant="destructive" role="menuitem" type="button">Move to Trash <kbd soneMenuShortcut>⌘⌫</kbd></button>
        </div>
      </div>`,
  }),
};

export const WithIcons: Story = {
  render: () => ({
    template: `
      <div soneMenu ${PANEL}>
        <p soneMenuLabel>Weekly sync</p>
        <button soneMenuItem role="menuitem" type="button">${ICON.pencil} Rename</button>
        <button soneMenuItem role="menuitem" type="button">${ICON.folder} Move to folder…</button>
        <button soneMenuItem role="menuitem" type="button">${ICON.share} Share…</button>
        <button soneMenuItem inset role="menuitem" type="button">Copy link</button>
        <div soneMenuSeparator></div>
        <button soneMenuItem variant="destructive" role="menuitem" type="button">${ICON.trash} Delete</button>
      </div>`,
  }),
};

export const CheckboxAndRadioItems: Story = {
  render: () => ({
    props: { fullWidth: true, spellcheck: false, disposition: "now" },
    template: `
      <div soneMenu role="menu" aria-label="Display" style="width: 15rem">
        <div soneMenuGroup>
          <p soneMenuLabel>Display</p>
          <button soneMenuCheckboxItem type="button" [checked]="fullWidth" (click)="fullWidth = !fullWidth">Full width</button>
          <button soneMenuCheckboxItem type="button" [checked]="spellcheck" (click)="spellcheck = !spellcheck">Spell check <kbd soneMenuShortcut>⌘;</kbd></button>
          <button soneMenuCheckboxItem type="button" checked disabled>Sync (managed)</button>
        </div>
        <div soneMenuGroup>
          <p soneMenuLabel>With icons</p>
          <button soneMenuCheckboxItem type="button" [checked]="fullWidth" (click)="fullWidth = !fullWidth">${ICON.folder} Show folders</button>
          <button soneMenuItem role="menuitem" type="button">${ICON.share} Share…</button>
        </div>
        <div soneMenuGroup>
          <p soneMenuLabel>After Stop</p>
          <button soneMenuRadioItem type="button" [checked]="disposition === 'now'" (click)="disposition = 'now'">Process now</button>
          <button soneMenuRadioItem type="button" [checked]="disposition === 'later'" (click)="disposition = 'later'">Process later</button>
          <button soneMenuRadioItem type="button" disabled>Discard (disabled)</button>
        </div>
        <div soneMenuGroup>
          <p soneMenuLabel inset>Inset</p>
          <button soneMenuCheckboxItem inset type="button" checked>Inset checkbox</button>
          <button soneMenuRadioItem inset type="button" checked>Inset radio</button>
        </div>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-5); align-items: flex-start">
        <div soneMenu role="menu" aria-label="Default items" style="width: 13rem">
          <p soneMenuLabel>Default</p>
          <button soneMenuItem role="menuitem" type="button">Enabled</button>
          <button soneMenuItem role="menuitem" type="button" disabled>Disabled</button>
          <button soneMenuItem role="menuitem" type="button" aria-disabled="true">aria-disabled</button>
          <button soneMenuItem inset role="menuitem" type="button">Inset</button>
        </div>
        <div soneMenu role="menu" aria-label="Destructive items" style="width: 13rem">
          <p soneMenuLabel>Destructive</p>
          <button soneMenuItem variant="destructive" role="menuitem" type="button">${ICON.trash} Enabled</button>
          <button soneMenuItem variant="destructive" role="menuitem" type="button" disabled>${ICON.trash} Disabled</button>
          <button soneMenuItem variant="destructive" role="menuitem" type="button"><sone-icon icon="trash" /> With sone-icon</button>
        </div>
        <div soneMenu role="menu" aria-label="Checkable items" style="width: 13rem">
          <p soneMenuLabel>Checkable</p>
          <button soneMenuCheckboxItem type="button" checked>Checked</button>
          <button soneMenuCheckboxItem type="button">Unchecked</button>
          <button soneMenuRadioItem type="button" checked>Selected</button>
          <button soneMenuRadioItem type="button">Not selected</button>
        </div>
      </div>`,
  }),
};

export const GroupsAndSeparators: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-5); align-items: flex-start">
        <div soneMenu role="menu" aria-label="Grouped" style="width: 13rem">
          <div soneMenuGroup>
            <p soneMenuLabel>Group A (auto divider)</p>
            <button soneMenuItem role="menuitem" type="button">One</button>
          </div>
          <div soneMenuGroup>
            <p soneMenuLabel>Group B</p>
            <button soneMenuItem role="menuitem" type="button">Two</button>
          </div>
        </div>
        <div soneMenu role="menu" aria-label="Separated" style="width: 13rem">
          <p soneMenuLabel>Explicit separator</p>
          <button soneMenuItem role="menuitem" type="button">One</button>
          <div soneMenuSeparator></div>
          <button soneMenuItem role="menuitem" type="button">Two</button>
        </div>
      </div>`,
  }),
};

export const SubMenu: Story = {
  render: () => ({
    props: { shareOpen: true },
    template: `
      <div style="display: flex; gap: var(--space-1); align-items: flex-start">
        <div soneMenu role="menu" aria-label="Note actions" style="width: 13rem">
          <button soneMenuItem role="menuitem" type="button">${ICON.pencil} Rename</button>
          <button soneMenuSubTrigger type="button" [open]="shareOpen" (click)="shareOpen = !shareOpen">${ICON.share} Share</button>
          <button soneMenuSubTrigger inset type="button">Export as</button>
          <div soneMenuSeparator></div>
          <button soneMenuItem variant="destructive" role="menuitem" type="button">${ICON.trash} Delete</button>
        </div>
        @if (shareOpen) {
          <div soneMenuSub role="menu" aria-label="Share">
            <button soneMenuItem role="menuitem" type="button">Copy link</button>
            <button soneMenuItem role="menuitem" type="button">Invite people…</button>
            <button soneMenuItem role="menuitem" type="button">Publish</button>
          </div>
        }
      </div>`,
  }),
};

export const Scrolling: Story = {
  render: () => ({
    props: { items: Array.from({ length: 14 }, (_, i) => `Folder ${i + 1}`) },
    template: `
      <div soneMenu role="menu" aria-label="Move to" style="width: 13rem; max-height: 14rem">
        <p soneMenuLabel>Move to</p>
        @for (f of items; track f) {
          <button soneMenuItem role="menuitem" type="button">${ICON.folder} {{ f }}</button>
        }
      </div>`,
  }),
};

export const Popover: Story = {
  render: () => ({
    template: `
      <div sonePopover role="dialog" aria-labelledby="pop-title">
        <div sonePopoverHeader>
          <p sonePopoverTitle id="pop-title">Dimensions</p>
          <p sonePopoverDescription>Set the dimensions for the layer.</p>
        </div>
        <div soneField>
          <label soneFieldLabel for="pop-width">Width</label>
          <input id="pop-width" type="text" value="100%" />
        </div>
        <div soneField>
          <label soneFieldLabel for="pop-height">Height</label>
          <input id="pop-height" type="text" value="25px" />
        </div>
        <button soneBtn size="sm" type="button">Apply</button>
      </div>`,
  }),
};

export const OverContent: Story = {
  render: () => ({
    template: `
      <div style="position: relative; min-height: 18rem; padding: var(--space-4)">
        <p style="margin: 0; color: var(--text-secondary); max-width: 40rem">
          Transcript text runs underneath the floating panels. A see-through panel would let this
          line bleed through — both panels stay opaque, lifted by the hairline and the overlay shadow.
        </p>
        <div soneMenu role="menu" aria-label="Overlay menu" style="position: absolute; top: var(--space-6); left: var(--space-6); width: 13rem">
          <button soneMenuItem role="menuitem" type="button">${ICON.pencil} Rename</button>
          <button soneMenuCheckboxItem type="button" checked>Full width</button>
          <div soneMenuSeparator></div>
          <button soneMenuItem variant="destructive" role="menuitem" type="button">${ICON.trash} Delete</button>
        </div>
        <div sonePopover style="position: absolute; top: var(--space-6); left: 17rem">
          <div sonePopoverHeader>
            <p sonePopoverTitle>Speaker</p>
            <p sonePopoverDescription>Rename “Others” for this meeting.</p>
          </div>
        </div>
      </div>`,
  }),
};
