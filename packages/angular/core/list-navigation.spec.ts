// Pure keyboard-navigation tests, run in plain Node (node:test):
// node --import ./scripts/node-ts-resolve.mjs --test packages/angular/core/list-navigation.spec.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import { listNavigationIndex, rovingFocusTarget } from "./list-navigation";

test("a vertical list (the default) answers Up / Down, Home / End and paging", () => {
  assert.equal(listNavigationIndex("ArrowDown", 0, 5), 1);
  assert.equal(listNavigationIndex("ArrowDown", 4, 5), 0);
  assert.equal(listNavigationIndex("ArrowUp", 0, 5), 4);
  assert.equal(listNavigationIndex("ArrowDown", -1, 5), 0);
  assert.equal(listNavigationIndex("ArrowUp", -1, 5), 4);
  assert.equal(listNavigationIndex("Home", 3, 5), 0);
  assert.equal(listNavigationIndex("End", 1, 5), 4);
  assert.equal(listNavigationIndex("PageDown", 0, 30), 10);
  assert.equal(listNavigationIndex("PageUp", 25, 30), 15);
  assert.equal(listNavigationIndex("ArrowRight", 0, 5), null);
  assert.equal(listNavigationIndex("ArrowDown", 0, 0), null);
});

test("wrap: false stops at the ends", () => {
  assert.equal(listNavigationIndex("ArrowDown", 4, 5, { wrap: false }), 4);
  assert.equal(listNavigationIndex("ArrowUp", 0, 5, { wrap: false }), 0);
});

test("a horizontal list answers Left / Right, not Up / Down or paging", () => {
  const h = { orientation: "horizontal" } as const;
  assert.equal(listNavigationIndex("ArrowRight", 1, 3, h), 2);
  assert.equal(listNavigationIndex("ArrowLeft", 1, 3, h), 0);
  assert.equal(listNavigationIndex("ArrowRight", 2, 3, h), 0);
  assert.equal(listNavigationIndex("ArrowDown", 1, 3, h), null);
  assert.equal(listNavigationIndex("PageDown", 1, 3, h), null);
  assert.equal(
    listNavigationIndex("PageDown", 1, 30, { ...h, paging: true }),
    11,
  );
});

test("right-to-left flips Left and Right", () => {
  const rtl = { orientation: "horizontal", rtl: true } as const;
  assert.equal(listNavigationIndex("ArrowLeft", 1, 3, rtl), 2);
  assert.equal(listNavigationIndex("ArrowRight", 1, 3, rtl), 0);
  // A vertical list ignores the direction.
  assert.equal(listNavigationIndex("ArrowDown", 1, 3, { rtl: true }), 2);
});

test("both: Down and Right move on, Up and Left move back", () => {
  const both = { orientation: "both" } as const;
  assert.equal(listNavigationIndex("ArrowDown", 0, 3, both), 1);
  assert.equal(listNavigationIndex("ArrowRight", 0, 3, both), 1);
  assert.equal(listNavigationIndex("ArrowUp", 0, 3, both), 2);
  assert.equal(listNavigationIndex("ArrowLeft", 0, 3, both), 2);
  assert.equal(listNavigationIndex("PageDown", 0, 3, both), null);
});

test("rovingFocusTarget prevents the default only when it moves", () => {
  let prevented = 0;
  const event = (key: string) => ({
    key,
    preventDefault: () => void prevented++,
  });
  const items = ["a", "b", "c"];
  const h = { orientation: "horizontal" } as const;
  assert.equal(rovingFocusTarget(event("ArrowRight"), items, 0, h), "b");
  assert.equal(prevented, 1);
  assert.equal(rovingFocusTarget(event("ArrowDown"), items, 0, h), null);
  assert.equal(rovingFocusTarget(event("x"), items, 0, h), null);
  assert.equal(rovingFocusTarget(event("End"), [], 0, h), null);
  assert.equal(prevented, 1);
});
