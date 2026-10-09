import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneCommandDialogComponent } from "./command-dialog.component";
import { SONE_COMMAND_PARTS } from "./command.component";

const NOTES = [
  "Q4 planning",
  "Design review — Łódź office",
  "Weekly sync",
  "Café roadmap",
  "Hiring loop",
];

const meta: Meta = {
  title: "Components/Navigation/Command",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_COMMAND_PARTS,
        SoneCommandDialogComponent,
        SoneButtonDirective,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-command>` + `input[soneCommandInput]` / `[soneCommandList]` / `[soneCommandGroup]` " +
          "(`heading`) / `[soneCommandItem]` (`value`, `keywords`, `disabled`, `(select)`) / " +
          "`[soneCommandEmpty]` / `[soneCommandSeparator]`, and `<sone-command-dialog>` — shadcn/ui " +
          "Command and spartan/ui brn-command. The input is a WAI-ARIA combobox that keeps focus and " +
          "points `aria-activedescendant` at the highlighted option of the listbox. Arrow keys, Home / " +
          "End and PageUp / PageDown move the highlight (`loop` wraps), Enter selects it, the pointer " +
          "highlights on hover. Filtering is built in — case- and accent-insensitive over `value` and " +
          "`keywords`, every word must match — or custom (`[filter]`), or off (`shouldFilter=false`) " +
          "for server-side search. `[(search)]` and `[(active)]` are two-way. An input that lives " +
          "elsewhere (a textarea's slash menu) forwards its keys to `handleKeydown()`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [command](https://spartan.ng/components/command)\n" +
          "- shadcn/ui — [command](https://ui.shadcn.com/docs/components/command)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const LIST = `
  <input soneCommandInput placeholder="Type a command or search…" aria-label="Search" />
  <div soneCommandList aria-label="Commands">
    <div soneCommandEmpty>No results found.</div>
    <div soneCommandGroup heading="Notes">
      @for (note of notes; track note) {
        <div soneCommandItem>{{ note }}</div>
      }
    </div>
    <div soneCommandSeparator></div>
    <div soneCommandGroup heading="Actions">
      <div soneCommandItem [keywords]="['create', 'add']">New note</div>
      <div soneCommandItem disabled>Export (locked)</div>
    </div>
  </div>`;

export const Default: Story = {
  render: () => ({
    props: { notes: NOTES },
    template: `<sone-command style="max-width: 26rem; box-shadow: 0 0 0 1px var(--border)">${LIST}</sone-command>`,
  }),
};

export const Filtered: Story = {
  render: () => ({
    props: { notes: NOTES, search: "lodz" },
    template: `<sone-command [(search)]="search" style="max-width: 26rem; box-shadow: 0 0 0 1px var(--border)">${LIST}</sone-command>`,
  }),
};

export const Empty: Story = {
  render: () => ({
    props: { notes: NOTES, search: "zzz" },
    template: `<sone-command [(search)]="search" style="max-width: 26rem; box-shadow: 0 0 0 1px var(--border)">${LIST}</sone-command>`,
  }),
};

export const ServerSide: Story = {
  render: () => ({
    props: { notes: NOTES.slice(0, 2), search: "anything" },
    template: `
      <sone-command [(search)]="search" [shouldFilter]="false" style="max-width: 26rem; box-shadow: 0 0 0 1px var(--border)">
        <input soneCommandInput aria-label="Search the server" />
        <div soneCommandList aria-label="Results">
          @for (note of notes; track note) {
            <div soneCommandItem>{{ note }}</div>
          }
        </div>
      </sone-command>`,
  }),
};

export const Dialog: Story = {
  render: () => ({
    props: { notes: NOTES, open: false },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open = true">Open the palette</button>
      @if (open) {
        <sone-command-dialog label="Command palette" (dismiss)="open = false">
          <sone-command>${LIST}</sone-command>
        </sone-command-dialog>
      }`,
  }),
};
