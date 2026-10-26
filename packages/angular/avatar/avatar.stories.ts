import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SONE_AVATAR_PARTS,
  type AvatarShape,
  type AvatarSize,
} from "./avatar.component";

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
          'Sizes: `sm` 24, `default` 32, `lg` 40. `shape="square"` rounds a square instead ' +
          "(a team, a workspace, an app), its corners a share of the size (`--avatar-square-ratio`).\n\n**Reference**\n" +
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

/** `shape="square"` (Isles): a rounded square whose corners scale with the size. */
export const Square: StoryObj<{ size: AvatarSize; shape: AvatarShape }> = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-3); align-items: center">
        <sone-avatar shape="square" size="sm"><span soneAvatarFallback>AC</span></sone-avatar>
        <sone-avatar shape="square"><span soneAvatarFallback>DS</span></sone-avatar>
        <sone-avatar shape="square" size="lg"><span soneAvatarFallback>IO</span></sone-avatar>
        <sone-avatar shape="square" size="lg" />
      </div>`,
  }),
};
