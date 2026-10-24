// @vitest-environment node
import { describe, expect, it } from "vitest";

import { pageLinkRel, pageLinkVariant } from "../src";

describe("the page links", () => {
  it("are default first and outline after, unless they say", () => {
    const link = { label: "A", href: "/a" };
    expect(pageLinkVariant(link, 0)).toBe("default");
    expect(pageLinkVariant(link, 1)).toBe("outline");
    expect(pageLinkVariant({ ...link, variant: "ghost" }, 0)).toBe("ghost");
  });

  it("guard a new tab with noopener", () => {
    expect(pageLinkRel({ label: "A", href: "/a" })).toBeNull();
    expect(pageLinkRel({ label: "A", href: "/a", target: "_blank" })).toBe(
      "noopener noreferrer",
    );
    expect(
      pageLinkRel({ label: "A", href: "/a", target: "_blank", rel: "me" }),
    ).toBe("me");
  });
});
