import { signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import {
  SONE_COLLAPSIBLE_SECTION_PARTS,
  SoneCollapsibleSectionComponent,
} from "./collapsible-section.component";

const meta: Meta<SoneCollapsibleSectionComponent> = {
  title: "Components/Layout/Collapsible Section",
  component: SoneCollapsibleSectionComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneButtonDirective,
        ...SONE_COLLAPSIBLE_SECTION_PARTS,
        ...SONE_ITEM_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-collapsible-section>` — a titled section that folds, built on the Collapsible: a header button " +
          "with the chevron, `title`, optional `subtitle` and a secondary-badge `count`, then the projected body. " +
          "`[(open)]` binds the state; `disabled` locks it. Controls in `[soneCollapsibleSectionActions]` sit at " +
          "the end of the header, outside the button." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/collapsible](https://spartan.ng/components/collapsible)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/collapsible](https://ui.shadcn.com/docs/components/collapsible)",
      },
    },
  },
};
export default meta;
type Story = StoryObj<SoneCollapsibleSectionComponent>;

const ROWS = ["Prefers async updates", "Owns the Q4 hiring plan"];

export const Open: Story = {
  render: () => {
    const open = signal(true);
    return {
      props: { open, rows: ROWS },
      template: `
        <sone-collapsible-section title="Memory" subtitle="From 3 meetings" [count]="rows.length"
          [(open)]="open" style="max-width: 28rem">
          <ul soneItemGroup size="sm">
            @for (r of rows; track r) {
              <li soneItem variant="muted" size="sm"><div soneItemContent><p soneItemTitle>{{ r }}</p></div></li>
            }
          </ul>
        </sone-collapsible-section>`,
    };
  },
};

export const Closed: Story = {
  render: () => ({
    template: `
      <sone-collapsible-section title="Audit trail" [count]="12" style="max-width: 28rem">
        <p style="margin: 0; color: var(--text-secondary)">Hidden until opened.</p>
      </sone-collapsible-section>`,
  }),
};

export const WithActions: Story = {
  render: () => ({
    template: `
      <sone-collapsible-section title="Briefs" subtitle="This week" open style="max-width: 28rem">
        <button soneCollapsibleSectionActions type="button" soneBtn variant="ghost" size="xs">Refresh</button>
        <p style="margin: 0; color: var(--text-secondary)">Two briefs are ready.</p>
      </sone-collapsible-section>`,
  }),
};
