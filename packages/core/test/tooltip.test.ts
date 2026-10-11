import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { attachSoneTooltip, resolveTooltipOptions } from "../src/tooltip";

const bubble = () => document.querySelector<HTMLElement>(".sone-tooltip");

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("resolveTooltipOptions", () => {
  it("reads a string as the text and fills the defaults", () => {
    expect(resolveTooltipOptions("Copy", "top")).toEqual({
      text: "Copy",
      side: "top",
      align: "center",
      arrow: true,
      disabled: false,
      showDelay: 350,
    });
    expect(resolveTooltipOptions({ side: "left" }, "top").side).toBe("left");
    expect(resolveTooltipOptions(null).side).toBe("bottom");
  });
});

describe("attachSoneTooltip", () => {
  it("shows an aria-hidden bubble after the delay and hides it on leave and Escape", () => {
    const button = document.body.appendChild(document.createElement("button"));
    const detach = attachSoneTooltip(button, () =>
      resolveTooltipOptions("Copy"),
    );
    button.dispatchEvent(new MouseEvent("mouseenter"));
    expect(bubble()).toBeNull();
    vi.advanceTimersByTime(350);
    expect(bubble()?.textContent).toBe("Copy");
    expect(bubble()?.getAttribute("aria-hidden")).toBe("true");
    expect(bubble()?.dataset["slot"]).toBe("tooltip-content");
    expect(bubble()?.dataset["state"]).toBe("delayed-open");
    button.dispatchEvent(new MouseEvent("mouseleave"));
    expect(bubble()).toBeNull();

    button.dispatchEvent(new FocusEvent("focusin"));
    vi.advanceTimersByTime(350);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(bubble()).toBeNull();

    detach();
    button.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(350);
    expect(bubble()).toBeNull();
  });

  it("moves the native title aside so two tooltips never show", () => {
    const button = document.body.appendChild(document.createElement("button"));
    button.title = "Native";
    attachSoneTooltip(button, () => resolveTooltipOptions({ showDelay: 0 }));
    button.dispatchEvent(new MouseEvent("mouseenter"));
    vi.advanceTimersByTime(0);
    expect(button.hasAttribute("title")).toBe(false);
    expect(button.dataset["tooltip"]).toBe("Native");
    expect(bubble()?.textContent).toBe("Native");
    expect(bubble()?.dataset["state"]).toBe("instant-open");
  });
});
