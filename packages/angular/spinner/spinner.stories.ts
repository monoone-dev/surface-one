import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneSpinnerComponent } from "./spinner.component";

const meta: Meta<SoneSpinnerComponent> = {
  title: "Components/Feedback/Spinner",
  component: SoneSpinnerComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [SoneButtonDirective, SoneBadgeDirective] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-spinner>` — shadcn/ui Spinner (lucide Loader2, 1s spin — the same glyph in every skin). Drawn in `currentColor`, so it " +
          "takes the ink of its container. `size` is the diameter in px: 12 (xs rows, badges), 16 (default), " +
          '24 (empty-state media), 40 (a pane loader). `label` is the accessible name (`role="status"`, ' +
          'default “Loading”); pass `[label]="null"` when the surrounding text already says “Saving…”.' +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/spinner](https://spartan.ng/components/spinner)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/spinner](https://ui.shadcn.com/docs/components/spinner)",
      },
    },
  },
  argTypes: {
    size: { control: { type: "range", min: 10, max: 64, step: 2 } },
    label: { control: "text" },
  },
  args: { size: 16, label: "Loading" },
};
export default meta;
type Story = StoryObj<SoneSpinnerComponent>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-5); color: var(--text-secondary)">
        <sone-spinner [size]="12" /><sone-spinner [size]="16" /><sone-spinner [size]="24" /><sone-spinner [size]="40" />
      </div>`,
  }),
};

export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-5)">
        <span style="color: var(--text-primary)"><sone-spinner [size]="24" /></span>
        <span style="color: var(--text-secondary)"><sone-spinner [size]="24" /></span>
        <span style="color: var(--accent-text)"><sone-spinner [size]="24" /></span>
        <span style="color: var(--success)"><sone-spinner [size]="24" /></span>
        <span style="color: var(--danger)"><sone-spinner [size]="24" /></span>
      </div>`,
  }),
};

export const InButton: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-3)">
        <button soneBtn size="sm" type="button" disabled><sone-spinner [label]="null" /> Saving…</button>
        <button soneBtn variant="outline" size="sm" type="button" disabled><sone-spinner [label]="null" /> Please wait</button>
        <button soneBtn variant="secondary" size="sm" type="button" disabled><sone-spinner [label]="null" /> Processing</button>
        <button soneBtn variant="ghost" size="icon-sm" type="button" disabled aria-label="Syncing"><sone-spinner [label]="null" /></button>
      </div>`,
  }),
};

export const InBadge: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-3)">
        <span soneBadge><sone-spinner [size]="12" [label]="null" /> Syncing</span>
        <span soneBadge variant="secondary"><sone-spinner [size]="12" [label]="null" /> Transcribing</span>
        <span soneBadge variant="outline"><sone-spinner [size]="12" [label]="null" /> Indexing</span>
      </div>`,
  }),
};
