import { afterEach, describe, expect, it, vi } from "vitest";

import { createHoverCardTrigger, createHoverIntent } from "../src";
import * as hoverIntent from "../src/hover-intent";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

function intent(openDelay = 700, closeDelay = 300) {
  let open = false;
  const calls: string[] = [];
  const it = createHoverIntent({
    isOpen: () => open,
    open: () => {
      open = true;
      calls.push("open");
    },
    close: () => {
      open = false;
      calls.push("close");
    },
    openDelay: () => openDelay,
    closeDelay: () => closeDelay,
  });
  return { intent: it, calls, isOpen: () => open };
}

describe("the hover intent", () => {
  it("is in the module React Native imports", () => {
    expect(hoverIntent.createHoverIntent).toBe(createHoverIntent);
  });

  it("opens after the open delay and not when the pointer only passes", () => {
    vi.useFakeTimers();
    const { intent: hover, calls } = intent();
    hover.enter();
    vi.advanceTimersByTime(400);
    hover.leave();
    vi.advanceTimersByTime(1000);
    expect(calls).toEqual([]);
    hover.enter();
    vi.advanceTimersByTime(700);
    expect(calls).toEqual(["open"]);
  });

  it("stays open while the pointer moves from the trigger to the card", () => {
    vi.useFakeTimers();
    const { intent: hover, calls, isOpen } = intent();
    hover.openNow();
    hover.leave();
    vi.advanceTimersByTime(200);
    hover.enter();
    vi.advanceTimersByTime(1000);
    expect(isOpen()).toBe(true);
    hover.leave();
    vi.advanceTimersByTime(300);
    expect(calls).toEqual(["open", "close"]);
  });

  it("acts at once with no delay", () => {
    const { intent: hover, calls } = intent(0, 0);
    hover.enter();
    hover.leave();
    expect(calls).toEqual(["open", "close"]);
  });
});

describe("createHoverCardTrigger", () => {
  it("leaves focus on the trigger and keeps the card open while the pointer is on it", () => {
    vi.useFakeTimers();
    const trigger = document.createElement("a");
    trigger.href = "#x";
    document.body.append(trigger);
    let open = false;
    const positioner = document.createElement("div");
    const card = createHoverCardTrigger({
      trigger: () => trigger,
      positioner: () => (open ? positioner : null),
      isOpen: () => open,
      setOpen: (v) => {
        open = v;
        if (v) {
          positioner.innerHTML =
            '<div><button type="button">In card</button></div>';
          document.body.append(positioner);
        } else positioner.remove();
      },
      side: () => "bottom",
      align: () => "center",
      offset: () => 4,
      keepOpenOnOutsideClick: () => false,
      openDelay: () => 100,
      closeDelay: () => 100,
      openOnFocus: () => true,
    });
    trigger.focus();
    card.focusIn();
    vi.advanceTimersByTime(100);
    expect(open).toBe(true);
    card.attached();
    expect(document.activeElement).toBe(trigger);
    card.pointerLeave({ pointerType: "mouse" });
    positioner.dispatchEvent(new Event("pointerenter"));
    vi.advanceTimersByTime(500);
    expect(open).toBe(true);
    positioner.dispatchEvent(new Event("pointerleave"));
    vi.advanceTimersByTime(100);
    expect(open).toBe(false);
    card.detached();
  });

  it("opens on the first tap and lets the next one through", () => {
    let open = false;
    const card = createHoverCardTrigger({
      trigger: () => null,
      positioner: () => null,
      isOpen: () => open,
      setOpen: (v) => (open = v),
      side: () => "bottom",
      align: () => "center",
      offset: () => 4,
      keepOpenOnOutsideClick: () => false,
      openDelay: () => 700,
      closeDelay: () => 300,
      openOnFocus: () => true,
    });
    const tap = { preventDefault: vi.fn() };
    card.pointerDown({ pointerType: "touch" });
    card.triggerClick(tap);
    expect(open).toBe(true);
    expect(tap.preventDefault).toHaveBeenCalledTimes(1);
    card.triggerClick(tap);
    expect(tap.preventDefault).toHaveBeenCalledTimes(1);
  });
});
