import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_PAGE_SITE_HEADER_PARTS } from "./page-site-header.component";

const NAV = `
  <nav sonePageSiteHeaderNav aria-label="Main" style="display: flex; gap: var(--space-4)">
    <a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#docs">Docs</a>
  </nav>`;
const MENU = `
  <nav sonePageSiteHeaderMenu aria-label="Main" style="display: flex; flex-direction: column; gap: var(--space-3)">
    <a href="#features">Features</a><a href="#pricing">Pricing</a><a href="#docs">Docs</a>
  </nav>`;

const meta: Meta = {
  title: "Components/Navigation/Page site header",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_PAGE_SITE_HEADER_PARTS, SoneButtonDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-page-site-header>` — a site header: a `title` link or `[sonePageSiteHeaderLogo]`, the " +
          "`[sonePageSiteHeaderNav]` navigation and `[sonePageSiteHeaderActions]`. Below a medium width " +
          "(a container query) the navigation gives way to a menu button that opens " +
          "`[sonePageSiteHeaderMenu]` in a sheet (focus trapped, Escape, the scrim or a link close it); " +
          "`[(open)]` is that sheet. It renders a `<header>`; `sticky` pins it to the top.\n\n**Reference**\n" +
          "- Nuxt UI — [Header](https://ui.nuxt.com/docs/components/header)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <sone-page-site-header title="Acme Notes" href="#">
        ${NAV}
        <a sonePageSiteHeaderActions soneBtn size="sm" href="#start">Get started</a>
        ${MENU}
      </sone-page-site-header>`,
  }),
};

export const Narrow: Story = {
  render: () => ({
    template: `
      <div style="max-width: 24rem">
        <sone-page-site-header title="Acme Notes" href="#">
          ${NAV}
          ${MENU}
        </sone-page-site-header>
      </div>`,
  }),
};
