import { SoneButtonDirective } from "@surface-one/angular/button";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SONE_SECTION_HEADING_PARTS,
  SoneSectionHeadingComponent,
} from "./section-heading.component";

const meta: Meta<SoneSectionHeadingComponent> = {
  title: "Components/Layout/Section Heading",
  component: SoneSectionHeadingComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneButtonDirective, ...SONE_SECTION_HEADING_PARTS],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-section-heading>` — the heading row of a section: a real `h2`–`h4` (`level`, default 2) " +
          "with the `title`, an optional `count` in a secondary badge, and `[soneSectionHeadingActions]` at the " +
          "end of the row.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<SoneSectionHeadingComponent>;

export const Default: Story = {
  render: () => ({
    template: `
      <sone-section-heading title="Meetings" [count]="24" style="max-width: 36rem">
        <button soneSectionHeadingActions type="button" soneBtn variant="outline" size="sm">New meeting</button>
      </sone-section-heading>`,
  }),
};

export const Levels: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-4); max-width: 36rem">
        <sone-section-heading title="Level 2" [count]="3" />
        <sone-section-heading title="Level 3" [level]="3" [count]="3" />
        <sone-section-heading title="Level 4" [level]="4" />
      </div>`,
  }),
};
