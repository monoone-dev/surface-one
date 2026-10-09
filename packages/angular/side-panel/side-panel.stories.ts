import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_SIDE_PANEL_PARTS } from "./side-panel-parts.directive";

const meta: Meta = {
  title: "Components/Layout/Side panel",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_SIDE_PANEL_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "A tool panel docked beside the page (`soneSidePanel`) with a header, title, actions, " +
          "`<sone-side-panel-close>` and a scrolling body — the in-flow sibling of shadcn's " +
          "[Sheet](https://ui.shadcn.com/docs/components/sheet) / spartan's " +
          "[Sheet](https://spartan.ng/components/sheet).",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `<div style="display: flex; height: 20rem">
      <aside soneSidePanel aria-labelledby="sp-story-title">
        <header soneSidePanelHeader>
          <h2 soneSidePanelTitle id="sp-story-title">Details</h2>
          <div soneSidePanelActions>
            <sone-side-panel-close label="Close details" />
          </div>
        </header>
        <div soneSidePanelContent><p>Created 9 October · 3 participants · 42 minutes.</p></div>
      </aside>
    </div>`,
  }),
};
