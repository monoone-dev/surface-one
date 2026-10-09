import { computed, signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSidebarComponent } from "@surface-one/angular/sidebar";
import { SoneTreeRowComponent } from "@surface-one/angular/tree-row";
import { SONE_TREE_PARTS } from "./tree.directive";

const LINES = [
  { id: "product", label: "Product", depth: 0, parent: null, expandable: true },
  {
    id: "design",
    label: "Design",
    depth: 1,
    parent: "product",
    expandable: true,
  },
  {
    id: "specs",
    label: "Specs review",
    depth: 2,
    parent: "design",
    expandable: false,
  },
  {
    id: "roadmap",
    label: "Roadmap review",
    depth: 1,
    parent: "product",
    expandable: false,
  },
  {
    id: "research",
    label: "Research",
    depth: 0,
    parent: null,
    expandable: true,
  },
  {
    id: "interviews",
    label: "Interviews",
    depth: 1,
    parent: "research",
    expandable: false,
  },
];

type Line = (typeof LINES)[number];

function visible(open: Set<string>): Line[] {
  const byId = new Map(LINES.map((l) => [l.id, l]));
  const shown = (l: Line): boolean =>
    l.parent === null || (open.has(l.parent) && shown(byId.get(l.parent)!));
  return LINES.filter(shown);
}

const meta: Meta = {
  title: "Components/Navigation/Tree",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_TREE_PARTS, SoneTreeRowComponent, SoneSidebarComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneTree]` — the WAI-ARIA tree pattern for FLAT trees of `<sone-tree-row>` (or any " +
          'element with `[soneTreeItem]`). Inside it a row becomes `role="treeitem"` with ' +
          "`aria-level` (`depth + 1`, or `level`), `aria-expanded` (`expandable`, or `hasChildren`) " +
          "and `aria-selected`; the tree keeps ONE Tab stop (the last focused, else the selected, " +
          "else the first row). ↑ / ↓ move, → expands or enters the first child, ← collapses or goes " +
          "to the parent, Home / End jump, typing jumps to a label, Enter / Space activate (the row's " +
          "`(activate)`), `*` expands every sibling. Rows still render only what is expanded; the " +
          "tree reads their order from the DOM. Keys from fields and from controls with a popup " +
          "(a `<sone-row-menu>`) stay theirs." +
          "\n\n**Reference**\n" +
          "- WAI-ARIA APG — [tree view](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)\n" +
          "- shadcn/ui — [sidebar file tree](https://ui.shadcn.com/blocks/sidebar#sidebar-11)\n" +
          "- spartan/ui — [sidebar](https://spartan.ng/components/sidebar)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const TEMPLATE = `
  <sone-sidebar style="width: 280px; padding-top: var(--space-3)">
    <div soneTree aria-label="Workspace">
      @for (line of lines(); track line.id) {
        <sone-tree-row [label]="line.label" [depth]="line.depth" [expandable]="line.expandable"
          [expanded]="open().has(line.id)" [selected]="selected() === line.id"
          (activate)="selected.set(line.id)" (toggleExpand)="toggle(line.id)" />
      }
    </div>
  </sone-sidebar>`;

function props(openIds: string[]) {
  const open = signal(new Set(openIds));
  return {
    open,
    selected: signal("roadmap"),
    lines: computed(() => visible(open())),
    toggle(id: string) {
      open.update((ids) => {
        const next = new Set(ids);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
  };
}

export const Expanded: Story = {
  render: () => ({ props: props(["product", "design"]), template: TEMPLATE }),
};

export const Collapsed: Story = {
  render: () => ({ props: props([]), template: TEMPLATE }),
};

export const WithTreeItem: Story = {
  render: () => ({
    template: `
      <sone-sidebar style="width: 280px; padding-top: var(--space-3)">
        <div soneTree aria-label="Shared">
          <sone-tree-row label="Shared with me" [expandable]="true" [expanded]="true" />
          <sone-tree-row label="Q4 planning" icon="note" [depth]="1" />
          <a soneTreeItem [level]="2" href="#" style="padding-left: var(--space-8)">View all</a>
        </div>
      </sone-sidebar>`,
  }),
};
