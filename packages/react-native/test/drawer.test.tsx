import { act, fireEvent, render, screen } from "@testing-library/react";
import { Text } from "react-native";
import { describe, expect, it, vi } from "vitest";

import {
  SoneDrawer,
  SoneDrawerClose,
  SoneDrawerHeader,
  SoneDrawerTitle,
} from "../src/components/drawer";

/** react-native-web's responder system follows the mouse like a finger. */
function mouse(el: Element, type: string, y: number, t: number): void {
  act(() => {
    fireEvent[type as "mouseDown"](el, {
      buttons: type === "mouseUp" ? 0 : 1,
      clientX: 10,
      clientY: y,
      pageX: 10,
      pageY: y,
      timeStamp: t,
    });
  });
}

describe("SoneDrawer", () => {
  it("is a named bottom sheet with a drag handle and no corner close", () => {
    const onOpenChange = vi.fn();
    render(
      <SoneDrawer onOpenChange={onOpenChange}>
        <SoneDrawerHeader>
          <SoneDrawerTitle>Move goal</SoneDrawerTitle>
          <SoneDrawerClose />
        </SoneDrawerHeader>
        <Text>Set your daily activity goal.</Text>
      </SoneDrawer>,
    );
    expect(screen.getByRole("dialog", { name: "Move goal" })).toBeTruthy();
    // Only the header's own close button: no corner close.
    expect(screen.getAllByRole("button", { name: "Close" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("is dismissed by a long swipe down on its handle", () => {
    for (const k of ["clientHeight", "clientWidth"])
      Object.defineProperty(document.documentElement, k, {
        value: 800,
        configurable: true,
      });
    act(() => {
      window.dispatchEvent(new Event("resize"));
    });
    const onOpenChange = vi.fn();
    render(
      <SoneDrawer onOpenChange={onOpenChange} ariaLabel="Goal">
        <Text>Body</Text>
      </SoneDrawer>,
    );
    // jsdom lays nothing out: the swipe measures against the window.
    const dialog = screen.getByRole("dialog", { name: "Goal" });
    const handle = dialog.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(handle).toBeTruthy();
    mouse(handle, "mouseDown", 100, 1000);
    mouse(handle, "mouseMove", 200, 1400);
    mouse(handle, "mouseMove", 350, 1800);
    mouse(handle, "mouseUp", 350, 2200);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
