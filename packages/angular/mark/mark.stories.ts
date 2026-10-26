import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneMarkComponent } from "./mark.component";
import { MARK_TONES } from "./mark-tones";

const meta: Meta = {
  title: "Components/Element/Mark",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneMarkComponent] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-mark>` — an app or source mark: a small rounded tile (28% of its size round) with a " +
          "gradient `tone` and a white `icon`. Twelve tones from the `--mark-<tone>-from/-to` tokens; " +
          "`size` is `sm`, `md` (28px), `lg` or a number of px. Decorative unless it has a `label`.\n\n" +
          "**Reference**\n" +
          "- shadcn/ui — [avatar](https://ui.shadcn.com/docs/components/avatar)\n" +
          "- spartan/ui — [avatar](https://spartan.ng/components/avatar)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Tones: Story = {
  render: () => ({
    props: { tones: MARK_TONES },
    template: `<div style="display: flex; flex-wrap: wrap; gap: 12px">
      @for (tone of tones; track tone) { <sone-mark [tone]="tone" icon="sparkles" [label]="tone" /> }
    </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `<div style="display: flex; align-items: center; gap: 12px">
      <sone-mark size="sm" icon="code" tone="iris" />
      <sone-mark icon="code" tone="iris" />
      <sone-mark size="lg" icon="code" tone="iris" />
      <sone-mark [size]="56" icon="code" tone="iris" />
    </div>`,
  }),
};
