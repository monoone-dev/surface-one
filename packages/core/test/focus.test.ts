import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it } from "vitest";

import {
  createModalFocus,
  cycleFocus,
  focusLost,
  tabbableElements,
} from "../src/focus";

/** From the TABBABLE_SELECTOR doc comment to the end of `tabbableElements`. */
const tabbableBlock = (path: string): string => {
  const source = readFileSync(new URL(path, import.meta.url), "utf8");
  const start = source.indexOf("/** What can take focus with Tab");
  const fn = source.indexOf("export function tabbableElements");
  const end = source.indexOf("\n}\n", fn) + 3;
  expect(start).toBeGreaterThanOrEqual(0);
  expect(fn).toBeGreaterThan(start);
  return source.slice(start, end);
};

// jsdom lays nothing out: give every element one client rect, as a rendered one has.
HTMLElement.prototype.getClientRects = function () {
  return [{}] as unknown as DOMRectList;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("the tabbable helpers", () => {
  it("are packages/angular/core/focus-scope.ts's, character for character", () => {
    // focus-scope.ts imports @angular/core, so core keeps a checked copy.
    expect(tabbableBlock("../src/focus.ts")).toBe(
      tabbableBlock("../../angular/core/focus-scope.ts"),
    );
  });

  it("skip disabled, inert and negative-tabindex elements and keep one stop per radio group", () => {
    document.body.innerHTML = `
      <button id="a">A</button>
      <button disabled>no</button>
      <div inert><button>no</button></div>
      <span tabindex="-1">no</span>
      <input type="radio" name="g" id="r1">
      <input type="radio" name="g" id="r2" checked>
      <a href="#" id="b">B</a>`;
    expect(tabbableElements(document.body).map((el) => el.id)).toEqual([
      "a",
      "r2",
      "b",
    ]);
  });
});

describe("cycleFocus", () => {
  it("wraps Tab and Shift+Tab inside the panel", () => {
    document.body.innerHTML = `<div id="p" tabindex="-1"><button id="a"></button><button id="b"></button></div>`;
    const panel = document.getElementById("p")!;
    document.getElementById("b")!.focus();
    cycleFocus(panel, false);
    expect(document.activeElement?.id).toBe("a");
    cycleFocus(panel, true);
    expect(document.activeElement?.id).toBe("b");
  });

  it("focuses the panel itself when nothing inside can take focus", () => {
    document.body.innerHTML = `<div id="p" tabindex="-1"><p>text</p></div>`;
    const panel = document.getElementById("p")!;
    cycleFocus(panel, false);
    expect(document.activeElement).toBe(panel);
    expect(focusLost(panel)).toBe(true);
  });
});

describe("createModalFocus", () => {
  it("answers Escape on <body> only for the topmost overlay", () => {
    document.body.innerHTML = `<div id="l1"><div id="p1"></div></div><div id="l2"><div id="p2"></div></div>`;
    const dismissed: string[] = [];
    const make = (n: string) =>
      createModalFocus({
        layer: () => document.getElementById(`l${n}`),
        panel: () => document.getElementById(`p${n}`),
        dismissible: () => true,
        dismiss: () => dismissed.push(n),
      });
    const first = make("1");
    const second = make("2");
    expect(first.activate()).toBe(true);
    expect(first.activate()).toBe(false);
    first.ready();
    second.activate();
    second.ready();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dismissed).toEqual(["2"]);
    second.deactivate();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dismissed).toEqual(["2", "1"]);
    expect(first.deactivate()).toBe(true);
    expect(first.ready()).toBe(false);
  });
});
