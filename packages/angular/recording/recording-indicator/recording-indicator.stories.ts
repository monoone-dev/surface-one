import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  type RecordingIndicatorSize,
  type RecordingIndicatorState,
  SoneRecordingIndicatorComponent,
} from "./recording-indicator.component";

interface Args {
  seconds: number;
  label: string | null;
  state: RecordingIndicatorState;
  size: RecordingIndicatorSize;
}

const meta: Meta<Args> = {
  title: "Components/Recording/Recording indicator",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneRecordingIndicatorComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-recording-indicator>` — the “recording is running” row: `<sone-status-orb>` (`live` pulse or " +
          '`paused` bars), a live `<sone-elapsed-timer>` (`role="timer"`, named by `timerLabel`) and an optional ' +
          "`label`. `size`: `default` (a page header) or `sm` (the floating bar). Put it in your own " +
          '`role="status"` only around text that changes rarely — a ticking clock in a live region is noise.\n\n' +
          "**Reference**\n" +
          "- shadcn/ui badge (status anatomy) — [https://ui.shadcn.com/docs/components/badge](https://ui.shadcn.com/docs/components/badge)",
      },
    },
  },
  argTypes: {
    state: { control: "inline-radio", options: ["live", "paused"] },
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
  args: { seconds: 754, label: "Recording", state: "live", size: "default" },
  render: (args) => ({
    props: args,
    template: `<sone-recording-indicator [seconds]="seconds" [label]="label" [state]="state" [size]="size" />`,
  }),
};
export default meta;
type Story = StoryObj<Args>;
export const Live: Story = {};
export const Paused: Story = { args: { state: "paused", label: "Paused" } };
export const NoLabel: Story = { args: { label: null } };
export const Small: Story = { args: { size: "sm", label: null } };
