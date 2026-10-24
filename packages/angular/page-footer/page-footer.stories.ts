import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import type { PageFooterColumn } from "./page-footer-columns";
import { SONE_PAGE_FOOTER_PARTS } from "./page-footer.component";

const COLUMNS: PageFooterColumn[] = [
  {
    label: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Changelog", href: "#changelog" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    label: "Legal",
    links: [
      { label: "Privacy", href: "#privacy" },
      { label: "Terms", href: "#terms" },
    ],
  },
];

const meta: Meta = {
  title: "Components/Layout/Page footer",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_PAGE_FOOTER_PARTS,
        SoneButtonDirective,
        SoneIconComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-page-footer>` — a site footer: `[sonePageFooterBrand]`, titled `columns` of links in a " +
          "named `nav` (`ariaLabel`, column titles are headings at `level` 3), then a bottom row with the " +
          "`copyright` line, `[sonePageFooterLeft]` and `[sonePageFooterRight]`. It renders a `<footer>`; the " +
          "columns sit beside the brand once it is wide enough.\n\n**Reference**\n" +
          "- Nuxt UI — [Footer](https://ui.nuxt.com/docs/components/footer), " +
          "[FooterColumns](https://ui.nuxt.com/docs/components/footer-columns)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: { columns: COLUMNS },
    template: `
      <sone-page-footer [columns]="columns" copyright="© 2026 MonoOne">
        <div sonePageFooterBrand>
          <strong style="color: var(--text-primary)">SurfaceOne</strong>
          <span>One design system for every framework.</span>
        </div>
        <a sonePageFooterRight soneBtn variant="ghost" size="icon" href="#github" aria-label="GitHub">
          <sone-icon icon="git-branch" />
        </a>
      </sone-page-footer>`,
  }),
};

export const BottomRowOnly: Story = {
  render: () => ({
    template: `<sone-page-footer copyright="© 2026 MonoOne" />`,
  }),
};
