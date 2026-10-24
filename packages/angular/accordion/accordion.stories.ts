import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_ACCORDION_PARTS } from "./accordion.directive";

const ITEMS = `
  <sone-accordion-item value="shipping">
    <sone-accordion-trigger>What are your shipping options?</sone-accordion-trigger>
    <sone-accordion-content>
      Standard delivery takes 3–5 working days; express arrives the next day.
    </sone-accordion-content>
  </sone-accordion-item>
  <sone-accordion-item value="returns">
    <sone-accordion-trigger>What is your return policy?</sone-accordion-trigger>
    <sone-accordion-content>
      Return any unused item within 30 days for a full refund.
    </sone-accordion-content>
  </sone-accordion-item>
  <sone-accordion-item value="support">
    <sone-accordion-trigger>How do I reach support?</sone-accordion-trigger>
    <sone-accordion-content>
      Write to us from the Help page; we answer within one working day.
    </sone-accordion-content>
  </sone-accordion-item>`;

const meta: Meta = {
  title: "Components/Layout/Accordion",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_ACCORDION_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Accordion (WAI-ARIA Accordion). `[soneAccordion]` / `<sone-accordion>` owns " +
          "`type` (`single` | `multiple`), `collapsible` (single), `disabled` and the two-way " +
          "`[(value)]` — the open item values. Each `<sone-accordion-item>` (`value`, `disabled`) " +
          'holds a `<sone-accordion-trigger>` — a `role="heading"` (`level`, default 3) around the ' +
          "button with `aria-expanded` / `aria-controls` — and a `<sone-accordion-content>` " +
          '`role="region"` named by its trigger, hidden while closed. Up / Down, Home and End move ' +
          "between the triggers. Project an `[soneAccordionIcon]` to replace the chevron; motion " +
          "stops under `prefers-reduced-motion`.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/accordion](https://spartan.ng/components/accordion)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/accordion](https://ui.shadcn.com/docs/components/accordion)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Single: Story = {
  render: () => ({
    template: `<sone-accordion collapsible value="shipping" style="max-width: 32rem">${ITEMS}</sone-accordion>`,
  }),
};

export const Multiple: Story = {
  render: () => ({
    props: { value: ["shipping", "support"] },
    template: `<sone-accordion type="multiple" [(value)]="value" style="max-width: 32rem">${ITEMS}</sone-accordion>`,
  }),
};

export const DisabledItem: Story = {
  render: () => ({
    template: `
      <sone-accordion collapsible style="max-width: 32rem">
        <sone-accordion-item>
          <sone-accordion-trigger>Account</sone-accordion-trigger>
          <sone-accordion-content>Name, e-mail and password.</sone-accordion-content>
        </sone-accordion-item>
        <sone-accordion-item disabled>
          <sone-accordion-trigger>Billing (owners only)</sone-accordion-trigger>
          <sone-accordion-content>Never shown while disabled.</sone-accordion-content>
        </sone-accordion-item>
      </sone-accordion>`,
  }),
};

export const CustomIcon: Story = {
  render: () => ({
    template: `
      <sone-accordion collapsible style="max-width: 32rem">
        <sone-accordion-item>
          <sone-accordion-trigger>
            Release notes
            <svg soneAccordionIcon viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </sone-accordion-trigger>
          <sone-accordion-content>Version 0.25 adds the accordion.</sone-accordion-content>
        </sone-accordion-item>
      </sone-accordion>`,
  }),
};
