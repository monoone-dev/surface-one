import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  SonePricingPlan,
  SonePricingPlans,
} from "../src/components/pricing-plan";

describe("SonePricingPlan", () => {
  it("renders the same plan as Angular", () => {
    const out = renderToString(
      <SonePricingPlan
        title="Pro"
        badge="Most popular"
        price="$24"
        discount="$19"
        billingCycle="/month"
        features={["Search", { title: "Support", icon: "zap" }]}
        button={{ label: "Get Pro", href: "/pro" }}
        terms="Cancel any time."
        highlight
        footer={<button>Compare</button>}
      />,
    );
    expect(out).toContain(
      '<sone-pricing-plan data-slot="pricing-plan" data-highlight=""><div class="pricing-plan-header" data-slot="pricing-plan-header"><div class="pricing-plan-title-row"><h3 class="pricing-plan-title" data-slot="pricing-plan-title">Pro</h3>',
    );
    expect(out).toContain(
      '<p class="pricing-plan-pricing" data-slot="pricing-plan-pricing"><span class="pricing-plan-price-original"><span class="sr-only">Regular price </span><s>$24</s></span><span class="pricing-plan-price"><span class="sr-only">Discounted price </span>$19</span><span class="pricing-plan-billing"><span class="pricing-plan-cycle">/month</span></span></p>',
    );
    expect(out).toContain('data-icon="zap"');
    expect(out).toMatch(
      /data-slot="pricing-plan-button" data-variant="default" data-size="lg" href="\/pro" class="btn pricing-plan-button">Get Pro<\/a><button>Compare<\/button><p class="pricing-plan-terms"/,
    );
  });

  it("lays out plans from data with a shared level and scale", () => {
    const out = renderToString(
      <SonePricingPlans
        scale
        level={2}
        plans={[
          { title: "Free", price: "$0" },
          { title: "Pro", price: "$19", highlight: true },
        ]}
      />,
    );
    expect(out).toContain('<sone-pricing-plans data-slot="pricing-plans">');
    expect(out.match(/<h2 class="pricing-plan-title"/g)).toHaveLength(2);
    expect(out).toContain(
      '<sone-pricing-plan data-slot="pricing-plan" data-highlight="" data-scale="">',
    );
  });
});
