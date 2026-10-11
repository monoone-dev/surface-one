import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  listenForReposition,
  menuCheckedAttrs,
  placeSubmenu,
} from "../src/menu";

/** `export function listenForReposition(` … its closing brace. */
const repositionFn = (path: string): string => {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const start = source.indexOf("export function listenForReposition(");
  expect(start).toBeGreaterThanOrEqual(0);
  return source.slice(start, source.indexOf("\n}\n", start) + 3);
};

describe("listenForReposition", () => {
  it("is packages/angular/core/focus-scope.ts's, character for character", () => {
    // focus-scope.ts imports @angular/core, so core keeps a checked copy.
    expect(repositionFn("../src/menu.ts")).toBe(
      repositionFn("../../angular/core/focus-scope.ts"),
    );
  });

  it("reports outside scrolls and resizes, not scrolls inside the panel", () => {
    const panel = document.body.appendChild(document.createElement("div"));
    const inner = panel.appendChild(document.createElement("div"));
    const onChange = vi.fn();
    const stop = listenForReposition(window, panel, () => null, onChange);
    inner.dispatchEvent(new Event("scroll"));
    document.dispatchEvent(new Event("scroll"));
    window.dispatchEvent(new Event("resize"));
    expect(onChange.mock.calls).toEqual([["scroll"], ["resize"]]);
    stop();
    window.dispatchEvent(new Event("resize"));
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});

describe("the menu items", () => {
  it("mark a checked item", () => {
    expect(menuCheckedAttrs(true)).toEqual({
      "aria-checked": "true",
      "data-state": "checked",
    });
    expect(menuCheckedAttrs(undefined)["data-state"]).toBe("unchecked");
  });

  it("place a submenu beside its parent menu", () => {
    document.body.innerHTML = `<div data-slot="menu"><button id="t"></button></div><div id="sub"></div>`;
    const sub = document.getElementById("sub")!;
    placeSubmenu(sub, document.getElementById("t")!);
    expect(sub.style.left).toBe("4px");
    expect(sub.style.top).toBe("8px");
    expect(sub.dataset["placed"]).toBe("");
  });
});
