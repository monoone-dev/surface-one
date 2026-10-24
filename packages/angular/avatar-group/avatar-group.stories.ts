import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SONE_AVATAR_PARTS,
  type AvatarSize,
} from "@surface-one/angular/avatar";
import { SoneAvatarGroupComponent } from "./avatar-group.component";

const PEOPLE = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Alan Turing" },
  { name: "Katherine Johnson" },
  { name: "Linus Torvalds" },
  { name: "Margaret Hamilton" },
];

const meta: Meta<{ size: AvatarSize; max: number }> = {
  title: "Components/Data display/Avatar group",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneAvatarGroupComponent, ...SONE_AVATAR_PARTS],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-avatar-group>` — overlapping avatars with a “+N” for the rest, the web twin of the " +
          "React Native `SoneAvatarGroup`. Give `people` (`{ name, src }`: the image, else the initials " +
          "`soneInitials(name)` gives) or project `sone-avatar` children; `max` caps how many show and " +
          '`size` applies to all. The host is a `role="group"` named by `ariaLabel`; each person and the ' +
          "overflow avatar are images named by the person and by `overflowLabel` (“2 more”).\n\n**Reference**\n" +
          "- shadcn/ui — [avatar group](https://ui.shadcn.com/docs/components/avatar)\n" +
          "- Nuxt UI — [AvatarGroup](https://ui.nuxt.com/docs/components/avatar-group)",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    max: { control: { type: "number", min: 0, max: 6 } },
  },
  args: { size: "default", max: 4 },
  render: (args) => ({
    props: { ...args, people: PEOPLE },
    template: `<sone-avatar-group ariaLabel="Project members" [people]="people" [max]="max" [size]="size" />`,
  }),
};
export default meta;
type Story = StoryObj<{ size: AvatarSize; max: number }>;

export const Default: Story = {};

export const Children: Story = {
  render: (args) => ({
    props: args,
    template: `
      <sone-avatar-group ariaLabel="Reviewers" [max]="max" [size]="size">
        <sone-avatar role="img" aria-label="Ada Lovelace"><span soneAvatarFallback aria-hidden="true">AL</span></sone-avatar>
        <sone-avatar role="img" aria-label="Grace Hopper"><span soneAvatarFallback aria-hidden="true">GH</span></sone-avatar>
        <sone-avatar role="img" aria-label="Alan Turing"><span soneAvatarFallback aria-hidden="true">AT</span></sone-avatar>
        <sone-avatar role="img" aria-label="Katherine Johnson"><span soneAvatarFallback aria-hidden="true">KJ</span></sone-avatar>
        <sone-avatar role="img" aria-label="Linus Torvalds"><span soneAvatarFallback aria-hidden="true">LT</span></sone-avatar>
      </sone-avatar-group>`,
  }),
  args: { max: 3 },
};
