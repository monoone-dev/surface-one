import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneLevelMeterComponent } from "./level-meter.component";

const meta: Meta<{ level: number; bars: number }> = {
  title: "Components/Recording/Level meter",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneLevelMeterComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-level-meter>` — the live input-level waveform: `bars` rounded bars swaying with `level` (0..1). " +
          "Decorative; its width is the caller's.",
      },
    },
  },
  argTypes: {
    level: { control: { type: "range", min: 0, max: 1, step: 0.05 } },
    bars: { control: { type: "range", min: 4, max: 48, step: 1 } },
  },
  args: { level: 0.45, bars: 30 },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-4); max-width: 320px">
        <sone-level-meter [level]="level" [bars]="bars" />
        <sone-level-meter style="width: 34px" [level]="level" [bars]="8" />
      </div>`,
  }),
};
export default meta;
export const Default: StoryObj<{ level: number; bars: number }> = {};
export const Silent: StoryObj<{ level: number; bars: number }> = {
  args: { level: 0 },
};
export const Loud: StoryObj<{ level: number; bars: number }> = {
  args: { level: 1 },
};
