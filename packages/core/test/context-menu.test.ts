import { afterEach, describe, expect, it, vi } from "vitest";

import {
  contextMenuEventPoint,
  contextMenuPointRect,
  createContextMenuTrigger,
  createLongPress,
  isContextMenuKey,
} from "../src";
import * as gesture from "../src/context-menu-gesture";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("the context menu gestures", () => {
  it("are in the module React Native imports", () => {
    expect(gesture.createLongPress).toBe(createLongPress);
  });

  it("know the keyboard's request and a pointer's point", () => {
    expect(isContextMenuKey({ key: "ContextMenu", shiftKey: false })).toBe(
      true,
    );
    expect(isContextMenuKey({ key: "F10", shiftKey: true })).toBe(true);
    expect(isContextMenuKey({ key: "F10", shiftKey: false })).toBe(false);
    expect(contextMenuEventPoint({ clientX: 0, clientY: 0 })).toBeNull();
    expect(contextMenuEventPoint({ clientX: 12, clientY: 30 })).toEqual({
      x: 12,
      y: 30,
    });
    expect(contextMenuPointRect({ x: 12, y: 30 })).toEqual({
      top: 30,
      bottom: 30,
      left: 12,
      right: 12,
    });
  });

  it("fire a long press on a still touch, never on a mouse or a drift", () => {
    vi.useFakeTimers();
    const fire = vi.fn();
    const press = createLongPress(fire);
    press.down({ pointerType: "mouse", clientX: 5, clientY: 5 });
    vi.advanceTimersByTime(600);
    press.down({ pointerType: "touch", clientX: 5, clientY: 5 });
    press.move({ clientX: 30, clientY: 5 });
    vi.advanceTimersByTime(600);
    press.down({ pointerType: "touch", clientX: 5, clientY: 5 });
    press.move({ clientX: 8, clientY: 7 });
    vi.advanceTimersByTime(499);
    expect(fire).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fire).toHaveBeenCalledWith({ x: 5, y: 5 });
    expect(press.justFired()).toBe(true);
  });
});

describe("createContextMenuTrigger", () => {
  function setup() {
    const area = document.createElement("div");
    area.tabIndex = 0;
    document.body.append(area);
    let open = false;
    const positioner = document.createElement("div");
    positioner.innerHTML =
      '<div role="menu"><button role="menuitem">Copy</button><button role="menuitem">Paste</button></div>';
    const menu = createContextMenuTrigger({
      trigger: () => area,
      positioner: () => (open ? positioner : null),
      isOpen: () => open,
      setOpen: (v) => {
        open = v;
        if (v) document.body.append(positioner);
        else positioner.remove();
      },
      side: () => "bottom",
      align: () => "start",
      offset: () => 4,
      keepOpenOnOutsideClick: () => false,
      disabled: () => false,
    });
    return { area, menu, positioner, isOpen: () => open };
  }

  it("opens at the pointer on a right click and at the area from the keyboard", () => {
    const { area, menu, positioner, isOpen } = setup();
    const event = { clientX: 40, clientY: 50, preventDefault: vi.fn() };
    menu.contextMenu(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(isOpen()).toBe(true);
    menu.attached();
    expect(positioner.dataset["placed"]).toBe("");
    expect(document.activeElement?.getAttribute("role")).toBe("menu");
    menu.click();
    expect(isOpen()).toBe(false);

    area.focus();
    const key = {
      key: "F10",
      shiftKey: true,
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };
    menu.keyDown(key);
    menu.attached();
    expect(isOpen()).toBe(true);
    expect(document.activeElement?.textContent).toBe("Copy");
    menu.keyDown({ ...key, key: "Escape", shiftKey: false });
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(area);
  });
});
