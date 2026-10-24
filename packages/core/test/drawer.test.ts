import { describe, expect, it, vi } from "vitest";

import {
  createDrawerSwipe,
  drawerDampen,
  drawerDragDistance,
  drawerRelease,
  drawerSnapOffset,
} from "../src";
import * as drawer from "../src/drawer";

describe("the drawer swipe rules", () => {
  it("are in the module React Native imports", () => {
    expect(drawer.drawerRelease).toBe(drawerRelease);
  });

  it("measure the drag toward each side's edge", () => {
    expect(drawerDragDistance("bottom", 5, 40)).toBe(40);
    expect(drawerDragDistance("top", 5, 40)).toBe(-40);
    expect(drawerDragDistance("right", 30, 5)).toBe(30);
    expect(drawerDragDistance("left", 30, 5)).toBe(-30);
  });

  it("damp a pull past fully open", () => {
    expect(drawerDampen(30)).toBe(30);
    expect(drawerDampen(-24)).toBe(-12);
    expect(drawerDampen(-10000)).toBeGreaterThan(-24);
  });

  it("dismiss past a quarter of the size or on a flick, else spring back", () => {
    const base = { size: 400, snapPoints: [] };
    expect(drawerRelease({ ...base, offset: 50, velocity: 0.1 })).toEqual({
      dismiss: false,
      snap: null,
    });
    expect(drawerRelease({ ...base, offset: 120, velocity: 0.1 })).toEqual({
      dismiss: true,
    });
    expect(drawerRelease({ ...base, offset: 20, velocity: 1 })).toEqual({
      dismiss: true,
    });
    expect(drawerRelease({ ...base, offset: 20, velocity: -1 })).toEqual({
      dismiss: false,
      snap: null,
    });
    expect(
      drawerRelease({ ...base, size: 0, offset: 20, velocity: 1 }),
    ).toEqual({ dismiss: false, snap: null });
  });

  it("settle on the nearest snap point, flick one along, dismiss well below the lowest", () => {
    const base = { size: 400, snapPoints: [0.25, 0.5, 1] };
    // 60% visible: nearest is 0.5.
    expect(drawerRelease({ ...base, offset: 160, velocity: 0 })).toEqual({
      dismiss: false,
      snap: 0.5,
    });
    // A flick down from 60% goes to 0.5, a flick up to 1.
    expect(drawerRelease({ ...base, offset: 160, velocity: 1 })).toEqual({
      dismiss: false,
      snap: 0.5,
    });
    expect(drawerRelease({ ...base, offset: 160, velocity: -1 })).toEqual({
      dismiss: false,
      snap: 1,
    });
    // A flick down at the lowest dismisses.
    expect(drawerRelease({ ...base, offset: 300, velocity: 1 })).toEqual({
      dismiss: true,
    });
    // 10% visible: well below 0.25.
    expect(drawerRelease({ ...base, offset: 360, velocity: 0 })).toEqual({
      dismiss: true,
    });
    expect(drawerSnapOffset(0.25, 400)).toBe(300);
    expect(drawerSnapOffset(null, 400)).toBe(0);
  });
});

describe("createDrawerSwipe", () => {
  function setup(snapPoints: number[] = []) {
    const panel = document.createElement("div");
    panel.innerHTML =
      '<div data-slot="drawer-handle"></div><button>Go</button><p>Text</p>';
    document.body.appendChild(panel);
    vi.spyOn(panel, "getBoundingClientRect").mockReturnValue({
      width: 300,
      height: 400,
    } as DOMRect);
    let active: number | null = snapPoints[0] ?? null;
    const dismiss = vi.fn();
    const swipe = createDrawerSwipe({
      side: () => "bottom",
      snapPoints: () => snapPoints,
      activeSnapPoint: () => active,
      setActiveSnapPoint: (s) => (active = s),
      dismiss,
      dismissible: () => true,
    });
    let clock = 0;
    const fire = (
      target: EventTarget,
      type: string,
      clientY: number,
    ): PointerEvent => {
      const e = new MouseEvent(type, { bubbles: true, button: 0, clientY });
      Object.defineProperty(e, "pointerId", { value: 1 });
      Object.defineProperty(e, "isPrimary", { value: true });
      Object.defineProperty(e, "timeStamp", { value: (clock += 200) });
      target.dispatchEvent(e);
      return e as PointerEvent;
    };
    const drag = (target: Element, from: number, to: number): void => {
      swipe.pointerDown(fire(target, "pointerdown", from), panel);
      fire(target, "pointermove", to);
      fire(target, "pointerup", to);
    };
    return { panel, swipe, dismiss, drag, active: () => active };
  }

  it("dismisses after a long drag from the content, not from a button", () => {
    const { panel, dismiss, drag } = setup();
    drag(panel.querySelector("button")!, 0, 300);
    expect(dismiss).not.toHaveBeenCalled();
    drag(panel.querySelector("p")!, 0, 300);
    expect(dismiss).toHaveBeenCalledTimes(1);
  });

  it("moves between snap points and places the panel", () => {
    const { panel, swipe, drag, active } = setup([0.5, 1]);
    swipe.place(panel);
    expect(panel.style.translate).toBe("0 200px");
    drag(panel.querySelector('[data-slot="drawer-handle"]')!, 300, 100);
    expect(active()).toBe(1);
    expect(panel.style.translate).toBe("");
    swipe.cycle();
    expect(active()).toBe(0.5);
    swipe.focused(panel.querySelector("button"), panel);
    expect(active()).toBe(1);
  });
});
