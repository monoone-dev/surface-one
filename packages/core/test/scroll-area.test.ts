import { describe, expect, it } from "vitest";

import { createScrollArea, scrollAreaOverflow } from "../src";

const M = {
  scrollTop: 0,
  scrollHeight: 100,
  clientHeight: 100,
  scrollLeft: 0,
  scrollWidth: 100,
  clientWidth: 100,
};

function metrics(el: HTMLElement, m: Partial<typeof M>): void {
  for (const [k, v] of Object.entries({ ...M, ...m }))
    Object.defineProperty(el, k, { value: v, configurable: true });
}

describe("scrollAreaOverflow", () => {
  it("reads overflow along the axes the area scrolls", () => {
    expect(scrollAreaOverflow(M, "vertical")).toEqual({
      scrollable: false,
      start: false,
      end: false,
    });
    const tall = { ...M, scrollHeight: 300 };
    expect(scrollAreaOverflow(tall, "vertical")).toEqual({
      scrollable: true,
      start: false,
      end: true,
    });
    expect(scrollAreaOverflow({ ...tall, scrollTop: 100 }, "vertical")).toEqual(
      { scrollable: true, start: true, end: true },
    );
    expect(scrollAreaOverflow({ ...tall, scrollTop: 200 }, "vertical")).toEqual(
      { scrollable: true, start: true, end: false },
    );
    // Too tall, but it only scrolls sideways.
    expect(scrollAreaOverflow(tall, "horizontal").scrollable).toBe(false);
    expect(scrollAreaOverflow(tall, "both").scrollable).toBe(true);
  });

  it("measures the horizontal offset as a distance (right to left too)", () => {
    const wide = { ...M, scrollWidth: 300 };
    expect(
      scrollAreaOverflow({ ...wide, scrollLeft: -100 }, "horizontal"),
    ).toEqual({ scrollable: true, start: true, end: true });
    expect(
      scrollAreaOverflow({ ...wide, scrollLeft: 200 }, "horizontal"),
    ).toEqual({ scrollable: true, start: true, end: false });
  });

  it("ignores sub-pixel overflow", () => {
    expect(
      scrollAreaOverflow({ ...M, scrollHeight: 100.5 }, "vertical").scrollable,
    ).toBe(false);
  });
});

describe("createScrollArea", () => {
  it("makes an overflowing area a keyboard stop and marks the hidden edges", () => {
    const el = document.createElement("div");
    el.setAttribute("aria-label", "Tags");
    document.body.appendChild(el);
    metrics(el, {});
    const area = createScrollArea(el, () => "vertical");
    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.getAttribute("role")).toBe("region");
    metrics(el, { scrollHeight: 300, scrollTop: 50 });
    area.update();
    expect(el.getAttribute("tabindex")).toBe("0");
    expect(el.hasAttribute("data-scrollable")).toBe(true);
    expect(el.hasAttribute("data-overflow-start")).toBe(true);
    expect(el.hasAttribute("data-overflow-end")).toBe(true);
    area.disconnect();
    expect(el.hasAttribute("tabindex")).toBe(false);
    expect(el.hasAttribute("role")).toBe(false);
    expect(el.hasAttribute("data-scrollable")).toBe(false);
    el.remove();
  });

  it("leaves a tabindex and a role the owner set", () => {
    const el = document.createElement("div");
    el.setAttribute("tabindex", "-1");
    el.setAttribute("role", "log");
    el.setAttribute("aria-label", "Log");
    metrics(el, { scrollHeight: 300 });
    const area = createScrollArea(el, () => "vertical");
    expect(el.getAttribute("tabindex")).toBe("-1");
    expect(el.getAttribute("role")).toBe("log");
    area.disconnect();
    expect(el.getAttribute("tabindex")).toBe("-1");
    expect(el.getAttribute("role")).toBe("log");
  });
});
