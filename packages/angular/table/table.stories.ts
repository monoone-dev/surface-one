import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import { SoneTableColumnComponent } from "./table-column.component";
import { SoneTableComponent } from "./table.component";

interface NoteRow {
  id: string;
  title: string;
  folder: string;
  modified: string;
  locked: boolean;
}

const ROWS: NoteRow[] = [
  {
    id: "n1",
    title: "Q4 planning — decisions and owners",
    folder: "Product",
    modified: "Sep 24",
    locked: false,
  },
  {
    id: "n2",
    title: "Hiring loop debrief",
    folder: "People",
    modified: "Sep 22",
    locked: true,
  },
  {
    id: "n3",
    title:
      "A very long title that would wrap and make this row taller than its neighbours if the table let it",
    folder: "Research",
    modified: "Sep 19",
    locked: false,
  },
  {
    id: "n4",
    title: "Vendor call — Whisper licensing",
    folder: "Legal",
    modified: "Sep 12",
    locked: false,
  },
];

const meta: Meta<SoneTableComponent<NoteRow>> = {
  title: "Components/Data display/Table",
  component: SoneTableComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneTableColumnComponent,
        SoneBadgeDirective,
        SoneRowMenuComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-table>` — a dense, Notion-style data table. Columns are DEFINITIONS " +
          "(`<sone-table-column key header width alignEnd hideHeader>`), each with an `<ng-template let-row>` " +
          "for rich per-row cell content. `trackBy` is required (never `track $index`). **Row height " +
          "is a design constant this component owns**: long content is clipped, never wrapped, so no " +
          "row can grow taller than another. `rowClass` adds per-row classes (e.g. a masked row).\n\n" +
          "spartan/ui **Table** anatomy: `caption` (bottom, muted) · 40px heads with 8px inline padding · " +
          'cells with 8px inline padding · hover wash · `isSelected` → `data-state="selected"` (accent ' +
          'tint in Studio / Paper, `bg-muted` in Minimalist) · no rule under the last row · `emptyText` → a full-width "No results." row. Parts ' +
          "carry spartan's `data-slot` names. Heads are shadcn's plain `font-medium` label in Minimalist (Nova); Studio / Paper keep the uppercase database eyebrow (theme tokens). " +
          "The host is shadcn's `table-container` (`overflow-x: auto`).\n\n" +
          "**Reference**\n\n" +
          "- spartan/ui — [https://spartan.ng/components/table](https://spartan.ng/components/table)\n" +
          "- spartan/ui — [https://spartan.ng/components/data-table](https://spartan.ng/components/data-table)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/table](https://ui.shadcn.com/docs/components/table)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/data-table](https://ui.shadcn.com/docs/components/data-table)",
      },
    },
  },
  argTypes: {
    caption: { control: "text" },
    emptyText: { control: "text" },
  },
  args: { rows: ROWS, caption: null, emptyText: null, isSelected: () => false },
  render: (args) => ({
    props: {
      ...args,
      trackById: (r: NoteRow) => r.id,
      rowClass: (r: NoteRow) => ({ "is-muted": r.locked }),
    },
    template: `
      <sone-table [rows]="rows" [trackBy]="trackById" [rowClass]="rowClass"
        [caption]="caption" [emptyText]="emptyText" [isSelected]="isSelected">
        <sone-table-column key="title" header="Title">
          <ng-template let-row>{{ row.locked ? "🔒 Locked" : row.title }}</ng-template>
        </sone-table-column>
        <sone-table-column key="folder" header="Folder" width="140px">
          <ng-template let-row><span soneBadge variant="outline">{{ row.folder }}</span></ng-template>
        </sone-table-column>
        <sone-table-column key="modified" header="Last modified" width="140px" [alignEnd]="true">
          <ng-template let-row>{{ row.modified }}</ng-template>
        </sone-table-column>
        <sone-table-column key="actions" header="Actions" [hideHeader]="true" width="48px">
          <ng-template let-row>
            <sone-row-menu [label]="'Actions for ' + row.title">
              <button type="button" class="menu-item" role="menuitem">Open</button>
              <button type="button" class="menu-item menu-item-danger" role="menuitem">Move to trash</button>
            </sone-row-menu>
          </ng-template>
        </sone-table-column>
      </sone-table>`,
  }),
};
export default meta;
type Story = StoryObj<SoneTableComponent<NoteRow>>;

export const Notes: Story = {};

export const WithCaption: Story = {
  args: { caption: "Notes modified in the last 30 days." },
};

export const SelectedRow: Story = {
  args: { isSelected: (r: NoteRow) => r.id === "n1" },
};

export const Empty: Story = { args: { rows: [] } };

export const EmptyWithText: Story = {
  args: { rows: [], emptyText: "No notes match this view." },
};
