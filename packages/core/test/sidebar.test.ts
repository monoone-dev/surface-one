import { afterEach, describe, expect, it } from "vitest";

import {
  SONE_SIDEBAR_DEFAULT_CONFIG as CONFIG,
  createSidebarActions,
  createSidebarRail,
  type SidebarRailTarget,
  type SidebarStore,
} from "../src/sidebar";

const OPEN_KEY = CONFIG.openStorageKey!;
const WIDTH_KEY = CONFIG.widthStorageKey!;

afterEach(() => localStorage.clear());

const setup = () => {
  const store: SidebarStore = { open: true, dragged: null, resizing: false };
  return { store, actions: createSidebarActions(CONFIG, store) };
};

describe("createSidebarActions", () => {
  it("clamps and stores the width, but not while a drag is in progress", () => {
    const { store, actions } = setup();
    actions.setWidth(1000);
    expect(store.dragged).toBe(CONFIG.maxWidth);
    expect(localStorage.getItem(WIDTH_KEY)).toBe(String(CONFIG.maxWidth));
    actions.setResizing(true);
    actions.setWidth(300.4);
    expect(store.dragged).toBe(300);
    expect(localStorage.getItem(WIDTH_KEY)).toBe(String(CONFIG.maxWidth));
    actions.setResizing(false);
    expect(localStorage.getItem(WIDTH_KEY)).toBe("300");
    actions.resetWidth();
    expect(store.dragged).toBeNull();
    expect(localStorage.getItem(WIDTH_KEY)).toBeNull();
  });

  it("toggles and restores the stored state (nothing is read before restore)", () => {
    localStorage.setItem(OPEN_KEY, "false");
    localStorage.setItem(WIDTH_KEY, "10");
    const { store, actions } = setup();
    expect(store.open).toBe(true);
    actions.restore();
    expect(store.open).toBe(false);
    expect(store.dragged).toBe(CONFIG.minWidth);
    actions.toggleSidebar();
    expect(store.open).toBe(true);
    expect(localStorage.getItem(OPEN_KEY)).toBe("true");
  });
});

describe("createSidebarRail", () => {
  const target = (): SidebarRailTarget & { log: string[] } => {
    const log: string[] = [];
    return {
      log,
      open: true,
      width: 256,
      minWidth: 200,
      maxWidth: 480,
      setResizing: (r) => log.push(`resizing ${r}`),
      setWidth: (w) => log.push(`width ${w}`),
      resetWidth: () => log.push("reset"),
      toggleSidebar: () => log.push("toggle"),
    };
  };
  const pointer = (clientX: number, button = 0) => ({
    button,
    pointerId: 1,
    clientX,
    currentTarget: null,
    preventDefault() {},
  });
  const key = (k: string, shiftKey = false) => ({
    key: k,
    shiftKey,
    preventDefault() {},
  });

  it("drags past the threshold and swallows the click that ends the drag", () => {
    const t = target();
    const rail = createSidebarRail(() => t);
    rail.pointerDown(pointer(100));
    rail.pointerMove(pointer(102));
    rail.pointerMove(pointer(140));
    rail.pointerEnd(pointer(140));
    rail.click({ altKey: false });
    rail.click({ altKey: false });
    expect(t.log).toEqual([
      "resizing true",
      "width 296",
      "resizing false",
      "toggle",
    ]);
  });

  it("steps with the arrows (Shift ×4), jumps with Home / End and resets with Enter or ⌥-click", () => {
    const t = target();
    const rail = createSidebarRail(() => t);
    rail.keyDown(key("ArrowRight"));
    rail.keyDown(key("ArrowLeft", true));
    rail.keyDown(key("Home"));
    rail.keyDown(key("End"));
    rail.keyDown(key("Enter"));
    rail.click({ altKey: true });
    expect(t.log).toEqual([
      "width 272",
      "width 192",
      "width 200",
      "width 480",
      "reset",
      "reset",
    ]);
  });
});
