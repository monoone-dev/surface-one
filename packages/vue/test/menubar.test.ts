import { mount } from "@vue/test-utils";
import { defineComponent, h, nextTick } from "vue";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneMenu,
  SoneMenuItem,
  SoneMenubar,
  SoneMenubarTrigger,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

const menu = (label: string, items: string[]) => () =>
  h(SoneMenu, { "aria-label": label }, () =>
    items.map((item) => h(SoneMenuItem, null, () => item)),
  );

const Host = defineComponent({
  setup: () => () =>
    h(SoneMenubar, { "aria-label": "Editor" }, () => [
      h(
        SoneMenubarTrigger,
        { id: "file" },
        { default: () => "File", menu: menu("File", ["New Tab", "Print"]) },
      ),
      h(
        SoneMenubarTrigger,
        { id: "edit" },
        { default: () => "Edit", menu: menu("Edit", ["Undo", "Redo"]) },
      ),
    ]),
});

describe("SoneMenubar", () => {
  it("renders the bar like Angular with one Tab stop", async () => {
    const wrapper = mount(Host, { attachTo: document.body });
    await flush();
    const bar = wrapper.get('[data-slot="menubar"]');
    expect(bar.attributes("role")).toBe("menubar");
    expect(bar.classes()).toContain("menubar");
    const file = wrapper.get("#file");
    expect(file.attributes()).toMatchObject({
      class: "menubar-trigger",
      role: "menuitem",
      "aria-haspopup": "menu",
      "aria-expanded": "false",
      tabindex: "0",
    });
    expect(wrapper.get("#edit").attributes("tabindex")).toBe("-1");
    wrapper.unmount();
  });

  it("opens with ArrowDown, moves to the next menu with ArrowRight and closes on Escape", async () => {
    const wrapper = mount(Host, { attachTo: document.body });
    await flush();
    const file = wrapper.get("#file");
    (file.element as HTMLElement).focus();
    await file.trigger("keydown", { key: "ArrowDown" });
    await flush();
    expect(document.activeElement?.textContent).toBe("New Tab");
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
    );
    await flush();
    expect(file.attributes("aria-expanded")).toBe("false");
    expect(wrapper.get("#edit").attributes("aria-expanded")).toBe("true");
    expect(document.activeElement?.textContent).toBe("Undo");
    document.activeElement!.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    await flush();
    expect(document.activeElement).toBe(wrapper.get("#edit").element);
    wrapper.unmount();
  });
});
