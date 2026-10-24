// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  accordionOpenValues,
  isAccordionItemOpen,
  toggleAccordionValue,
} from "../src";

describe("the accordion state", () => {
  it("reads a value, a list or nothing as the open items", () => {
    expect(accordionOpenValues(null)).toEqual([]);
    expect(accordionOpenValues(undefined)).toEqual([]);
    expect(accordionOpenValues("a")).toEqual(["a"]);
    expect(accordionOpenValues(["a", "b"])).toEqual(["a", "b"]);
    expect(isAccordionItemOpen(["a", "b"], "b")).toBe(true);
    expect(isAccordionItemOpen("a", "b")).toBe(false);
  });

  it("single: opens one item and closes the open one only when collapsible", () => {
    expect(toggleAccordionValue(null, "a", "single", false)).toBe("a");
    expect(toggleAccordionValue("a", "b", "single", false)).toBe("b");
    expect(toggleAccordionValue("a", "a", "single", false)).toBe("a");
    expect(toggleAccordionValue("a", "a", "single", true)).toBeNull();
  });

  it("multiple: toggles the item in the list", () => {
    expect(toggleAccordionValue(null, "a", "multiple", false)).toEqual(["a"]);
    expect(toggleAccordionValue(["a"], "b", "multiple", false)).toEqual([
      "a",
      "b",
    ]);
    expect(toggleAccordionValue(["a", "b"], "a", "multiple", false)).toEqual([
      "b",
    ]);
  });
});
