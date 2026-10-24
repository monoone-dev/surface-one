import { act, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneHoverCard,
  SoneHoverCardContent,
  SoneHoverCardTrigger,
} from "../src/components/hover-card";

afterEach(() => {
  document.body.innerHTML = "";
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function setup() {
  const view = render(
    <SoneHoverCard openDelay={0} closeDelay={40}>
      <SoneHoverCardTrigger href="#ada" id="trigger">
        Ada Park
      </SoneHoverCardTrigger>
      <SoneHoverCardContent>Product design.</SoneHoverCardContent>
    </SoneHoverCard>,
  );
  const trigger = view.container.querySelector<HTMLAnchorElement>("#trigger")!;
  const card = () => document.querySelector('[data-slot="hover-card"]');
  return { trigger, card };
}

describe("SoneHoverCard", () => {
  it("previews the card on hover without taking focus, like Angular", async () => {
    const { trigger, card } = setup();
    expect(trigger.tagName).toBe("A");
    expect(trigger.hasAttribute("aria-haspopup")).toBe(false);
    act(() => trigger.focus());
    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    expect(card()!.className).toBe("popover hover-card");
    expect(card()!.hasAttribute("role")).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe(card()!.id);
    expect(document.activeElement).toBe(trigger);
    const positioner = document.querySelector(".overlay-positioner")!;
    fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
    act(() => {
      positioner.dispatchEvent(new Event("pointerenter"));
    });
    await act(() => wait(80));
    expect(card()).not.toBeNull();
    act(() => {
      positioner.dispatchEvent(new Event("pointerleave"));
    });
    await act(() => wait(80));
    expect(card()).toBeNull();
  });

  it("opens on a touch tap first and closes on Escape", () => {
    const { trigger, card } = setup();
    fireEvent.pointerDown(trigger, { pointerType: "touch" });
    const tap = fireEvent.click(trigger);
    expect(tap).toBe(false);
    expect(card()).not.toBeNull();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(card()).toBeNull();
  });
});
