import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SoneDrawer,
  SoneDrawerClose,
  SoneDrawerDescription,
  SoneDrawerHeader,
  SoneDrawerTitle,
} from "../src/components/drawer";

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    width: 400,
    height: 400,
  } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

let clock = 0;
function pointer(el: Element, type: string, clientY: number): void {
  const e = new MouseEvent(type, {
    bubbles: true,
    cancelable: true,
    button: 0,
    clientY,
  });
  Object.defineProperty(e, "pointerId", { value: 1 });
  Object.defineProperty(e, "isPrimary", { value: true });
  Object.defineProperty(e, "timeStamp", { value: (clock += 200) });
  act(() => {
    el.dispatchEvent(e);
  });
}

function Host({ snapPoints }: { snapPoints?: number[] }) {
  const [open, setOpen] = useState(true);
  const [snap, setSnap] = useState<number | null>(null);
  return (
    <>
      <output data-testid="state">{`${open} ${snap}`}</output>
      <SoneDrawer
        open={open}
        onOpenChange={setOpen}
        snapPoints={snapPoints}
        activeSnapPoint={snap}
        onActiveSnapPointChange={setSnap}
      >
        <SoneDrawerHeader>
          <SoneDrawerTitle>Move goal</SoneDrawerTitle>
          <SoneDrawerDescription>
            Set your daily activity goal.
          </SoneDrawerDescription>
          <SoneDrawerClose />
        </SoneDrawerHeader>
        <button type="button">Submit</button>
      </SoneDrawer>
    </>
  );
}

const state = () => screen.getByTestId("state").textContent;

describe("SoneDrawer", () => {
  it("is a modal sheet from the bottom with a drag handle and no corner close", () => {
    render(<Host />);
    const panel = screen.getByRole("dialog");
    expect(panel.getAttribute("data-slot")).toBe("drawer-content");
    expect(panel.className).toBe("sheet-content drawer-content");
    expect(panel.getAttribute("data-side")).toBe("bottom");
    expect(panel.closest("sone-drawer")?.className).toBe(
      "sheet-overlay drawer-overlay",
    );
    expect(document.querySelector('[data-slot="drawer-handle"]')).toBeTruthy();
    expect(document.querySelector('[data-slot="drawer-close"]')).toBeNull();
    expect(screen.getByRole("dialog", { name: "Move goal" })).toBe(panel);
  });

  it("closes on Escape and from SoneDrawerClose", () => {
    render(<Host />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(state()).toBe("false null");
  });

  it("springs back from a short swipe and is dismissed by a long one", () => {
    render(<Host />);
    const handle = document.querySelector('[data-slot="drawer-handle"]')!;
    const panel = screen.getByRole("dialog");
    pointer(handle, "pointerdown", 100);
    pointer(handle, "pointermove", 150);
    expect(panel.style.translate).toBe("0 50px");
    pointer(handle, "pointerup", 150);
    expect(panel.style.translate).toBe("");
    expect(state()).toBe("true null");
    pointer(handle, "pointerdown", 100);
    pointer(handle, "pointermove", 300);
    pointer(handle, "pointerup", 300);
    expect(state()).toBe("false null");
  });

  it("rests on snap points and the handle cycles them", () => {
    render(<Host snapPoints={[0.5, 1]} />);
    const panel = screen.getByRole("dialog");
    expect(panel.hasAttribute("data-snap-points")).toBe(true);
    expect(panel.style.translate).toBe("0 200px");
    fireEvent.click(document.querySelector('[data-slot="drawer-handle"]')!);
    expect(state()).toBe("true 1");
    expect(panel.style.translate).toBe("");
  });

  it("closes from the close part", () => {
    render(<Host />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(state()).toBe("false null");
  });
});
