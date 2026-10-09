import { signal } from "@angular/core";
import type { Meta, StoryObj } from "@storybook/angular";

import { type SoneStep, SoneStepperComponent } from "./stepper.component";

const SETUP: readonly SoneStep[] = [
  { key: "mic", label: "Microphone", description: "Allow audio capture" },
  { key: "audio", label: "System audio", description: "Hear the other side" },
  { key: "model", label: "Model", description: "Download on-device speech" },
  { key: "done", label: "Ready", description: "Record your first meeting" },
];

const meta: Meta<SoneStepperComponent> = {
  title: "Components/Forms/Stepper",
  component: SoneStepperComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-stepper>` — progress through a multi-step flow. `steps` (`{ key, label, description? }[]`), " +
          "`[(current)]` = the active step's **index** (clamped), `variant` `dots` (the compact onboarding " +
          "progress: a pill for the active step, labels visually hidden) or `numbered` (circles, a check on " +
          'completed steps, titles and descriptions, connectors), `orientation`, and the "Step x of y" text ' +
          "(`showCount`). Steps are buttons that set `current` and emit `(stepClick)`; `linear` keeps the " +
          "user from jumping ahead, `disabled` makes the stepper a progress display only. The active step " +
          'carries `aria-current="step"`; the host is a labelled `role="group"` (`ariaLabel`).' +
          "\n\n**Reference**\n" +
          "- Nuxt UI — [https://ui.nuxt.com/docs/components/stepper](https://ui.nuxt.com/docs/components/stepper)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components](https://ui.shadcn.com/docs/components) (no stepper; the look follows its Progress / Badge tokens)\n" +
          "- spartan/ui — [https://spartan.ng/components](https://spartan.ng/components) (no stepper yet)",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["dots", "numbered"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    current: { control: { type: "number", min: 0, max: 3 } },
    linear: { control: "boolean" },
    disabled: { control: "boolean" },
    showCount: { control: "boolean" },
  },
  args: {
    steps: SETUP,
    current: 1,
    variant: "dots",
    orientation: "horizontal",
    linear: false,
    disabled: false,
    showCount: true,
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 40rem">
      <sone-stepper [steps]="steps" [(current)]="current" [variant]="variant" [orientation]="orientation"
        [linear]="linear" [disabled]="disabled" [showCount]="showCount" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneStepperComponent>;

export const Dots: Story = {};

export const DotsProgressOnly: Story = {
  args: { disabled: true, ariaLabel: "Setup progress" },
};

export const Numbered: Story = { args: { variant: "numbered" } };

export const NumberedVertical: Story = {
  args: { variant: "numbered", orientation: "vertical", showCount: false },
};

export const Linear: Story = {
  args: { variant: "numbered", linear: true, current: 1 },
};

export const Completed: Story = {
  args: { variant: "numbered", current: 3 },
};

export const SignalBinding: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { steps: SETUP, at: signal(0) },
    template: `
      <sone-stepper [steps]="steps" [(current)]="at" variant="numbered" linear />
      <p style="color: var(--text-tertiary); font-size: var(--font-size-xs)">current: {{ at() }}</p>
      <button type="button" (click)="at.set(at() + 1)">Next</button>`,
  }),
};
