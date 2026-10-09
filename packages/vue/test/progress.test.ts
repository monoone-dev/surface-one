import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";

import { SoneProgress } from "../src/index";

describe("SoneProgress", () => {
  it("drives the fill by a transform variable, not its width", () => {
    const w = mount(SoneProgress, { props: { value: 40, ariaLabel: "Load" } });
    const fill = w.find(".fill");
    expect(fill.attributes("style")).toContain("--_progress-pct: 40");
    expect(fill.attributes("style") ?? "").not.toContain("width");
    expect(w.attributes("aria-valuenow")).toBe("40");
    expect(w.attributes("aria-valuetext")).toBe("40%");
    expect(w.attributes("data-state")).toBe("loading");
  });

  it("clamps into 0..max and reports completion", () => {
    const w = mount(SoneProgress, { props: { value: 250, max: 200 } });
    expect(w.find(".fill").attributes("style")).toContain(
      "--_progress-pct: 100",
    );
    expect(w.attributes("data-state")).toBe("complete");
  });

  it("is indeterminate without a value and carries no aria-valuenow", () => {
    const w = mount(SoneProgress);
    expect(w.find(".fill--indeterminate").exists()).toBe(true);
    expect(w.attributes("aria-valuenow")).toBeUndefined();
    expect(w.attributes("data-state")).toBe("indeterminate");
  });
});
