import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SoneTooltip, useSoneTooltip } from "../src/index";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

function Hooked() {
  const ref = useSoneTooltip<HTMLButtonElement>("Copy", "top");
  return (
    <button ref={ref} type="button" aria-label="Copy">
      c
    </button>
  );
}

describe("tooltip", () => {
  it("shows an aria-hidden bubble after the delay and hides it on leave", () => {
    render(<Hooked />);
    const button = screen.getByRole("button");
    fireEvent.mouseEnter(button);
    expect(document.querySelector(".sone-tooltip")).toBeNull();
    act(() => vi.advanceTimersByTime(400));
    const bubble = document.querySelector<HTMLElement>(".sone-tooltip")!;
    expect(bubble.textContent).toBe("Copy");
    expect(bubble.getAttribute("aria-hidden")).toBe("true");
    fireEvent.mouseLeave(button);
    expect(document.querySelector(".sone-tooltip")).toBeNull();
  });

  it("wraps a child with SoneTooltip and keeps the child's ref", () => {
    let node: HTMLElement | null = null;
    render(
      <SoneTooltip text="Save" showDelay={0}>
        <button type="button" ref={(el) => void (node = el)}>
          s
        </button>
      </SoneTooltip>,
    );
    expect(node).not.toBeNull();
    fireEvent.focusIn(screen.getByRole("button"));
    act(() => vi.advanceTimersByTime(0));
    expect(document.querySelector(".sone-tooltip")?.textContent).toBe("Save");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.querySelector(".sone-tooltip")).toBeNull();
  });
});
