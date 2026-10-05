import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_BUBBLE_PARTS, type BubbleVariant } from "./bubble.directive";

const VARIANTS: readonly BubbleVariant[] = [
  "default",
  "secondary",
  "muted",
  "tinted",
  "outline",
  "ghost",
  "destructive",
];

interface BubbleArgs {
  variant: BubbleVariant;
  align: "start" | "end";
  text: string;
}

const meta: Meta<BubbleArgs> = {
  title: "Components/Chat/Bubble",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_BUBBLE_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneBubble]` + `[soneBubbleContent]` — the speech bubble of a message. spartan/ui Bubble, 1:1: " +
          "the bubble is a fit-content column (≤ 80%; `ghost` takes the full width), the content the padded " +
          "`rounded-xl` box with the fill. Variants: `default` (primary), `secondary`, `muted`, `tinted` " +
          "(primary pulled toward the page — `--bubble-tinted-bg`), `outline`, `ghost` (no frame, no inset), " +
          "`destructive`. `[soneBubbleGroup]` stacks bubbles. A `<button soneBubbleContent>` gets the focus " +
          "ring. CSS: `bubble.css`.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://www.spartan.ng/components/bubble](https://www.spartan.ng/components/bubble)",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    align: { control: "inline-radio", options: ["start", "end"] },
    text: { control: "text" },
  },
  args: {
    variant: "default",
    align: "start",
    text: "Who owns the flag rollout?",
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; max-width: 480px">
        <div soneBubble [variant]="variant" [align]="align"><div soneBubbleContent>{{ text }}</div></div>
      </div>`,
  }),
};
export default meta;

export const Default: StoryObj<BubbleArgs> = {};

export const Variants: StoryObj<BubbleArgs> = {
  render: () => ({
    props: { variants: VARIANTS },
    template: `
      <div soneBubbleGroup style="max-width: 480px">
        @for (v of variants; track v) {
          <div soneBubble [variant]="v"><div soneBubbleContent>{{ v }} — a short message</div></div>
        }
      </div>`,
  }),
};
