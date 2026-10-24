import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_BREADCRUMB_PARTS } from "./breadcrumb.directive";

const meta: Meta = {
  title: "Components/Navigation/Breadcrumb",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_BREADCRUMB_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Breadcrumb. `nav[soneBreadcrumb]` (named “Breadcrumb”, or your `aria-label`) " +
          "holds an `ol[soneBreadcrumbList]` of `li[soneBreadcrumbItem]`s. A crumb is an " +
          "`a[soneBreadcrumbLink]` — put `routerLink` or `href` on the same anchor — or the " +
          '`span[soneBreadcrumbPage]` of the current page (`aria-current="page"`). ' +
          "`li[soneBreadcrumbSeparator]` draws a chevron (project your own glyph) and " +
          "`<sone-breadcrumb-ellipsis>` stands in for collapsed crumbs (`srOnlyText`, default “More”)." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/breadcrumb](https://spartan.ng/components/breadcrumb)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/breadcrumb](https://ui.shadcn.com/docs/components/breadcrumb)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <nav soneBreadcrumb>
        <ol soneBreadcrumbList>
          <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Home</a></li>
          <li soneBreadcrumbSeparator></li>
          <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Components</a></li>
          <li soneBreadcrumbSeparator></li>
          <li soneBreadcrumbItem><span soneBreadcrumbPage>Breadcrumb</span></li>
        </ol>
      </nav>`,
  }),
};

export const Collapsed: Story = {
  render: () => ({
    template: `
      <nav soneBreadcrumb>
        <ol soneBreadcrumbList>
          <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Home</a></li>
          <li soneBreadcrumbSeparator></li>
          <li soneBreadcrumbItem><sone-breadcrumb-ellipsis /></li>
          <li soneBreadcrumbSeparator></li>
          <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Settings</a></li>
          <li soneBreadcrumbSeparator></li>
          <li soneBreadcrumbItem><span soneBreadcrumbPage>Billing</span></li>
        </ol>
      </nav>`,
  }),
};

export const CustomSeparator: Story = {
  render: () => ({
    template: `
      <nav soneBreadcrumb aria-label="Folder path">
        <ol soneBreadcrumbList>
          <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Drive</a></li>
          <li soneBreadcrumbSeparator>/</li>
          <li soneBreadcrumbItem><a soneBreadcrumbLink href="#">Design</a></li>
          <li soneBreadcrumbSeparator>/</li>
          <li soneBreadcrumbItem><span soneBreadcrumbPage>Q4 review</span></li>
        </ol>
      </nav>`,
  }),
};
