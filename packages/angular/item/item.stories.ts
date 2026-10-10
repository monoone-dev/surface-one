import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_ITEM_PARTS } from "./item.directive";

const meta: Meta = {
  title: "Components/Data display/Item",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_ITEM_PARTS, SoneButtonDirective, SoneBadgeDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneItem]` — spartan/ui Item: media / content (title + description) / actions in a " +
          "row. `variant` default | outline | muted, `size` default | sm | xs." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/item](https://spartan.ng/components/item)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/item](https://ui.shadcn.com/docs/components/item)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Variants: Story = {
  render: () => ({
    props: {
      variants: ["default", "outline", "muted"],
      sizes: ["default", "sm", "xs"],
    },
    template: `
      <div style="display: grid; gap: var(--space-2); max-width: 30rem">
        @for (v of variants; track v) {
          @for (s of sizes; track s) {
            <div soneItem [variant]="$any(v)" [size]="$any(s)">
              <div soneItemContent>
                <p soneItemTitle>Weekly sync · {{ v }} / {{ s }}</p>
                <p soneItemDescription>Sep 24 · 42 min · 3 action items</p>
              </div>
              <div soneItemActions><button soneBtn variant="outline" size="sm" type="button">Open</button></div>
            </div>
          }
        }
      </div>`,
  }),
};

const DOC_ICON = `
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 2h5l3 3v9H4z M9 2v3h3" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
  </svg>`;

export const Media: Story = {
  render: () => ({
    props: { sizes: ["default", "sm", "xs"] },
    template: `
      <div style="display: grid; gap: var(--space-2); max-width: 30rem">
        @for (s of sizes; track s) {
          <div soneItem variant="outline" [size]="$any(s)">
            <span soneItemMedia variant="icon">${DOC_ICON}</span>
            <div soneItemContent>
              <p soneItemTitle>Icon media · {{ s }}</p>
              <p soneItemDescription>Tops-align with the title when there is a description.</p>
            </div>
          </div>
          <div soneItem variant="outline" [size]="$any(s)">
            <span soneItemMedia variant="image">
              <img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Crect width='4' height='4' fill='%236e76ff'/%3E%3Crect width='2' height='2' fill='%23a6a6b6'/%3E%3C/svg%3E" />
            </span>
            <div soneItemContent>
              <p soneItemTitle>Image media · {{ s }}</p>
              <p soneItemDescription>Sep 24 · 42 min</p>
            </div>
          </div>
        }
      </div>`,
  }),
};

export const Interactive: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-2); max-width: 30rem">
        <button soneItem variant="muted" size="sm" type="button">
          <span soneItemMedia variant="icon">${DOC_ICON}</span>
          <div soneItemContent>
            <p soneItemTitle>Weekly sync (button)</p>
            <p soneItemDescription>Sep 24 · 42 min</p>
          </div>
        </button>
        <a soneItem variant="outline" size="sm" href="#">
          <div soneItemContent>
            <p soneItemTitle>Design review (link)</p>
            <p soneItemDescription>Sep 22 · 30 min</p>
          </div>
        </a>
        <button soneItem variant="muted" size="sm" type="button" disabled>
          <div soneItemContent>
            <p soneItemTitle>Locked meeting (disabled)</p>
            <p soneItemDescription>Unlock the folder to open it.</p>
          </div>
        </button>
      </div>`,
  }),
};

export const GroupAndSeparator: Story = {
  render: () => ({
    props: {
      rows: [
        { id: "a", title: "Hiring debrief", meta: "Sep 24 · 3 action items" },
        { id: "b", title: "Weekly sync", meta: "Sep 23 · 1 action item" },
        { id: "c", title: "Board prep", meta: "Sep 20 · no action items" },
      ],
    },
    template: `
      <div style="display: grid; gap: var(--space-6); max-width: 30rem">
        <ul soneItemGroup>
          @for (r of rows; track r.id; let last = $last) {
            <li soneItem>
              <div soneItemContent>
                <p soneItemTitle>{{ r.title }}</p>
                <p soneItemDescription>{{ r.meta }}</p>
              </div>
              <div soneItemActions><button soneBtn variant="ghost" size="sm" type="button">Open</button></div>
            </li>
            @if (!last) { <li soneItemSeparator></li> }
          }
        </ul>
        <ul soneItemGroup size="sm">
          <li soneItem variant="outline" size="sm">
            <div soneItemHeader>
              <span soneItemDescription>Header row</span>
              <span soneItemDescription>Sep 24</span>
            </div>
            <div soneItemContent>
              <p soneItemTitle>Item with header and footer</p>
            </div>
            <div soneItemActions><button soneBtn variant="outline" size="sm" type="button">Share</button></div>
            <div soneItemFooter>
              <span soneItemDescription>Footer row</span>
            </div>
          </li>
        </ul>
      </div>`,
  }),
};

export const Anatomy: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-2); max-width: 30rem">
        <div soneItem variant="outline">
          <span soneItemMedia>${DOC_ICON}</span>
          <div soneItemContent>
            <p soneItemTitle>Hiring debrief <span soneBadge variant="secondary">New</span></p>
            <p soneItemDescription>Recorded Sep 24 — <a href="#">open the transcript</a> to review the three action items.</p>
          </div>
          <div soneItemContent>
            <p soneItemDescription>42 min</p>
          </div>
        </div>
        <div soneItem variant="muted" size="xs">
          <div soneItemContent>
            <p soneItemTitle>A very long title that is clamped to a single line so the row keeps its height</p>
            <p soneItemDescription>A long description wraps to two lines and is then clamped, so an item never grows past its rhythm however much text it is handed by the caller.</p>
          </div>
        </div>
      </div>`,
  }),
};

export const GroupSizes: Story = {
  render: () => ({
    props: { sizes: ["default", "sm", "xs"], rows: ["a", "b", "c"] },
    template: `
      <div style="display: grid; gap: var(--space-6); max-width: 30rem">
        @for (s of sizes; track s) {
          <ul soneItemGroup>
            @for (r of rows; track r) {
              <li soneItem variant="outline" [size]="$any(s)">
                <div soneItemContent><p soneItemTitle>Row {{ r }} · {{ s }}</p></div>
              </li>
            }
          </ul>
        }
      </div>`,
  }),
};

export const ActionsAtTheEnd: Story = {
  render: () => ({
    template: `
      <ul soneItemGroup style="max-width: 30rem">
        <li soneItem variant="outline">
          <div soneItemContent>
            <p soneItemTitle>Content takes the free space</p>
            <p soneItemDescription>The actions sit at the end of the row.</p>
          </div>
          <div soneItemActions><button soneBtn variant="outline" size="sm" type="button">Open</button></div>
        </li>
        <li soneItem variant="outline">
          <span soneBadge variant="secondary">No content part</span>
          <div soneItemActions><button soneBtn variant="outline" size="sm" type="button">Open</button></div>
        </li>
      </ul>`,
  }),
};
