import { afterEach, describe, expect, it, vi } from "vitest";

import { createNavigationMenu, navigationMenuTopLevel } from "../src";

afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

function menu() {
  let value: string | null = null;
  const nav = createNavigationMenu({
    value: () => value,
    setValue: (v) => (value = v),
    openDelay: () => 200,
    closeDelay: () => 150,
    afterRender: (fn) => fn(),
  });
  return { nav, value: () => value };
}

const key = (k: string, target: EventTarget | null = null) => ({
  key: k,
  target,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
});

describe("createNavigationMenu", () => {
  it("toggles on click and opens on hover after the delay, at once while another is open", () => {
    vi.useFakeTimers();
    const { nav, value } = menu();
    nav.triggerClick("a");
    expect(value()).toBe("a");
    vi.advanceTimersByTime(400);
    nav.triggerClick("a");
    expect(value()).toBeNull();
    nav.itemEnter("a", "touch");
    vi.advanceTimersByTime(400);
    expect(value()).toBeNull();
    nav.itemEnter("a", "mouse");
    vi.advanceTimersByTime(199);
    expect(value()).toBeNull();
    vi.advanceTimersByTime(1);
    expect(value()).toBe("a");
    nav.itemEnter("b", "mouse");
    expect(value()).toBe("b");
    nav.itemLeave("mouse");
    vi.advanceTimersByTime(100);
    nav.itemEnter("b", "mouse");
    vi.advanceTimersByTime(200);
    expect(value()).toBe("b");
    nav.itemLeave("mouse");
    vi.advanceTimersByTime(150);
    expect(value()).toBeNull();
  });

  it("opens on ArrowDown on the first link and closes on Escape back on the trigger", () => {
    document.body.innerHTML =
      '<button id="t">Docs</button><div id="c"><a href="#a">A</a><a href="#b">B</a></div>';
    const { nav, value } = menu();
    const trigger = document.getElementById("t")!;
    nav.triggerKeyDown("docs", key("ArrowDown"), () =>
      document.getElementById("c"),
    );
    expect(value()).toBe("docs");
    expect(document.activeElement?.textContent).toBe("A");
    nav.contentKeyDown(key("Escape"), trigger);
    expect(value()).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("moves along the top level and closes when focus or a pointer leaves", () => {
    document.body.innerHTML = `
      <nav id="nav"><ul data-slot="navigation-menu-list" id="list">
        <li><button data-slot="navigation-menu-trigger">One</button>
          <div data-slot="navigation-menu-content"><a data-slot="navigation-menu-link" href="#x">Inner</a></div></li>
        <li><a data-slot="navigation-menu-link" href="#y">Two</a></li>
      </ul></nav><button id="out">Out</button>`;
    const list = document.getElementById("list")!;
    const top = navigationMenuTopLevel(list);
    expect(top.map((el) => el.textContent)).toEqual(["One", "Two"]);
    const { nav, value } = menu();
    nav.listKeyDown(list, key("ArrowRight", top[0]!));
    expect(document.activeElement).toBe(top[1]);
    nav.listKeyDown(list, key("ArrowRight", top[1]!));
    expect(document.activeElement).toBe(top[0]);
    nav.listKeyDown(list, key("End", top[0]!));
    expect(document.activeElement).toBe(top[1]);
    nav.triggerClick("one");
    const root = document.getElementById("nav")!;
    nav.focusOut(root, top[1]!);
    expect(value()).toBe("one");
    nav.focusOut(root, document.getElementById("out"));
    expect(value()).toBeNull();
    nav.triggerClick("one");
    nav.pointerDown(root, document.getElementById("out"));
    expect(value()).toBeNull();
  });
});
