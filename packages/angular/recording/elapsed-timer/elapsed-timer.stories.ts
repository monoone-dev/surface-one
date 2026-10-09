import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  type ElapsedTimerSize,
  SoneElapsedTimerComponent,
} from "./elapsed-timer.component";

interface Args {
  seconds: number;
  live: boolean;
  size: ElapsedTimerSize;
}

const meta: Meta<Args> = {
  title: "Components/Recording/Elapsed timer",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneElapsedTimerComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-elapsed-timer>` — a running time in tabular mono figures (`12:04`, `1:02:07` via `clockTime`), " +
          'rendered as `<time datetime="PT12M4S">`. `live` adds `role="timer"`: a live region whose `aria-live` ' +
          "is off, so a screen reader reads it on demand and never announces every tick (WAI-ARIA timer role). " +
          "Name it with `ariaLabel` when `live`. `size`: `default`, `sm`.\n\n**Reference**\n" +
          "- shadcn/ui typography — [https://ui.shadcn.com/docs/components/typography](https://ui.shadcn.com/docs/components/typography)\n" +
          "- WAI-ARIA timer role — [https://www.w3.org/TR/wai-aria-1.2/#timer](https://www.w3.org/TR/wai-aria-1.2/#timer)",
      },
    },
  },
  argTypes: {
    seconds: { control: { type: "number", min: 0, step: 1 } },
    size: { control: "inline-radio", options: ["default", "sm"] },
  },
  args: { seconds: 724, live: false, size: "default" },
  render: (args) => ({
    props: args,
    template: `<sone-elapsed-timer [seconds]="seconds" [live]="live" [size]="size" ariaLabel="Recording time" />`,
  }),
};
export default meta;
type Story = StoryObj<Args>;
export const Default: Story = {};
export const Hours: Story = { args: { seconds: 3727 } };
export const Live: Story = { args: { live: true } };
export const Small: Story = { args: { size: "sm" } };
