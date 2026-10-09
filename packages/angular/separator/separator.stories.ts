import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSeparatorDirective } from "./separator.directive";

interface SeparatorArgs {
  orientation: "horizontal" | "vertical";
  decorative: boolean;
}

const meta: Meta<SeparatorArgs> = {
  title: "Components/Layout/Separator",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneSeparatorDirective] })],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneSeparator]` — spartan/ui Separator: a 1px `--border` hairline. `orientation` = " +
          "`horizontal` (default, full width) | `vertical` (stretches to the row). Decorative by default " +
          '(`role="none"`); `[decorative]="false"` makes it a real `role="separator"` with `aria-orientation`.' +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/separator](https://spartan.ng/components/separator)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/separator](https://ui.shadcn.com/docs/components/separator)",
      },
    },
  },
  argTypes: {
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    decorative: { control: "boolean" },
  },
  args: { orientation: "horizontal", decorative: true },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 24rem; font-size: var(--font-size-sm)">
        <div style="display: flex; flex-direction: column; gap: var(--space-2)">
          <strong style="color: var(--text-primary); font-weight: var(--font-weight-medium)">Acme</strong>
          <span style="color: var(--text-secondary)">Local-first meeting notes.</span>
        </div>
        <div soneSeparator [orientation]="orientation" [decorative]="decorative"></div>
        <span style="color: var(--text-secondary)">Audio and transcripts never leave this Mac.</span>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SeparatorArgs>;

export const Horizontal: Story = {};

export const Vertical: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-4); height: 20px; color: var(--text-secondary); font-size: var(--font-size-sm)">
        <span>Notes</span>
        <span soneSeparator orientation="vertical"></span>
        <span>Meetings</span>
        <span soneSeparator orientation="vertical"></span>
        <span>People</span>
      </div>`,
  }),
};

export const ListOnCard: Story = {
  render: () => ({
    template: `
      <div class="card" style="max-width: 24rem; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2); font-size: var(--font-size-sm)">
        <div style="display: flex; justify-content: space-between"><span>Transcription</span><span style="color: var(--text-secondary)">On-device</span></div>
        <hr soneSeparator />
        <div style="display: flex; justify-content: space-between"><span>Summaries</span><span style="color: var(--text-secondary)">Claude Code</span></div>
        <hr soneSeparator [decorative]="false" />
        <div style="display: flex; justify-content: space-between"><span>Storage</span><span style="color: var(--text-secondary)">Encrypted on this Mac</span></div>
      </div>`,
  }),
};
