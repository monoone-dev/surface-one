import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  type ProcessingStatusSize,
  SoneProcessingStatusComponent,
} from "./processing-status.component";

interface Args {
  stage: string;
  message: string | null;
  progress: number | null;
  showProgress: boolean;
  size: ProcessingStatusSize;
}

const STAGES = [
  "recording",
  "transcribing",
  "summarizing",
  "exporting",
  "saved",
  "finalized",
  "done",
  "error",
];

const meta: Meta<Args> = {
  title: "Components/Recording/Processing status",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneProcessingStatusComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-processing-status>` — where a recording is in the pipeline: the processing `<sone-status-orb>`, " +
          "the stage label and a thin `<sone-progress>` (`progress` 0..1, `null` = indeterminate; `showProgress` " +
          "off for a compact row). Built-in, localised labels for `recording`, `transcribing`, `summarizing`, " +
          "`exporting`, `saved`, `finalized`, `done`, `error` (`processingStageLabel()` in `core`); override them " +
          "with `labels`, or show a live `message` instead. `error` swaps the orb for the error mark and hides " +
          'the track. The host is `role="status"`, so a stage change is announced once.\n\n**Reference**\n' +
          "- spartan/ui progress — [https://spartan.ng/components/progress](https://spartan.ng/components/progress)\n" +
          "- shadcn/ui progress — [https://ui.shadcn.com/docs/components/progress](https://ui.shadcn.com/docs/components/progress)",
      },
    },
  },
  argTypes: {
    stage: { control: "select", options: STAGES },
    progress: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
  args: {
    stage: "transcribing",
    message: null,
    progress: null,
    showProgress: true,
    size: "default",
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 360px"><sone-processing-status [stage]="stage" [message]="message"
      [progress]="progress" [showProgress]="showProgress" [size]="size" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<Args>;
export const Indeterminate: Story = {};
export const Determinate: Story = {
  args: { stage: "summarizing", progress: 0.42 },
};
export const Message: Story = {
  args: { message: "Transcribing 3 of 7 chunks…", progress: 0.43 },
};
export const Failed: Story = { args: { stage: "error" } };
export const CompactRow: Story = {
  args: { size: "sm", showProgress: false, stage: "exporting" },
};
export const AllStages: Story = {
  render: () => ({
    props: { stages: STAGES },
    template: `<div style="display: grid; gap: var(--space-3); max-width: 360px">
      @for (s of stages; track s) { <sone-processing-status [stage]="s" size="sm" /> }
    </div>`,
  }),
};
