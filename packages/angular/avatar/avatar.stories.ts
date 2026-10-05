import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_AVATAR_PARTS, type AvatarSize } from "./avatar.component";

const meta: Meta<{ size: AvatarSize }> = {
  title: "Components/Data display/Avatar",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_AVATAR_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-avatar>` + `img[soneAvatarImage]` + `[soneAvatarFallback]` — spartan/ui `hlm-avatar`. " +
          "The image shows once it has loaded; a missing or broken one falls back to the initials. " +
          "With no image and no fallback it shows a generic person glyph (signed-out state). " +
          "Sizes: `sm` 24, `default` 32, `lg` 40.\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/avatar](https://spartan.ng/components/avatar)",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
  },
  args: { size: "default" },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: var(--space-3); align-items: center">
        <sone-avatar [size]="size"><span soneAvatarFallback>AK</span></sone-avatar>
        <sone-avatar [size]="size"><img soneAvatarImage src="/does-not-exist.png" alt="" /><span soneAvatarFallback>JD</span></sone-avatar>
        <sone-avatar [size]="size" />
      </div>`,
  }),
};
export default meta;
export const Default: StoryObj<{ size: AvatarSize }> = {};
