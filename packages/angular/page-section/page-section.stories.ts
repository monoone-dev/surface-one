import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import type { PageLink } from "@surface-one/angular/core";
import type { PageFeatureItem } from "./page-feature-item";
import { SONE_PAGE_SECTION_PARTS } from "./page-section.component";

const FEATURES: PageFeatureItem[] = [
  {
    icon: "sparkles",
    title: "Summaries",
    description: "Every meeting ends with decisions and follow-ups.",
  },
  {
    icon: "search",
    title: "Search",
    description: "Find what was said, by whom and when.",
  },
  {
    icon: "lock",
    title: "Private",
    description: "Your notes stay on your devices.",
  },
];
const LINKS: PageLink[] = [{ label: "Explore features", href: "#features" }];

const meta: Meta = {
  title: "Components/Layout/Page section",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_PAGE_SECTION_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-page-section>` + `sone-page-features` / `sone-page-feature` — a section of a landing page: " +
          "`icon`, `headline`, `title` (a real heading, `level` 2 by default), `description`, a grid of " +
          "`features` (`{ icon, title, description, href }`, their headings one level deeper) and `links`, " +
          'with the projected content as media or body. `orientation="horizontal"` puts the copy beside the ' +
          "media once the block is wide enough; `reverse` swaps the sides.\n\n**Reference**\n" +
          "- Nuxt UI — [PageSection](https://ui.nuxt.com/docs/components/page-section), " +
          "[PageFeature](https://ui.nuxt.com/docs/components/page-feature)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Features: Story = {
  render: () => ({
    props: { features: FEATURES, links: LINKS },
    template: `<sone-page-section headline="Features" title="Everything a meeting needs" description="From the first word to the last follow-up." [features]="features" [links]="links" />`,
  }),
};

export const Horizontal: Story = {
  render: () => ({
    props: { features: FEATURES },
    template: `
      <sone-page-section icon="sparkles" title="Notes that write themselves" orientation="horizontal" [features]="features">
        <div style="aspect-ratio: 4 / 3; border-radius: var(--radius-xl); background: var(--surface-hover)" role="img" aria-label="Notes preview"></div>
      </sone-page-section>`,
  }),
};

export const ProjectedFeatures: Story = {
  render: () => ({
    template: `
      <sone-page-section title="Built for teams">
        <sone-page-features>
          <sone-page-feature icon="users" title="Shared spaces" description="One place per team." href="#spaces" />
          <sone-page-feature icon="bell" title="Reminders" description="Never miss a follow-up." />
        </sone-page-features>
      </sone-page-section>`,
  }),
};
