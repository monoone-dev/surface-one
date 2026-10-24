import { afterEach, describe, expect, it, vi } from "vitest";

import { createMenubar, type MenubarMenu } from "../src";

afterEach(() => {
  document.body.innerHTML = "";
});

function bar(names: string[]) {
  const menubar = createMenubar();
  const state = new Map<string, boolean>();
  const opened: string[] = [];
  const menus = names.map((name) => {
    const element = document.createElement("button");
    element.textContent = name;
    document.body.append(element);
    const menu: MenubarMenu = {
      element,
      isOpen: () => !!state.get(name),
      open: (focus) => {
        state.set(name, true);
        opened.push(`${name}:${focus}`);
      },
      close: () => state.set(name, false),
    };
    menubar.register(menu);
    return menu;
  });
  const key = (k: string) => ({ key: k, preventDefault: vi.fn() });
  return { menubar, menus, state, opened, key };
}

describe("createMenubar", () => {
  it("keeps one Tab stop and moves it with the arrow keys, Home and End", () => {
    const { menubar, menus, key } = bar(["File", "Edit", "View"]);
    const [file, edit, view] = menus as [MenubarMenu, MenubarMenu, MenubarMenu];
    expect(menus.map((m) => m.element.tabIndex)).toEqual([0, -1, -1]);
    expect(menubar.triggerKeyDown(file, key("ArrowRight"))).toBe(true);
    expect(document.activeElement).toBe(edit.element);
    expect(menus.map((m) => m.element.tabIndex)).toEqual([-1, 0, -1]);
    menubar.triggerKeyDown(file, key("ArrowLeft"));
    expect(document.activeElement).toBe(view.element);
    menubar.triggerKeyDown(view, key("Home"));
    expect(document.activeElement).toBe(file.element);
    menubar.triggerKeyDown(file, key("End"));
    expect(document.activeElement).toBe(view.element);
    expect(menubar.triggerKeyDown(view, key("a"))).toBe(false);
  });

  it("moves from an open menu to the next one and opens it", () => {
    const { menubar, menus, state, opened, key } = bar(["File", "Edit"]);
    const [file, edit] = menus as [MenubarMenu, MenubarMenu];
    file.open("first");
    const item = document.createElement("button");
    expect(menubar.panelKeyDown(file, key("ArrowRight"), item)).toBe(true);
    expect(state.get("File")).toBe(false);
    expect(opened.at(-1)).toBe("Edit:first");
    expect(document.activeElement).toBe(edit.element);
    // A sub trigger keeps ArrowRight for its submenu.
    item.setAttribute("aria-haspopup", "menu");
    expect(menubar.panelKeyDown(edit, key("ArrowRight"), item)).toBe(false);
    expect(menubar.panelKeyDown(edit, key("ArrowDown"), item)).toBe(false);
  });

  it("switches menus on hover only while one is open", () => {
    const { menubar, menus, state } = bar(["File", "Edit"]);
    const [file, edit] = menus as [MenubarMenu, MenubarMenu];
    menubar.pointerEnter(edit);
    expect(state.get("Edit")).toBeFalsy();
    file.open(null);
    menubar.pointerEnter(edit);
    expect(state.get("File")).toBe(false);
    expect(state.get("Edit")).toBe(true);
  });
});
