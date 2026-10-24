import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SonePaginationComponent } from "./pagination.component";
import { SONE_PAGINATION_PARTS } from "./pagination.directive";

const meta: Meta<SonePaginationComponent> = {
  title: "Components/Navigation/Pagination",
  component: SonePaginationComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_PAGINATION_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-pagination>` draws the page buttons from a count: two-way `[(page)]` (1-based), " +
          "`pageCount` — or `total` items at `pageSize` a page — `siblings` around the current page " +
          "and `boundaries` at each end, with ellipses for the gaps (the pure `paginationRange` " +
          'helper). The current page is outlined with `aria-current="page"`; Previous and Next ' +
          "disable at the ends.\n\n" +
          "For links you lay out yourself, the shadcn/ui anatomy: `nav[sonePaginationNav]` " +
          "(named “Pagination”), `ul[sonePaginationContent]`, `li[sonePaginationItem]`, " +
          "`a[sonePaginationLink]` (`isActive`, `size`; add `routerLink` or `href`), " +
          "`a[sonePaginationPrevious]`, `a[sonePaginationNext]` and `<sone-pagination-ellipsis>`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/pagination](https://spartan.ng/components/pagination)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/pagination](https://ui.shadcn.com/docs/components/pagination)",
      },
    },
  },
  argTypes: {
    page: { control: { type: "number", min: 1 } },
    total: { control: { type: "number", min: 0 } },
    pageSize: { control: { type: "number", min: 1 } },
    siblings: { control: { type: "number", min: 0 } },
    boundaries: { control: { type: "number", min: 0 } },
    disabled: { control: "boolean" },
    pageChange: { action: "pageChange" },
  },
  args: {
    page: 5,
    total: 200,
    pageSize: 10,
    siblings: 1,
    boundaries: 1,
    disabled: false,
  },
  render: (args) => ({
    props: args,
    template: `<sone-pagination [(page)]="page" [total]="total" [pageSize]="pageSize" [siblings]="siblings"
      [boundaries]="boundaries" [disabled]="disabled" (pageChange)="pageChange($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<SonePaginationComponent>;

export const Default: Story = {};
export const FirstPage: Story = { args: { page: 1 } };
export const FewPages: Story = { args: { page: 2, total: 40 } };
export const WideSiblings: Story = { args: { page: 10, siblings: 2 } };
export const Disabled: Story = { args: { disabled: true } };

export const Links: Story = {
  render: () => ({
    template: `
      <nav sonePaginationNav>
        <ul sonePaginationContent>
          <li sonePaginationItem><a sonePaginationPrevious href="#"></a></li>
          <li sonePaginationItem><a sonePaginationLink href="#">1</a></li>
          <li sonePaginationItem><a sonePaginationLink href="#" isActive>2</a></li>
          <li sonePaginationItem><a sonePaginationLink href="#">3</a></li>
          <li sonePaginationItem><sone-pagination-ellipsis /></li>
          <li sonePaginationItem><a sonePaginationNext href="#"></a></li>
        </ul>
      </nav>`,
  }),
};
