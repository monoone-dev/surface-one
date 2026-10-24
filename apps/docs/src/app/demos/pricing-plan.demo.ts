import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  SONE_PRICING_PLAN_PARTS,
  type PricingPlanItem,
} from "@surface-one/angular/pricing-plan";

const TEMPLATE = `<sone-pricing-plans [plans]="plans" scale />`;

export const code = TEMPLATE;

@Component({
  selector: "docs-pricing-plan-demo",
  imports: [...SONE_PRICING_PLAN_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class PricingPlanDemo {
  readonly plans: PricingPlanItem[] = [
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
      features: ["Shared spaces", "Admin controls", "Single sign-on"],
      button: { label: "Contact sales", href: "#team" },
    },
  ];
}
