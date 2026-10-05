import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import { SoneSourceListItemDirective } from "./source-list-item.directive";
import { SoneSourceListComponent } from "./source-list.component";

interface DemoSource {
  id: string;
  title: string;
  detail: string;
}

const SOURCES: DemoSource[] = [
  { id: "s1", title: "Harbour Lane kickoff", detail: "Mar 3" },
  { id: "s2", title: "Glasshouse pricing review", detail: "Mar 5" },
  { id: "s3", title: "Orchard team retro", detail: "Mar 9" },
  { id: "s4", title: "Lantern onboarding notes", detail: "Mar 12" },
  { id: "s5", title: "Pinecrest vendor call", detail: "Mar 14" },
  { id: "s6", title: "Q2 atlas planning", detail: "Mar 18" },
];

const byId = (s: DemoSource): string => s.id;

const meta: Meta<SoneSourceListComponent<DemoSource>> = {
  title: "Components/Data display/Source list",
  component: SoneSourceListComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneSourceListItemDirective, ...SONE_ITEM_PARTS],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-source-list>` — a titled list of sources with an optional `limit` and a " +
          'show-more toggle. `variant` chip (inline, wrapping, "+N more") | row (stacked ' +
          'Items, "Show all (N)" disclosure). Items are projected with ' +
          "`<ng-template soneSourceListItem let-item>`; the caller maps its own data.",
      },
    },
  },
};
export default meta;
type Story = StoryObj<SoneSourceListComponent<DemoSource>>;

export const Chips: Story = {
  render: () => ({
    props: { sources: SOURCES, byId },
    template: `
      <div style="max-width: 36rem">
        <sone-source-list variant="chip" label="Sources" [items]="sources" [trackBy]="byId" [limit]="3">
          <ng-template soneSourceListItem [soneSourceListItemOf]="sources" let-s>
            <span soneItem variant="outline" size="xs">{{ s.title }} · {{ s.detail }}</span>
          </ng-template>
        </sone-source-list>
      </div>`,
  }),
};

export const Rows: Story = {
  render: () => ({
    props: { sources: SOURCES, byId },
    template: `
      <div style="max-width: 28rem">
        <sone-source-list variant="row" size="sm" label="Sources" showCount [items]="sources" [trackBy]="byId" [limit]="4">
          <span soneSourceListIcon aria-hidden="true">🔗</span>
          <ng-template soneSourceListItem [soneSourceListItemOf]="sources" let-s>
            <div soneItem variant="muted" size="xs">
              <div soneItemContent>
                <span soneItemTitle>{{ s.title }}</span>
                <span soneItemDescription>{{ s.detail }}</span>
              </div>
            </div>
          </ng-template>
        </sone-source-list>
      </div>`,
  }),
};

export const TwoColumns: Story = {
  render: () => ({
    props: { sources: SOURCES, byId },
    template: `
      <sone-source-list [items]="sources" [trackBy]="byId" [columns]="2">
        <ng-template soneSourceListItem [soneSourceListItemOf]="sources" let-s>
          <button soneItem variant="outline" type="button">
            <span soneItemContent>
              <span soneItemTitle>{{ s.title }}</span>
              <span soneItemDescription>{{ s.detail }}</span>
            </span>
          </button>
        </ng-template>
      </sone-source-list>`,
  }),
};
