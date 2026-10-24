// @vitest-environment node
import { describe, expect, it } from "vitest";

import { pageFeatureLevel } from "../src";

describe("pageFeatureLevel", () => {
  it("is one level under the section heading, between 1 and 6", () => {
    expect(pageFeatureLevel(2)).toBe(3);
    expect(pageFeatureLevel(1)).toBe(2);
    expect(pageFeatureLevel(6)).toBe(6);
    expect(pageFeatureLevel(0)).toBe(1);
  });
});
