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
          "Content is projected; the trailing close button (`closed`) hides the bar — a recording keeps running " +
          "(`closable` false drops it). `dragRegionAttr` puts one attribute on the bar's own chrome so a desktop " +
          "shell can drag the window by it: IndexOne passes `data-tauri-drag-region`, and the default " +
          "`dragRegionValue` `deep` lets Tauri drag from anywhere in the bar except interactive elements — no " +
          "attribute on each child.",
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

export const NotClosable: Story = {
  render: () => ({
    template: `<div style="width: 26rem; height: 3rem">
      <sone-floating-bar state="processing" [closable]="false"><span>Writing the note…</span></sone-floating-bar>
    </div>`,
  }),
};

export const DragRegion: Story = {
  render: () => ({
    template: `<div style="width: 26rem; height: 3rem">
      <sone-floating-bar state="live" dragRegionAttr="data-tauri-drag-region"><span>Recording · 02:14</span></sone-floating-bar>
    </div>`,
  }),
};
