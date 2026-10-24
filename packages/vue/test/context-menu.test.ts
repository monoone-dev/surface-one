import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick, ref } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import { SoneContextMenuTrigger, SoneMenu, SoneMenuItem } from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

function contextmenu(target: Element, x: number, y: number): MouseEvent {
  const event = new MouseEvent("contextmenu", {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
  target.dispatchEvent(event);
  return event;
}

const Host = defineComponent({
  setup() {
    const picked = ref("");
    return () =>
      h(
        SoneContextMenuTrigger,
        { id: "area", tabindex: "0" },
        {
          default: () => "Right-click here",
          menu: () =>
            h(SoneMenu, { "aria-label": "Actions" }, () => [
              h(
                SoneMenuItem,
                { onClick: () => (picked.value = "copy") },
                () => "Copy",
              ),
              h(SoneMenuItem, { disabled: true }, () => "Cut"),
              h(SoneMenuItem, null, () => "Paste"),
            ]),
        },
      );
  },
});

describe("SoneContextMenuTrigger", () => {
  it("renders the area like Angular and opens the menu at the pointer", async () => {
    const wrapper = mount(Host, { attachTo: document.body });
    const area = wrapper.get("#area").element as HTMLElement;
    expect(area.getAttribute("data-slot")).toBe("context-menu-trigger");
    expect(area.getAttribute("data-state")).toBe("closed");
    expect(area.hasAttribute("aria-haspopup")).toBe(false);
    expect(contextmenu(area, 120, 80).defaultPrevented).toBe(true);
    await flush();
    const positioner = document.querySelector<HTMLElement>(
      ".overlay-positioner",
    )!;
    expect(positioner.querySelector('[role="menu"]')).not.toBeNull();
    expect(positioner.style.left).toBe("120px");
    expect(positioner.style.top).toBe("84px");
    area.click();
    await flush();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    wrapper.unmount();
  });

  it("opens on the ContextMenu key on the first item and closes on Escape", async () => {
    const wrapper = mount(Host, { attachTo: document.body });
    const area = wrapper.get("#area");
    (area.element as HTMLElement).focus();
    await area.trigger("keydown", { key: "ContextMenu" });
    await flush();
    expect(document.activeElement?.textContent).toBe("Copy");
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await flush();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(area.element);
    wrapper.unmount();
  });
});
