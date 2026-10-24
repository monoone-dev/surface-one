// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  pricingPlanButtonRel,
  pricingPlanButtonVariant,
  pricingPlanFeatures,
} from "../src";

describe("the pricing plans", () => {
  it("give every feature line a glyph, check by default", () => {
    expect(
      pricingPlanFeatures([
        "Search",
        { title: "Support", icon: "zap" },
        { title: "SSO" },
      ]),
    ).toEqual([
      { title: "Search", icon: "check" },
      { title: "Support", icon: "zap" },
      { title: "SSO", icon: "check" },
    ]);
    expect(pricingPlanFeatures(undefined)).toEqual([]);
  });

  it("draw the highlighted plan's button solid and guard a new tab", () => {
    const button = { label: "Buy", href: "/buy" };
    expect(pricingPlanButtonVariant(button, true)).toBe("default");
    expect(pricingPlanButtonVariant(button, false)).toBe("outline");
    expect(
      pricingPlanButtonVariant({ ...button, variant: "ghost" }, true),
    ).toBe("ghost");
    expect(pricingPlanButtonRel(button)).toBeNull();
    expect(pricingPlanButtonRel({ ...button, target: "_blank" })).toBe(
      "noopener noreferrer",
    );
  });
});
