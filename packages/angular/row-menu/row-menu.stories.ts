import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SoneTreeRowComponent } from "@surface-one/angular/tree-row";
import { SoneRowMenuComponent } from "./row-menu.component";

const MENU_ITEMS = `
          <div soneMenuGroup>
            <p soneMenuLabel>Note</p>
            <button soneMenuItem type="button" role="menuitem">Rename</button>
            <button soneMenuItem type="button" role="menuitem">Move to folder…</button>
            <button soneMenuItem type="button" role="menuitem" disabled>Export PDF</button>
          </div>
          <div soneMenuGroup>
            <button soneMenuCheckboxItem type="button" [checked]="pinned">Pinned</button>
          </div>
          <div soneMenuGroup>
            <button soneMenuItem variant="destructive" type="button" role="menuitem">Move to trash</button>
          </div>`;

const meta: Meta<SoneRowMenuComponent> = {
  title: "Components/Overlays/Row menu",
  component: SoneRowMenuComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_MENU_PARTS, SoneIconComponent, SoneTreeRowComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-row-menu>` — THE ellipsis-trigger dropdown for per-item actions: shadcn/ui's " +
          "SidebarMenuAction (the trigger) opening a DropdownMenu (the panel, aligned to the trigger's " +
          "end). It owns only the shell: the trigger, open state, outside-click / Escape / Tab " +
          "dismissal, keyboard entry (Enter / Space / ↓ open on the first item, ↑ on the last), focus " +
          "return to the trigger, and positioning (below, flipping above at the scroll boundary). " +
          "Placements: inside a `<sone-tree-row>` the trigger is `showOnHover` — invisible at rest, " +
          "revealed while the row is hovered or focused, or the menu is open; anywhere else it stays " +
          "visible; `prominent` renders it as the spartan ghost `icon-sm` button for a standalone " +
          "header. The panel is teleported to `<body>` and paints the OPAQUE `[soneMenu]` surface " +
          "(rule T3), in place on its first frame. Items are projected menu parts — `soneMenuItem` " +
          '(`role="menuitem"`), `soneMenuCheckboxItem`, `soneMenuRadioItem`, `soneMenuLabel`, ' +
          "`soneMenuGroup`, `soneMenuSeparator`; activating any enabled one closes the menu, and " +
          "↑ / ↓ / Home / End move between them." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/sidebar](https://spartan.ng/components/sidebar)\n" +
          "- spartan/ui — [https://spartan.ng/components/dropdown-menu](https://spartan.ng/components/dropdown-menu)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/sidebar](https://ui.shadcn.com/docs/components/sidebar)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/dropdown-menu](https://ui.shadcn.com/docs/components/dropdown-menu)",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
    prominent: { control: "boolean" },
  },
  args: { label: "Actions for Weekly sync", disabled: false, prominent: true },
  render: (args) => ({
    props: { ...args, pinned: true },
    template: `
      <div style="display: flex; align-items: flex-start; gap: var(--space-3); min-height: 220px">
        <h3 style="margin: 0">Weekly sync</h3>
        <sone-row-menu [label]="label" [disabled]="disabled" [prominent]="prominent">${MENU_ITEMS}
        </sone-row-menu>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneRowMenuComponent>;

export const Prominent: Story = {};
export const Quiet: Story = { args: { prominent: false } };
export const Disabled: Story = { args: { disabled: true } };
export const QuietDisabled: Story = {
  args: { prominent: false, disabled: true },
};

export const InTreeRow: Story = {
  args: { prominent: false, label: "Actions for Product" },
  render: (args) => ({
    props: { ...args, pinned: false },
    template: `
      <div style="width: 260px; min-height: 260px" role="tree" aria-label="Folders">
        <sone-tree-row label="Product" icon="folder">
          <sone-row-menu [label]="label" [disabled]="disabled">${MENU_ITEMS}
          </sone-row-menu>
        </sone-tree-row>
        <sone-tree-row label="Research" icon="folder" [depth]="1">
          <sone-row-menu label="Actions for Research">${MENU_ITEMS}
          </sone-row-menu>
        </sone-tree-row>
      </div>`,
  }),
};

export const GlyphOpeningRight: Story = {
  args: { label: "Browse" },
  render: (args) => ({
    props: { ...args, pinned: false },
    template: `
      <div style="min-height: 260px">
        <sone-row-menu [label]="label" [prominent]="true" side="right">
          <sone-icon soneRowMenuGlyph icon="layout-grid" />${MENU_ITEMS}
        </sone-row-menu>
      </div>`,
  }),
};
