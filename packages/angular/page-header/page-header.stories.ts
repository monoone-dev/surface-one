import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_PAGE_HEADER_PARTS } from "./page-header.directive";

const meta: Meta = {
  title: "Components/Layout/Page header",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_PAGE_HEADER_PARTS, SoneButtonDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[sonePageHeader]` — a route's title block: `sonePageHeaderContent` (eyebrow, title, " +
          "description) and `sonePageHeaderActions`, which wrap under the copy when the page is narrow.",
      },
    },
  },
  render: () => ({
    template: `
      <header sonePageHeader>
        <div sonePageHeaderContent>
          <p sonePageHeaderEyebrow>Workspace</p>
          <h1 sonePageHeaderTitle>Reminders</h1>
          <p sonePageHeaderDescription>Follow-ups connected to the notes and meetings that shaped them.</p>
        </div>
        <div sonePageHeaderActions><button soneBtn type="button">New reminder</button></div>
      </header>`,
  }),
};
export default meta;
export const Default: StoryObj = {};
