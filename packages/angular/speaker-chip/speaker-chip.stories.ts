import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  type SpeakerChipSize,
  SoneSpeakerChipComponent,
} from "./speaker-chip.component";

interface Args {
  speaker: string | null;
  label: string | null;
  size: SpeakerChipSize;
}

const meta: Meta<Args> = {
  title: "Components/Media/Speaker chip",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneSpeakerChipComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-speaker-chip>` — who is talking: an `sm` `<sone-avatar>` with the initials in the speaker's " +
          "tone plus the name. One key drives both, through the pure helpers in `@surface-one/angular/core`: " +
          "`speakerLabel()` (`me` → Me, `others` → Others, `others-N` → Speaker N+1, `speaker-N` → Speaker N, " +
          "localised) and `speakerTone()` (`me` or `others`). `label` replaces the name; an unknown key is shown " +
          "as it is. `size`: `default`, `sm`.\n\n**Reference**\n" +
          "- spartan/ui avatar — [https://spartan.ng/components/avatar](https://spartan.ng/components/avatar)\n" +
          "- shadcn/ui avatar — [https://ui.shadcn.com/docs/components/avatar](https://ui.shadcn.com/docs/components/avatar)",
      },
    },
  },
  argTypes: {
    speaker: {
      control: "select",
      options: ["me", "others", "others-0", "others-1", "speaker-3", "Anna"],
    },
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
  args: { speaker: "me", label: null, size: "default" },
  render: (args) => ({
    props: args,
    template: `<sone-speaker-chip [speaker]="speaker" [label]="label" [size]="size" />`,
  }),
};
export default meta;
type Story = StoryObj<Args>;
export const Me: Story = {};
export const Others: Story = { args: { speaker: "others" } };
export const Numbered: Story = { args: { speaker: "others-1" } };
export const CustomLabel: Story = {
  args: { speaker: "others-0", label: "Anna Kowalska" },
};
export const Small: Story = { args: { size: "sm", speaker: "others-0" } };
export const AllKeys: Story = {
  render: () => ({
    props: { keys: ["me", "others", "others-0", "others-1", "speaker-3"] },
    template: `<div style="display: flex; flex-wrap: wrap; gap: var(--space-4)">
      @for (k of keys; track k) { <sone-speaker-chip [speaker]="k" /> }
    </div>`,
  }),
};
