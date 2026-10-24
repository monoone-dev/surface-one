import { ChangeDetectionStrategy, Component } from "@angular/core";
import { afterEach, describe, expect, it } from "vitest";

import { SONE_HOVER_CARD_PARTS } from "@surface-one/angular/hover-card";

import { $, key, render, settle } from "./helpers";

afterEach(() => {
  document.body.innerHTML = "";
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function pointer(target: Element, type: string, pointerType = "mouse"): void {
  const event = new Event(type, { bubbles: type === "pointerdown" });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  target.dispatchEvent(event);
}

@Component({
  imports: [...SONE_HOVER_CARD_PARTS],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      id="trigger"
      href="#ada"
      [soneHoverCardTrigger]="card"
      [openDelay]="0"
      [closeDelay]="40"
      >Ada Park</a
    >
    <ng-template #card>
      <div soneHoverCard>
        Product design. <a id="inside" href="#more">More</a>
      </div>
    </ng-template>
    <button id="outside" type="button">Outside</button>
  `,
})
class HoverCardHost {}

describe("soneHoverCardTrigger", () => {
  it("previews the card on hover without taking focus or naming a popup", async () => {
    const fixture = await render(HoverCardHost);
    const trigger = $("#trigger");
    expect(trigger.hasAttribute("aria-haspopup")).toBe(false);
    expect(trigger.hasAttribute("aria-expanded")).toBe(false);
    trigger.focus();
    pointer(trigger, "pointerenter");
    await settle(fixture);
    const card = $('[data-slot="hover-card"]');
    expect(card).toBeTruthy();
    expect(card.classList.contains("popover")).toBe(true);
    expect(card.hasAttribute("role")).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe(card.id);
    expect(document.activeElement).toBe(trigger);

    // Pointer from the trigger to the card: it stays.
    const positioner = $('[data-slot="overlay-positioner"]');
    pointer(trigger, "pointerleave");
    pointer(positioner, "pointerenter");
    await wait(80);
    await settle(fixture);
    expect($('[data-slot="hover-card"]')).toBeTruthy();
    pointer(positioner, "pointerleave");
    await wait(80);
    await settle(fixture);
    expect($('[data-slot="hover-card"]')).toBeNull();
    expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  });

  it("opens on keyboard focus and closes on Escape", async () => {
    const fixture = await render(HoverCardHost);
    const trigger = $("#trigger");
    trigger.focus();
    trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
    await settle(fixture);
    expect($('[data-slot="hover-card"]')).toBeTruthy();
    // Tab is not redirected into the card.
    expect(key(trigger, "Tab").defaultPrevented).toBe(false);
    key(trigger, "Escape");
    await settle(fixture);
    expect($('[data-slot="hover-card"]')).toBeNull();
  });

  it("opens on the first tap of a touch screen and follows the link on the next", async () => {
    const fixture = await render(HoverCardHost);
    const trigger = $("#trigger");
    pointer(trigger, "pointerdown", "touch");
    const first = new MouseEvent("click", { bubbles: true, cancelable: true });
    trigger.dispatchEvent(first);
    await settle(fixture);
    expect(first.defaultPrevented).toBe(true);
    expect($('[data-slot="hover-card"]')).toBeTruthy();
    const second = new MouseEvent("click", { bubbles: true, cancelable: true });
    trigger.dispatchEvent(second);
    expect(second.defaultPrevented).toBe(false);
  });
});
