import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSkeletonDirective } from "./skeleton.directive";

const meta: Meta = {
  title: "Components/Feedback/Skeleton",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneSkeletonDirective] })],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneSkeleton]` — spartan/ui `hlmSkeleton`: a muted, pulsing block sized by its host.\n\n" +
          "**Reference**\n- spartan/ui — [https://spartan.ng/components/skeleton](https://spartan.ng/components/skeleton)",
      },
    },
  },
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-4); align-items: center">
        <div soneSkeleton style="width: 48px; height: 48px; border-radius: var(--radius-pill)"></div>
        <div style="display: grid; gap: var(--space-2)">
          <div soneSkeleton style="width: 250px; height: 16px"></div>
          <div soneSkeleton style="width: 200px; height: 16px"></div>
        </div>
      </div>`,
  }),
};
export default meta;
export const Default: StoryObj = {};
