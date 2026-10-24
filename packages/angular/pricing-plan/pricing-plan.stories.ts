import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import type { PricingPlanItem } from "./pricing-plan-item";
import { SONE_PRICING_PLAN_PARTS } from "./pricing-plan.component";

const PLANS: PricingPlanItem[] = [
  {
    title: "Free",
    description: "For trying it out.",
    price: "$0",
    billingCycle: "/month",
    features: ["3 meetings a month", "Summaries", "7-day history"],
    button: { label: "Start for free", href: "#free" },
  },
  {
    title: "Pro",
    description: "For people who meet a lot.",
    badge: "Most popular",
    price: "$24",
    discount: "$19",
    billingCycle: "/month",
    billingPeriod: "billed annually",
    features: [
      "Unlimited meetings",
      "Search across everything",
      { title: "Priority support", icon: "zap" },
    ],
    button: { label: "Get Pro", href: "#pro" },
    terms: "Cancel any time.",
    highlight: true,
  },
  {
    title: "Team",
    description: "For the whole company.",
    price: "Custom",
    tagline: "Everything in Pro, plus:",
    features: ["Shared spaces", "Admin controls", "SSO"],
    button: { label: "Contact sales", href: "#team" },
  },
];

const meta: Meta = {
  title: "Components/Data display/Pricing plan",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_PRICING_PLAN_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-pricing-plan>` + `sone-pricing-plans` — the plans of a pricing page: `title` (a heading, " +
          "`level` 3 by default), `badge`, `description`, `price` (struck through when a `discount` replaces " +
          "it, both read with their meaning), `billingCycle` / `billingPeriod`, `tagline`, `features` (a list " +
          "with check marks, or your own glyph), a call-to-action `button` link and `terms`. `highlight` draws " +
          "the plan to pick with the accent; `scale` lets it stand taller once the row is wide.\n\n**Reference**\n" +
          "- Nuxt UI — [PricingPlan](https://ui.nuxt.com/docs/components/pricing-plan), " +
          "[PricingPlans](https://ui.nuxt.com/docs/components/pricing-plans)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Plans: Story = {
  render: () => ({
    props: { plans: PLANS },
    template: `<sone-pricing-plans [plans]="plans" scale />`,
  }),
};

export const Single: Story = {
  render: () => ({
    props: { plan: PLANS[1] },
    template: `
      <div style="max-width: 22rem">
        <sone-pricing-plan title="Pro" price="$19" billingCycle="/month" badge="New" [features]="plan.features" highlight>
          <button sonePricingPlanFooter type="button">Compare plans</button>
        </sone-pricing-plan>
      </div>`,
  }),
};
