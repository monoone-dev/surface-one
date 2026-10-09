import { describe, expect, it } from "vitest";

import * as pkg from "../src/index";

describe("exports", () => {
  it("lists every exported component in SONE_COMPONENT_NAMES (the Nuxt module registers that list)", () => {
    const exported = Object.keys(pkg)
      .filter((name) => /^Sone[A-Z]/.test(name))
      .filter((name) => {
        const value = (pkg as Record<string, unknown>)[name];
        return typeof value === "object" && value !== null && "setup" in value;
      })
      .sort();
    expect([...pkg.SONE_COMPONENT_NAMES].sort()).toEqual(exported);
  });
});
