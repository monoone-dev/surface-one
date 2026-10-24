import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneHoverCard,
  SoneHoverCardContent,
  SoneHoverCardTrigger,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

function pointer(target: Element, type: string, pointerType = "mouse"): void {
  const event = new Event(type, { bubbles: type === "pointerdown" });
  Object.defineProperty(event, "pointerType", { value: pointerType });
  target.dispatchEvent(event);
}

const Host = defineComponent({
  setup: () => () =>
    h(SoneHoverCard, { openDelay: 0, closeDelay: 40 }, () => [
      h(
        SoneHoverCardTrigger,
        { href: "#ada", id: "trigger" },
        () => "Ada Park",
      ),
      h(SoneHoverCardContent, null, () => "Product design."),
    ]),
});

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const flush = async () => {
  await nextTick();
  await nextTick();
};

describe("SoneHoverCard", () => {
  it("previews the card on hover without taking focus, like Angular", async () => {
    const wrapper = mount(Host, { attachTo: document.body });
    const trigger = wrapper.get("#trigger").element as HTMLAnchorElement;
    expect(trigger.tagName).toBe("A");
    expect(trigger.hasAttribute("aria-haspopup")).toBe(false);
    trigger.focus();
    pointer(trigger, "pointerenter");
    await flush();
    const card = document.querySelector('[data-slot="hover-card"]')!;
    expect(card.className).toBe("popover hover-card");
    expect(card.hasAttribute("role")).toBe(false);
    expect(trigger.getAttribute("aria-describedby")).toBe(card.id);
    expect(document.activeElement).toBe(trigger);
    const positioner = document.querySelector(".overlay-positioner")!;
    pointer(trigger, "pointerleave");
    pointer(positioner, "pointerenter");
    await wait(80);
    await flush();
    expect(document.querySelector('[data-slot="hover-card"]')).not.toBeNull();
    pointer(positioner, "pointerleave");
    await wait(80);
    await flush();
    expect(document.querySelector('[data-slot="hover-card"]')).toBeNull();
    wrapper.unmount();
  });

  it("opens on focus and closes on Escape", async () => {
    const wrapper = mount(Host, { attachTo: document.body });
    const trigger = wrapper.get("#trigger");
    await trigger.trigger("focusin");
    await flush();
    expect(document.querySelector('[data-slot="hover-card"]')).not.toBeNull();
    await trigger.trigger("keydown", { key: "Escape" });
    await flush();
    expect(document.querySelector('[data-slot="hover-card"]')).toBeNull();
    wrapper.unmount();
  });
});
