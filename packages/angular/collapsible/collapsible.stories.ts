import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import { SONE_COLLAPSIBLE_PARTS } from "./collapsible.directive";

const CHEVRON = `
  <svg soneCollapsibleIcon viewBox="0 0 16 16" fill="none">
    <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>`;

const meta: Meta = {
  title: "Components/Layout/Collapsible",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_COLLAPSIBLE_PARTS, ...SONE_ITEM_PARTS],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Collapsible. `[soneCollapsible]` owns `[(expanded)]`; inside it " +
          "`button[soneCollapsibleTrigger]` wires `aria-expanded`/`aria-controls`/`data-state` and " +
          "`[soneCollapsibleContent]` hides via `hidden` (spartan inputs: root `expanded`/`disabled`, " +
          "trigger `type` (default `button`), content `id`). `soneCollapsibleIcon` on a right-pointing " +
          "chevron rotates on the trigger's `aria-expanded` — the convention `<sone-disclosure>` " +
          "shares. Without a root the trigger is the bare header row and the owner sets " +
          "`aria-expanded` (the Audit / Ivy-memory sections)." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/collapsible](https://spartan.ng/components/collapsible)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/collapsible](https://ui.shadcn.com/docs/components/collapsible)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const ROWS = [
  { id: "a", title: "Prefers async updates", meta: "From 3 meetings · Sep 24" },
  {
    id: "b",
    title: "Owns the Q4 hiring plan",
    meta: "From 1 meeting · Sep 19",
  },
];

export const Rooted: Story = {
  render: () => {
    const open = signal(true);
    return {
      props: { open, rows: ROWS },
      template: `
        <section soneCollapsible [(expanded)]="open" style="display: grid; gap: var(--space-2); max-width: 28rem">
          <button soneCollapsibleTrigger>${CHEVRON}<strong>Memory</strong></button>
          <ul soneItemGroup size="sm" soneCollapsibleContent id="memory-rows">
            @for (r of rows; track r.id) {
              <li soneItem variant="muted" size="sm">
                <div soneItemContent>
                  <p soneItemTitle>{{ r.title }}</p>
                  <p soneItemDescription>{{ r.meta }}</p>
                </div>
              </li>
            }
          </ul>
        </section>`,
    };
  },
};

export const Collapsed: Story = {
  render: () => ({
    template: `
      <section soneCollapsible style="max-width: 28rem">
        <button soneCollapsibleTrigger>${CHEVRON}<strong>Audit trail</strong></button>
        <p soneCollapsibleContent style="margin: 0; color: var(--text-secondary)">Hidden until opened.</p>
      </section>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <section soneCollapsible disabled style="max-width: 28rem">
        <button soneCollapsibleTrigger>${CHEVRON}<strong>Locked section</strong></button>
        <p soneCollapsibleContent>Never shown.</p>
      </section>`,
  }),
};

export const OwnerManaged: Story = {
  render: () => {
    const open = signal(false);
    return {
      props: { open },
      template: `
        <div style="display: grid; gap: var(--space-2); max-width: 28rem">
          <button soneCollapsibleTrigger type="button" [attr.aria-expanded]="open()" (click)="open.set(!open())">
            ${CHEVRON}<strong>Owner-managed</strong>
          </button>
          @if (open()) {
            <p style="margin: 0; color: var(--text-secondary)">The owner renders this block.</p>
          }
        </div>`,
    };
  },
};
