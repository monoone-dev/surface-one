import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SoneButton } from "../src/components/button";
import { SoneIcon } from "../src/components/icon";
import { SoneTooltip, placeTooltip } from "../src/components/tooltip";

afterEach(() => {
  vi.useRealTimers();
});

const WINDOW = { width: 400, height: 800 };
const BOX = { width: 80, height: 24 };

describe("placeTooltip", () => {
  it("centres the bubble on the preferred side", () => {
    const anchor = { x: 100, y: 100, width: 40, height: 40 };
    expect(placeTooltip(anchor, BOX, WINDOW, "bottom", "center", 8, 8)).toEqual(
      { side: "bottom", left: -20, top: 48, arrowAt: 40 },
    );
    expect(placeTooltip(anchor, BOX, WINDOW, "top", "start", 8, 8)).toEqual({
      side: "top",
      left: 0,
      top: -32,
      arrowAt: 20,
    });
  });

  it("flips when the side does not fit and stays inside the window", () => {
    const anchor = { x: 2, y: 4, width: 40, height: 40 };
    const top = placeTooltip(anchor, BOX, WINDOW, "top", "center", 8, 8);
    expect(top.side).toBe("bottom");
    // Clamped to the 8dp margin: the bubble starts 6dp right of the anchor's left edge.
    expect(top.left).toBe(6);
    expect(placeTooltip(anchor, BOX, WINDOW, "left", "center", 8, 8).side).toBe(
      "right",
    );
  });
});

describe("SoneTooltip", () => {
  it("gives the control its text as a hint and shows a hidden bubble on focus", () => {
    vi.useFakeTimers();
    render(
      <SoneTooltip text="Copy link" testID="tip">
        <SoneButton size="icon" aria-label="Copy">
          <SoneIcon name="copy" />
        </SoneButton>
      </SoneTooltip>,
    );
    const button = screen.getByRole("button", { name: "Copy" });
    expect(screen.queryByTestId("tip")).toBeNull();
    act(() => {
      fireEvent.focus(button);
    });
    expect(screen.queryByTestId("tip")).toBeNull();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    const tip = screen.getByTestId("tip");
    expect(tip.textContent).toBe("Copy link");
    expect(tip.getAttribute("aria-hidden")).toBe("true");
    // The bubble never adds a second name to the control.
    expect(screen.getByRole("button", { name: "Copy" })).toBe(button);
    act(() => {
      fireEvent.blur(button);
    });
    expect(screen.queryByTestId("tip")).toBeNull();
  });

  it("shows on a long press and hides a moment after the finger lifts", () => {
    vi.useFakeTimers();
    const onLongPress = vi.fn();
    render(
      <SoneTooltip text="Archive" testID="tip" hideDelay={1000}>
        <SoneButton aria-label="Archive" onLongPress={onLongPress}>
          a
        </SoneButton>
      </SoneTooltip>,
    );
    const button = screen.getByRole("button", { name: "Archive" });
    act(() => {
      fireEvent.pointerDown(button, { pointerId: 1, buttons: 1 });
      fireEvent.mouseDown(button, { buttons: 1 });
      vi.advanceTimersByTime(800);
    });
    expect(onLongPress).toHaveBeenCalled();
    expect(screen.getByTestId("tip").textContent).toBe("Archive");
    act(() => {
      fireEvent.pointerUp(button, { pointerId: 1 });
      fireEvent.mouseUp(button);
      vi.advanceTimersByTime(999);
    });
    expect(screen.getByTestId("tip")).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByTestId("tip")).toBeNull();
  });

  it("keeps the child's own handlers and stays quiet while disabled", () => {
    vi.useFakeTimers();
    const onFocus = vi.fn();
    const { rerender } = render(
      <SoneTooltip text="Delete" disabled testID="tip">
        <SoneButton aria-label="Delete" onFocus={onFocus}>
          x
        </SoneButton>
      </SoneTooltip>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    act(() => {
      fireEvent.focus(button);
      vi.advanceTimersByTime(1000);
    });
    expect(onFocus).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("tip")).toBeNull();
    rerender(
      <SoneTooltip text="Delete" showDelay={0} testID="tip">
        <SoneButton aria-label="Delete" onFocus={onFocus}>
          x
        </SoneButton>
      </SoneTooltip>,
    );
    act(() => {
      fireEvent.focus(screen.getByRole("button", { name: "Delete" }));
      vi.advanceTimersByTime(0);
    });
    expect(screen.getByTestId("tip").textContent).toBe("Delete");
  });
});
