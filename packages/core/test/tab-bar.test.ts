// @vitest-environment node
import { describe, expect, it } from "vitest";

import { tabBarCurrent, tabBarItemKind, tabBarShowsLabel } from "../src";

describe("the tab bar items", () => {
  it("show the active label, or every label", () => {
    expect(tabBarShowsLabel("active", true)).toBe(true);
    expect(tabBarShowsLabel("active", false)).toBe(false);
    expect(tabBarShowsLabel("always", false)).toBe(true);
  });

  it("are links when enabled with an href, else buttons", () => {
    expect(tabBarItemKind({ value: "a", label: "A", href: "/a" })).toBe("link");
    expect(
      tabBarItemKind({ value: "a", label: "A", href: "/a", disabled: true }),
    ).toBe("button");
    expect(tabBarItemKind({ value: "a", label: "A" })).toBe("button");
  });

  it("mark the active link as the page and the active button as current", () => {
    const link = { value: "a", label: "A", href: "/a" };
    expect(tabBarCurrent(link, true)).toBe("page");
    expect(tabBarCurrent({ value: "b", label: "B" }, true)).toBe("true");
    expect(tabBarCurrent(link, false)).toBeNull();
  });
});
