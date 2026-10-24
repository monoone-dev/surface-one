import { ChangeDetectionStrategy, Component } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import {
  SONE_PRICING_PLAN_PARTS,
  type PricingPlanItem,
} from "@surface-one/angular/pricing-plan";

import { $, $$, render } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

@Component({
  imports: [...SONE_PRICING_PLAN_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sone-pricing-plans [plans]="plans" scale [level]="2">
      <sone-pricing-plan
        title="Team"
        price="Custom"
        tagline="Everything, plus:"
      >
        <button sonePricingPlanFooter type="button">Talk to us</button>
      </sone-pricing-plan>
    </sone-pricing-plans>
  `,
})
class PlansHost {
  readonly plans: PricingPlanItem[] = [
    {
      title: "Free",
      price: "$0",
      billingCycle: "/month",
      features: ["Summaries"],
      button: { label: "Start", href: "/free" },
    },
    {
      title: "Pro",
      description: "For people who meet a lot.",
      badge: "Most popular",
      price: "$24",
      discount: "$19",
      billingCycle: "/month",
      billingPeriod: "billed annually",
      features: ["Search", { title: "Support", icon: "zap" }],
      button: { label: "Get Pro", href: "/pro" },
      terms: "Cancel any time.",
      highlight: true,
    },
  ];
}

describe("sone-pricing-plan(s)", () => {
  it("draws each plan with its heading, price, billing, features and button", async () => {
    await render(PlansHost);
    const plans = $$("sone-pricing-plan");
    expect(plans).toHaveLength(3);
    const [free, pro, team] = plans as [HTMLElement, HTMLElement, HTMLElement];
    expect($("h2.pricing-plan-title", free).textContent!.trim()).toBe("Free");
    expect(free.hasAttribute("data-scale")).toBe(true);
    expect(free.hasAttribute("data-highlight")).toBe(false);
    expect($(".pricing-plan-price", free).textContent!.trim()).toBe("$0");
    expect($(".pricing-plan-cycle", free).textContent).toBe("/month");
    expect(
      $<HTMLAnchorElement>(".pricing-plan-button", free).getAttribute(
        "data-variant",
      ),
    ).toBe("outline");

    expect(pro.hasAttribute("data-highlight")).toBe(true);
    expect($(".pricing-plan-badge", pro).textContent!.trim()).toBe(
      "Most popular",
    );
    expect($(".pricing-plan-price-original", pro).textContent!.trim()).toBe(
      "Regular price $24",
    );
    expect($(".pricing-plan-price-original s", pro).textContent).toBe("$24");
    expect($(".pricing-plan-price", pro).textContent!.trim()).toBe(
      "Discounted price $19",
    );
    expect($(".pricing-plan-period", pro).textContent).toBe("billed annually");
    const icons = $$(".pricing-plan-feature sone-icon", pro);
    expect(icons.map((i) => i.getAttribute("data-icon"))).toEqual([
      "check",
      "zap",
    ]);
    const button = $<HTMLAnchorElement>(".pricing-plan-button", pro);
    expect(button.getAttribute("href")).toBe("/pro");
    expect(button.getAttribute("data-variant")).toBe("default");
    expect($(".pricing-plan-terms", pro).textContent).toBe("Cancel any time.");

    expect($("h3.pricing-plan-title", team).textContent!.trim()).toBe("Team");
    expect($(".pricing-plan-tagline", team).textContent!.trim()).toBe(
      "Everything, plus:",
    );
    expect($(".pricing-plan-footer button", team).textContent).toBe(
      "Talk to us",
    );
    expect($(".pricing-plan-features", team)).toBeNull();
  });
});
