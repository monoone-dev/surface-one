import type { Meta, StoryObj } from "@storybook/angular";

import { SoneProgressComponent } from "./progress.component";

const meta: Meta<SoneProgressComponent> = {
  title: "Components/Feedback/Progress",
  component: SoneProgressComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-progress>` — the ONE linear progress bar (spartan/ui Progress). The host is the track " +
          '(`role="progressbar"`, `data-state` = `indeterminate` | `loading` | `complete`).\n\n' +
          "- **Determinate** — `value` in `0..max`; the fill is a width %, `aria-valuenow` + `aria-valuetext` " +
          "(`valueLabel`, “42%” by default) are reported.\n" +
          "- **Indeterminate** — `value` is `null` (default); a sliver animates and both are omitted, " +
          "which is how a progressbar says “busy, amount unknown”.\n\n" +
          "`sm` (shadcn's one size: Nova 4px / Vega 6px / Maia 12px — `--progress-h`) for inline/settings rows, " +
          "`md` (`--progress-h-md`: 6 / 8 / 12px, no shadcn twin) for the onboarding and privacy wizards. " +
          "Always pass `ariaLabel`.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/progress](https://spartan.ng/components/progress)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/progress](https://ui.shadcn.com/docs/components/progress)",
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100, step: 1 } },
    max: { control: "number" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    tone: {
      control: "inline-radio",
      options: ["default", "warning", "destructive"],
    },
    ariaLabel: { control: "text" },
  },
  args: {
    value: 42,
    max: 100,
    size: "sm",
    tone: "default",
    ariaLabel: "Model download",
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 360px"><sone-progress [value]="value" [max]="max" [size]="size" [tone]="tone" [ariaLabel]="ariaLabel" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneProgressComponent>;

export const Determinate: Story = {};
export const Medium: Story = {
  args: { size: "md", value: 70, ariaLabel: "Setting up your workspace" },
};
export const Indeterminate: Story = {
  args: { value: null, ariaLabel: "Re-indexing" },
};
export const Empty: Story = {
  args: { value: 0, ariaLabel: "Download not started" },
};
export const Complete: Story = { args: { value: 100 } };
export const CustomMax: Story = {
  args: { value: 3, max: 8, ariaLabel: "Setup step" },
};

export const Tones: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-3); max-width: 360px">
        <sone-progress size="md" [value]="40" ariaLabel="Example usage" />
        <sone-progress size="md" tone="warning" [value]="80" ariaLabel="Example usage, nearing the cap" />
        <sone-progress size="md" tone="destructive" [value]="97" ariaLabel="Example usage, over the cap" />
      </div>`,
  }),
};

export const Matrix: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: auto 1fr 1fr; gap: var(--space-3) var(--space-5); align-items: center;
                  max-width: 640px; color: var(--text-secondary); font-size: var(--font-size-xs)">
        <span></span><span>sm</span><span>md</span>
        <span>0%</span>
        <sone-progress [value]="0" ariaLabel="sm empty" /><sone-progress size="md" [value]="0" ariaLabel="md empty" />
        <span>30%</span>
        <sone-progress [value]="30" ariaLabel="sm 30" /><sone-progress size="md" [value]="30" ariaLabel="md 30" />
        <span>100%</span>
        <sone-progress [value]="100" ariaLabel="sm done" /><sone-progress size="md" [value]="100" ariaLabel="md done" />
        <span>busy</span>
        <sone-progress ariaLabel="sm busy" /><sone-progress size="md" ariaLabel="md busy" />
      </div>`,
  }),
};

export const InCard: Story = {
  render: () => ({
    props: {
      mb: (v: number, max: number) =>
        `${Math.round((v / 100) * 740)} of 740 MB (${Math.round((v / max) * 100)}%)`,
    },
    template: `
      <div class="card" style="max-width: 420px; padding: var(--space-4); display: flex; flex-direction: column; gap: var(--space-2)">
        <div style="display: flex; justify-content: space-between; font-size: var(--font-size-sm)">
          <span style="color: var(--text-primary)">Downloading whisper large-v3-turbo</span>
          <span style="color: var(--text-secondary); font-variant-numeric: tabular-nums">42%</span>
        </div>
        <sone-progress [value]="42" [valueLabel]="mb" ariaLabel="Model download" />
      </div>`,
  }),
};
