// @vitest-environment node
import { describe, expect, it } from "vitest";

import { pageFooterLinkRel } from "../src";

describe("pageFooterLinkRel", () => {
  it("guards a new tab and keeps a link's own rel", () => {
    expect(pageFooterLinkRel({ label: "A", href: "/a" })).toBeNull();
    expect(
      pageFooterLinkRel({ label: "A", href: "/a", target: "_blank" }),
    ).toBe("noopener noreferrer");
    expect(pageFooterLinkRel({ label: "A", href: "/a", rel: "me" })).toBe("me");
  });
});
