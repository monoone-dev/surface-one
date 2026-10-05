import type { Meta, StoryObj } from "@storybook/angular";

import { SoneDownloadProgressComponent } from "./download-progress.component";

const meta: Meta<SoneDownloadProgressComponent> = {
  title: "Components/Feedback/Download Progress",
  component: SoneDownloadProgressComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-download-progress>` — a `<sone-progress>` bar, a muted caption (“Downloading… 42%”) and an " +
          "optional ghost **Cancel** button (`cancellable`, emits `cancelRequested`). `frac` is 0..1; `null` is the " +
          "indeterminate bar. The percent joins the caption once `frac > 0` (or always, when `label` is empty); " +
          'until then a spinner stands in for it. `size="md"` is the wizard bar with a larger caption. ' +
          'Host: `data-slot="download-progress"`, `data-state` = `indeterminate` | `loading` | `complete`.\n\n' +
          "Own composite (source order step 4) on shadcn's Progress + Button.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/progress](https://spartan.ng/components/progress)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/progress](https://ui.shadcn.com/docs/components/progress)",
      },
    },
  },
  argTypes: {
    frac: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
    label: { control: "text" },
    size: { control: "inline-radio", options: ["sm", "md"] },
    cancellable: { control: "boolean" },
  },
  args: {
    frac: 0.42,
    label: "Downloading…",
    size: "sm",
    cancellable: true,
    ariaLabel: "Example model download",
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 420px">
      <sone-download-progress [frac]="frac" [label]="label" [size]="size" [cancellable]="cancellable"
        [ariaLabel]="ariaLabel" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneDownloadProgressComponent>;

export const Determinate: Story = {};
export const Starting: Story = { args: { frac: 0 } };
export const Indeterminate: Story = {
  args: { frac: null, label: "Preparing…", cancellable: false },
};
export const PercentOnly: Story = {
  args: { label: "", frac: 0.18, cancellable: false },
};
export const NamedModel: Story = {
  render: () => ({
    template: `<div style="max-width: 420px">
      <sone-download-progress label="Example-3B" separator=" · " [frac]="0.63" ariaLabel="Example download" /></div>`,
  }),
};
export const Wizard: Story = { args: { size: "md", frac: 0.7 } };
