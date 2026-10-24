import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import type { PageLink } from "@surface-one/angular/core";
import { SONE_PAGE_HERO_PARTS } from "./page-hero.component";

const LINKS: PageLink[] = [
  { label: "Get started", href: "#start", trailingIcon: "arrow-right" },
  { label: "Read the docs", href: "#docs" },
];

const MEDIA =
  "aspect-ratio: 4 / 3; border-radius: var(--radius-xl); background: var(--surface-hover); border: var(--border-width-thin) solid var(--border)";

const meta: Meta = {
  title: "Components/Layout/Page hero",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [...SONE_PAGE_HERO_PARTS, SoneButtonDirective] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-page-hero>` — the opening block of a landing page: `headline`, `title` (a real heading, " +
          "`level` 1 by default), `description` and call-to-action `links` (`{ label, href, variant, icon, " +
          "trailingIcon }`, the first one `default`, the rest `outline`), with the projected content as media. " +
          '`orientation="horizontal"` puts the copy beside the media once the block is wide enough ' +
          "(a container query); `reverse` swaps the sides. `[sonePageHeroLinks]` adds your own actions." +
          "\n\n**Reference**\n" +
          "- Nuxt UI — [PageHero](https://ui.nuxt.com/docs/components/page-hero)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Vertical: Story = {
  render: () => ({
    props: { links: LINKS },
    template: `<sone-page-hero headline="New: SurfaceOne 1.0" title="Ship accessible interfaces faster" description="One design system for Angular, Vue, React and React Native, with tokens, skins and docs in nine languages." [links]="links" />`,
  }),
};

export const Horizontal: Story = {
  render: () => ({
    props: { links: LINKS },
    template: `
      <sone-page-hero orientation="horizontal" title="Your workspace, organised" description="Notes, meetings and follow-ups in one place." [links]="links">
        <div style="${MEDIA}" role="img" aria-label="A preview of the workspace"></div>
      </sone-page-hero>`,
  }),
};

export const Reverse: Story = {
  render: () => ({
    template: `
      <sone-page-hero orientation="horizontal" reverse title="Built for teams" [level]="2">
        <div style="${MEDIA}" role="img" aria-label="Team photo"></div>
        <button sonePageHeroLinks soneBtn type="button" size="lg">Start a trial</button>
      </sone-page-hero>`,
  }),
};
