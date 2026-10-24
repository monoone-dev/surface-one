import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_APP_BAR_PARTS } from "./app-bar.component";

const meta: Meta = {
  title: "Components/Navigation/App bar",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_APP_BAR_PARTS, SoneButtonDirective, SoneIconComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-app-bar>` + `[soneAppBarTrailing]` — the top bar of a screen, the web twin of the " +
          "React Native `SoneAppBar`: a back button (`showBack` + `(back)`, or a `backHref` link), the " +
          "title as a real heading (`level`, default 1) with a `subtitle`, and trailing actions. It " +
          "renders a `<header>`; `sticky` pins it to the top and its padding clears the notch " +
          "(`env(safe-area-inset-top)`). `sonePageHeader` is the title block inside the content; this is " +
          "the bar above it.\n\n**Reference**\n" +
          "- Material Design — [top app bar](https://m3.material.io/components/top-app-bar/overview)\n" +
          "- Nuxt UI — [DashboardNavbar](https://ui.nuxt.com/docs/components/dashboard-navbar)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <sone-app-bar title="Inbox" subtitle="12 unread" showBack style="max-width: 24rem">
        <button soneAppBarTrailing soneBtn variant="ghost" size="icon" type="button" aria-label="Search">
          <sone-icon icon="search" />
        </button>
      </sone-app-bar>`,
  }),
};

export const TitleOnly: Story = {
  render: () => ({
    template: `<sone-app-bar title="Settings" style="max-width: 24rem" />`,
  }),
};

export const BackLink: Story = {
  render: () => ({
    template: `<sone-app-bar title="Invoice #1042" subtitle="Due in 3 days" backHref="#" level="2" style="max-width: 24rem" />`,
  }),
};
