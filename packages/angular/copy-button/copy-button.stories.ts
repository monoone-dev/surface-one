import type { Meta, StoryObj } from "@storybook/angular";

import { SoneCopyButtonComponent } from "./copy-button.component";

const meta: Meta<SoneCopyButtonComponent> = {
  title: "Components/Forms/Copy Button",
  component: SoneCopyButtonComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-copy-button>` — copies `value` to the clipboard from the click handler (SSR-safe; " +
          "`navigator.clipboard`, falling back to the legacy copy command), swaps to `copiedLabel` and a check " +
          "for `resetAfter` ms (1.5 s; the timer is cleared on destroy) and announces it in a polite live " +
          "region. A `soneBtn` underneath: `variant` (`outline`), `size` (`sm`, or `icon-sm` with `iconOnly`). " +
          "`iconOnly` keeps only the glyph and names it with `label` / `copiedLabel`. `(copied)` emits the value, " +
          "`(copyError)` the reason." +
          "\n\n**Reference**\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/button](https://ui.shadcn.com/docs/components/button) (the copy button of its code blocks)\n" +
          "- spartan/ui — [https://spartan.ng/components/button](https://spartan.ng/components/button)",
      },
    },
  },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "secondary", "outline", "ghost"],
    },
    iconOnly: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    value: "mtg_01J9ZK3Q7R4M2",
    label: "Copy",
    copiedLabel: "Copied",
    variant: "outline",
    iconOnly: false,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<sone-copy-button [value]="value" [label]="label" [copiedLabel]="copiedLabel"
      [variant]="variant" [iconOnly]="iconOnly" [disabled]="disabled" />`,
  }),
};
export default meta;
type Story = StoryObj<SoneCopyButtonComponent>;

export const Default: Story = {};
export const IconOnly: Story = {
  args: { iconOnly: true, variant: "ghost", label: "Copy meeting ID" },
};
export const RecoveryPhrase: Story = {
  args: {
    value: "orbit lamp velvet …",
    label: "Copy phrase",
    variant: "secondary",
  },
};
export const Disabled: Story = { args: { disabled: true } };
