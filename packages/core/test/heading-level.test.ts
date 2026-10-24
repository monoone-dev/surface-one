// @vitest-environment node
import { describe, expect, it } from "vitest";

import { toHeadingLevel } from "../src";

describe("toHeadingLevel", () => {
  it("reads 1–6 from numbers and numeric strings", () => {
    expect(toHeadingLevel(1)).toBe(1);
    expect(toHeadingLevel("3")).toBe(3);
    expect(toHeadingLevel(6, 1)).toBe(6);
  });

  it("falls back on anything else", () => {
    expect(toHeadingLevel(undefined)).toBe(2);
    expect(toHeadingLevel(null, 1)).toBe(1);
    expect(toHeadingLevel("", 3)).toBe(3);
    expect(toHeadingLevel(7, 1)).toBe(1);
    expect(toHeadingLevel(0)).toBe(2);
    expect(toHeadingLevel(2.5, 4)).toBe(4);
    expect(toHeadingLevel("h2", 1)).toBe(1);
  });
});
