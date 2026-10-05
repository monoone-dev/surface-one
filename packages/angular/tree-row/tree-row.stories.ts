import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import { SoneSidebarComponent } from "@surface-one/angular/sidebar";
import { SoneTreeRowComponent, type TreeRowIcon } from "./tree-row.component";

const ROW_ICONS: Record<TreeRowIcon, true> = {
  folder: true,
  locked: true,
  space: true,
  meeting: true,
  note: true,
  task: true,
  dashboard: true,
};

const meta: Meta<SoneTreeRowComponent> = {
  title: "Components/Navigation/Tree row",
  component: SoneTreeRowComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [SoneSidebarComponent, SoneRowMenuComponent] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-tree-row>` — THE tree row, drawn as shadcn/ui's file-tree Sidebar row (the " +
          "`sidebar-11` block): the host is a SidebarMenuItem, its row box a SidebarMenuButton " +
          '(`data-slot="sidebar-menu-button"`, `data-active` when `selected` — it owns the height, ' +
          "hover and active ground), the leading chevron (an equal-width spacer on a leaf, so glyphs " +
          "align), the glyph (or an `emoji`), the label and an optional `count` SidebarMenuBadge. " +
          "The trees stay flat, so NESTING is indentation alone: each `depth` indents by one " +
          "SidebarMenuSub step (`mx-3.5 + border-l + px-2.5`), with no guide line. Feature actions (lock toggle, the `<sone-row-menu>` ⋯ — the row's " +
          "SidebarMenuAction) are projected as trailing content.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/sidebar](https://spartan.ng/components/sidebar)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/sidebar](https://ui.shadcn.com/docs/components/sidebar)",
      },
    },
  },
  argTypes: {
    label: { control: "text" },
    depth: { control: { type: "range", min: 0, max: 5, step: 1 } },
    selected: { control: "boolean" },
    icon: { control: "select", options: Object.keys(ROW_ICONS) },
    emoji: { control: "text" },
    count: { control: "number" },
    expandable: { control: "boolean" },
    expanded: { control: "boolean" },
    activate: { action: "activate" },
    toggleExpand: { action: "toggleExpand" },
  },
  args: {
    label: "Product",
    depth: 0,
    selected: false,
    icon: "folder",
    emoji: null,
    count: 12,
    expandable: true,
    expanded: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <sone-sidebar style="width: 280px; padding-top: var(--space-3)">
        <sone-tree-row [label]="label" [depth]="depth" [selected]="selected" [icon]="icon" [emoji]="emoji"
          [count]="count" [expandable]="expandable" [expanded]="expanded"
          (activate)="activate()" (toggleExpand)="toggleExpand()" />
      </sone-sidebar>`,
  }),
};
export default meta;
type Story = StoryObj<SoneTreeRowComponent>;

export const Folder: Story = {};
export const Selected: Story = { args: { selected: true } };
export const Locked: Story = {
  args: { icon: "locked", label: "1:1s", count: 4, expandable: false },
};
export const WithEmoji: Story = {
  args: { icon: "space", emoji: "🚀", label: "Launch", count: null },
};

export const Tree: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <sone-sidebar style="width: 300px; padding-top: var(--space-3)">
        <sone-tree-row label="Acme workspace" icon="space" emoji="🏢" [expandable]="true" [expanded]="true" />
        <sone-tree-row label="Product" [depth]="1" [count]="12" [expandable]="true" [expanded]="true" [selected]="true">
          <sone-row-menu label="Actions for Product">
            <button type="button" class="menu-item" role="menuitem">Rename</button>
            <button type="button" class="menu-item menu-item-danger" role="menuitem">Delete</button>
          </sone-row-menu>
        </sone-tree-row>
        <sone-tree-row label="Roadmap review" icon="meeting" [depth]="2" />
        <sone-tree-row label="Launch checklist" icon="task" [depth]="2" />
        <sone-tree-row label="Pricing notes" icon="note" [depth]="2" />
        <sone-tree-row label="Metrics board" icon="dashboard" [depth]="2" />
        <sone-tree-row label="1:1s" icon="locked" [depth]="1" [count]="4" />
      </sone-sidebar>`,
  }),
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <sone-sidebar style="width: 300px; padding-top: var(--space-3)">
        <sone-tree-row label="Resting" [count]="3" />
        <sone-tree-row label="Selected" [selected]="true" [count]="3" />
        <sone-tree-row label="Drop armed (a note is dragging)" class="is-drop-armed" />
        <sone-tree-row label="Drop target (under the pointer)" class="is-drop-target" />
        <sone-tree-row label="Expandable, open" [expandable]="true" [expanded]="true" />
        <sone-tree-row label="A very long folder name that has to ellipsize before the count" [count]="128" />
      </sone-sidebar>`,
  }),
};

export const AllIcons: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { icons: Object.keys(ROW_ICONS) },
    template: `
      <sone-sidebar style="width: 280px; padding-top: var(--space-3)">
        @for (i of icons; track i) {
          <sone-tree-row [label]="i" [icon]="i" />
        }
      </sone-sidebar>`,
  }),
};
