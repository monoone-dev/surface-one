import { mount } from "@vue/test-utils";
import { h, nextTick, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneMenu,
  SoneMenuCheckboxItem,
  SoneMenuItem,
  SoneMenuTrigger,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const flush = async () => {
  await nextTick();
  await nextTick();
};

function setup(onPick = vi.fn()) {
  const open = ref(false);
  const w = mount(
    () =>
      h(
        SoneMenuTrigger,
        {
          class: "btn",
          open: open.value,
          "onUpdate:open": (v: boolean) => (open.value = v),
        },
        {
          default: () => "Options",
          menu: () =>
            h(SoneMenu, null, () => [
              h(SoneMenuItem, { onClick: () => onPick("edit") }, () => "Edit"),
              h(SoneMenuItem, { disabled: true }, () => "Move"),
              h(
                SoneMenuItem,
                { onClick: () => onPick("delete") },
                () => "Delete",
              ),
              h(
                SoneMenuCheckboxItem,
                { checked: true, "data-menu-keep-open": "" },
                () => "Pinned",
              ),
            ]),
        },
      ),
    { attachTo: document.body },
  );
  const trigger = w.get("button.btn").element as HTMLButtonElement;
  const menu = () => document.querySelector<HTMLElement>('[data-slot="menu"]');
  const items = () =>
    Array.from(document.querySelectorAll<HTMLElement>('[role^="menuitem"]'));
  return { w, open, trigger, menu, items, onPick };
}

const key = (el: Element, k: string) =>
  el.dispatchEvent(
    new KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }),
  );

describe("SoneMenuTrigger", () => {
  it("renders a closed menu button on the server", async () => {
    const html = await renderToString(
      h(SoneMenuTrigger, null, { default: () => "Options" }),
    );
    expect(html).toContain('type="button"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).toContain('aria-expanded="false"');
    expect(html).toContain('data-state="closed"');
  });

  it("opens from ArrowDown on the first item, in a positioner on <body>", async () => {
    const { trigger, menu, items, open } = setup();
    trigger.focus();
    key(trigger, "ArrowDown");
    await flush();
    expect(open.value).toBe(true);
    const positioner = menu()!.parentElement!;
    expect(positioner.dataset["slot"]).toBe("overlay-positioner");
    expect(positioner.parentElement).toBe(document.body);
    expect(positioner.hasAttribute("data-placed")).toBe(true);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(trigger.getAttribute("data-state")).toBe("open");
    expect(trigger.getAttribute("aria-controls")).toBe(menu()!.id);
    expect(document.activeElement).toBe(items()[0]);
    // The items leave the Tab order while the trigger drives the menu.
    expect(items().every((i) => i.getAttribute("tabindex") === "-1")).toBe(
      true,
    );
  });

  it("moves with the arrows (skipping disabled items), Home / End and typeahead", async () => {
    const { trigger, items } = setup();
    key(trigger, "ArrowUp");
    await flush();
    const [edit, , del, pinned] = items();
    expect(document.activeElement).toBe(pinned);
    key(pinned!, "ArrowDown");
    expect(document.activeElement).toBe(edit);
    key(edit!, "ArrowDown");
    expect(document.activeElement).toBe(del);
    key(del!, "Home");
    expect(document.activeElement).toBe(edit);
    key(edit!, "End");
    expect(document.activeElement).toBe(pinned);
    key(pinned!, "d");
    expect(document.activeElement).toBe(del);
  });

  it("activates with Enter, closes and gives focus back to the trigger", async () => {
    const { trigger, items, menu, onPick, open } = setup();
    key(trigger, "Enter");
    await flush();
    items()[2]!.focus();
    key(items()[2]!, "Enter");
    await flush();
    expect(onPick).toHaveBeenCalledWith("delete");
    expect(open.value).toBe(false);
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(trigger.hasAttribute("aria-controls")).toBe(false);
  });

  it("stays open for a keep-open item, closes on Escape and on a click outside", async () => {
    const { trigger, items, menu, open } = setup();
    key(trigger, "ArrowDown");
    await flush();
    items()[3]!.click();
    await flush();
    expect(open.value).toBe(true);
    key(items()[0]!, "Escape");
    await flush();
    expect(menu()).toBeNull();
    expect(document.activeElement).toBe(trigger);

    trigger.click();
    await flush();
    expect(open.value).toBe(true);
    document.body.dispatchEvent(new Event("pointerdown", { bubbles: true }));
    await flush();
    expect(open.value).toBe(false);
  });

  it("a mouse click focuses the menu itself, a second click closes it", async () => {
    const { trigger, menu, open } = setup();
    trigger.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );
    await flush();
    expect(document.activeElement).toBe(menu());
    trigger.dispatchEvent(
      new MouseEvent("click", { bubbles: true, detail: 1 }),
    );
    await flush();
    expect(open.value).toBe(false);
  });
});
