// @vitest-environment node
import { describe, expect, it } from "vitest";

import { avatarGroupSplit, soneInitials } from "../src";

describe("soneInitials", () => {
  it("takes the first and last word's first letter", () => {
    expect(soneInitials("Ada Lovelace")).toBe("AL");
    expect(soneInitials("Ada King Lovelace")).toBe("AL");
    expect(soneInitials("ada@example.com")).toBe("A");
    expect(soneInitials("  @łukasz  świerk ")).toBe("ŁŚ");
    expect(soneInitials("Ada Lovelace", 1)).toBe("A");
  });

  it("is a question mark when there is no name", () => {
    expect(soneInitials("")).toBe("?");
    expect(soneInitials(undefined)).toBe("?");
    expect(soneInitials(null)).toBe("?");
  });
});

describe("avatarGroupSplit", () => {
  it("shows up to max and counts the rest", () => {
    expect(avatarGroupSplit(6, 4)).toEqual({ shown: 4, hidden: 2 });
    expect(avatarGroupSplit(3, 4)).toEqual({ shown: 3, hidden: 0 });
    expect(avatarGroupSplit(3, 0)).toEqual({ shown: 0, hidden: 3 });
  });

  it("reads a negative or fractional max as its whole part, and no max as all", () => {
    expect(avatarGroupSplit(5, -1)).toEqual({ shown: 0, hidden: 5 });
    expect(avatarGroupSplit(5, 2.7)).toEqual({ shown: 2, hidden: 3 });
    expect(avatarGroupSplit(5, Number.NaN)).toEqual({ shown: 5, hidden: 0 });
  });
});
