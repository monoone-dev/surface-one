import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneMicToggleComponent } from "./mic-toggle.component";

const meta: Meta<{ muted: boolean; compact: boolean; disabled: boolean }> = {
  title: "Components/Recording/Mic toggle",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneMicToggleComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-mic-toggle>` — the microphone mute switch: an outline `soneToggle` pill (ON = muted) that takes " +
          "the warm live fill when muted. `compact` = icon only. Presentational: emits `muteToggle`; the caller " +
          "changes the state.",
      },
    },
  },
  args: { muted: false, compact: false, disabled: false },
  render: (args) => ({
    props: args,
    template: `<sone-mic-toggle [muted]="muted" [compact]="compact" [disabled]="disabled" (muteToggle)="muted = !muted" />`,
  }),
};
export default meta;
type Story = StoryObj<{ muted: boolean; compact: boolean; disabled: boolean }>;
export const Live: Story = {};
export const Muted: Story = { args: { muted: true } };
export const Compact: Story = { args: { compact: true } };
export const CompactMuted: Story = { args: { compact: true, muted: true } };
