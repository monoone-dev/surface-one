// @vitest-environment node
import { describe, expect, it } from "vitest";

import {
  RESIZABLE_PANEL_DEFAULTS,
  createResizable,
  resizableInitialSizes,
  resizableKeyAction,
  resizableNormalize,
  resizableParse,
  resizableResize,
  resizableStorageKey,
  type ResizablePanelLimits,
} from "../src";

const panel = (
  limits: Partial<ResizablePanelLimits> = {},
): ResizablePanelLimits => ({ ...RESIZABLE_PANEL_DEFAULTS, ...limits });

describe("the resizable layout", () => {
  it("starts from the defaults, sharing what is left", () => {
    expect(resizableInitialSizes([panel(), panel()])).toEqual([50, 50]);
    expect(
      resizableInitialSizes([panel({ defaultSize: 25 }), panel(), panel()]),
    ).toEqual([25, 37.5, 37.5]);
    expect(
      resizableInitialSizes([
        panel({ defaultSize: 10, minSize: 20 }),
        panel({ defaultSize: 90 }),
      ]),
    ).toEqual([20, 80]);
    expect(resizableInitialSizes([])).toEqual([]);
  });

  it("normalizes to 100 within the limits", () => {
    expect(resizableNormalize([1, 1], [panel(), panel()])).toEqual([50, 50]);
    expect(
      resizableNormalize([90, 10], [panel({ maxSize: 70 }), panel()]),
    ).toEqual([70, 30]);
  });

  it("moves a boundary, taking from the nearest panels first down to their minimum", () => {
    const panels = [panel(), panel({ minSize: 20 }), panel({ minSize: 10 })];
    expect(resizableResize([30, 40, 30], panels, 0, 10)).toEqual([40, 30, 30]);
    // Past the middle panel's minimum: the last one gives the rest.
    expect(resizableResize([30, 40, 30], panels, 0, 30)).toEqual([60, 20, 20]);
    // Nothing more to take.
    expect(resizableResize([30, 40, 30], panels, 0, 80)).toEqual([70, 20, 10]);
    // Backwards from the second handle grows the last panel.
    expect(resizableResize([30, 40, 30], panels, 1, -10)).toEqual([30, 30, 40]);
    expect(resizableResize([30, 40, 30], panels, 5, 10)).toEqual([30, 40, 30]);
  });

  it("stops at the growing panel's maximum", () => {
    const panels = [panel({ maxSize: 60 }), panel()];
    expect(resizableResize([50, 50], panels, 0, 30)).toEqual([60, 40]);
  });

  it("collapses a collapsible panel pushed halfway past its minimum and opens it again", () => {
    const panels = [panel({ minSize: 20, collapsible: true }), panel()];
    expect(resizableResize([30, 70], panels, 0, -12)).toEqual([20, 80]);
    expect(resizableResize([30, 70], panels, 0, -20)).toEqual([0, 100]);
    // Collapsed: a small pull keeps it shut, half its minimum opens it.
    expect(resizableResize([0, 100], panels, 0, 5)).toEqual([0, 100]);
    expect(resizableResize([0, 100], panels, 0, 10)).toEqual([20, 80]);
  });

  it("reads the window-splitter keys along the direction", () => {
    const p = panel({ minSize: 10, maxSize: 80, collapsible: true });
    expect(resizableKeyAction("ArrowRight", "horizontal", 30, p)).toEqual({
      delta: 10,
    });
    expect(resizableKeyAction("ArrowUp", "vertical", 30, p)).toEqual({
      delta: -10,
    });
    expect(resizableKeyAction("ArrowUp", "horizontal", 30, p)).toBeNull();
    expect(resizableKeyAction("Home", "horizontal", 30, p)).toEqual({
      delta: -20,
    });
    expect(resizableKeyAction("End", "horizontal", 30, p)).toEqual({
      delta: 50,
    });
    expect(resizableKeyAction("Enter", "horizontal", 30, p)).toEqual({
      toggle: true,
    });
    expect(resizableKeyAction("Enter", "horizontal", 30, panel())).toBeNull();
  });

  it("parses stored sizes only when they fit", () => {
    expect(resizableParse("[30,70]", 2)).toEqual([30, 70]);
    expect(resizableParse("[30,70]", 3)).toBeNull();
    expect(resizableParse("[30,60]", 2)).toBeNull();
    expect(resizableParse("nope", 2)).toBeNull();
    expect(resizableParse(null, 2)).toBeNull();
    expect(resizableStorageKey("mail")).toBe("sone-resizable:mail");
  });
});

describe("createResizable", () => {
  function setup(panels: ResizablePanelLimits[], start: number[]) {
    let sizes = start;
    const calls: [number[], boolean][] = [];
    const r = createResizable({
      direction: () => "horizontal",
      panels: () => panels,
      sizes: () => sizes,
      setSizes: (next, done) => {
        sizes = next;
        calls.push([next, done]);
      },
      group: () => null,
    });
    const key = (index: number, k: string) => {
      const e = {
        key: k,
        defaultPrevented: false,
        preventDefault() {
          e.defaultPrevented = true;
        },
      };
      return r.keyDown(index, e);
    };
    return { r, key, calls, sizes: () => sizes };
  }

  it("steps with the keys and collapses / restores with Enter", () => {
    const { key, calls, sizes } = setup(
      [panel({ minSize: 20, collapsible: true }), panel()],
      [40, 60],
    );
    expect(key(0, "ArrowRight")).toBe(true);
    expect(sizes()).toEqual([50, 50]);
    expect(calls.at(-1)?.[1]).toBe(true);
    expect(key(0, "Home")).toBe(true);
    expect(sizes()).toEqual([20, 80]);
    key(0, "ArrowRight");
    key(0, "Enter");
    expect(sizes()).toEqual([0, 100]);
    key(0, "Enter");
    expect(sizes()).toEqual([30, 70]);
    expect(key(0, "a")).toBe(false);
    expect(key(1, "ArrowRight")).toBe(false);
  });
});
