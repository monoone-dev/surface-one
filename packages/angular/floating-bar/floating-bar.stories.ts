import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneFloatingBarComponent } from "./floating-bar.component";

const meta: Meta<SoneFloatingBarComponent> = {
  title: "Components/Recording/Floating bar",
  component: SoneFloatingBarComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneFloatingBarComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "The pill that floats over every app while recording is ready, live or processing. " +
          "Content is projected; the trailing close button (`closed`) hides the bar — a recording keeps running.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<SoneFloatingBarComponent>;

const render = (state: string) => ({
  props: { state },
  template: `<div style="width: 26rem; height: 3rem">
    <sone-floating-bar [state]="state"><span>Ready · ⌘⇧R</span></sone-floating-bar>
  </div>`,
});

export const Idle: Story = { render: () => render("idle") };
export const Live: Story = { render: () => render("live") };
export const Processing: Story = { render: () => render("processing") };
