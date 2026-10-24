// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  carouselKeyDelta,
  carouselLastStop,
  carouselNearest,
  carouselOffsets,
  carouselStep,
  createCarousel,
  type CarouselHost,
} from "../src";
import * as carousel from "../src/carousel";

afterEach(() => {
  vi.useRealTimers();
});

function host(overrides: Partial<CarouselHost> = {}) {
  const state = { index: 0, changed: 0 };
  const h: CarouselHost = {
    index: () => state.index,
    setIndex: (i) => (state.index = i),
    count: () => 4,
    loop: () => false,
    orientation: () => "horizontal",
    autoplay: () => 0,
    track: () => null,
    slides: () => [],
    changed: () => state.changed++,
    ...overrides,
  };
  return { h, state };
}

const keyEvent = (key: string) => {
  const event = {
    key,
    target: null,
    defaultPrevented: false,
    preventDefault() {
      event.defaultPrevented = true;
    },
  };
  return event;
};

describe("the carousel helpers", () => {
  it("are in the module React Native imports", () => {
    expect(carousel.carouselStep).toBe(carouselStep);
  });

  it("step within the slides, wrapping only when looping", () => {
    expect(carouselStep(0, 3, -1, false)).toBe(0);
    expect(carouselStep(0, 3, -1, true)).toBe(3);
    expect(carouselStep(3, 3, 1, false)).toBe(3);
    expect(carouselStep(3, 3, 1, true)).toBe(0);
    expect(carouselStep(1, 3, 1, false)).toBe(2);
    expect(carouselStep(0, -1, 1, true)).toBe(0);
  });

  it("measure the slides from the first and clamp them to the end of the track", () => {
    expect(carouselOffsets([10, 110, 210, 310], 200)).toEqual([
      0, 100, 200, 200,
    ]);
    expect(carouselOffsets([0, 0, 0], 0)).toEqual([]);
    expect(carouselLastStop([0, 100, 200, 200], 4)).toBe(2);
    expect(carouselLastStop([], 4)).toBe(3);
  });

  it("find the slide nearest the scroll position", () => {
    expect(carouselNearest([0, 100, 200], 40)).toBe(0);
    expect(carouselNearest([0, 100, 200], 60)).toBe(1);
    expect(carouselNearest([0, 100, 200, 200], 200)).toBe(2);
  });

  it("read the arrow keys along the orientation", () => {
    expect(carouselKeyDelta("ArrowRight", "horizontal")).toBe(1);
    expect(carouselKeyDelta("ArrowLeft", "horizontal")).toBe(-1);
    expect(carouselKeyDelta("ArrowDown", "horizontal")).toBeNull();
    expect(carouselKeyDelta("ArrowDown", "vertical")).toBe(1);
    expect(carouselKeyDelta("ArrowUp", "vertical")).toBe(-1);
  });
});

describe("createCarousel", () => {
  it("steps with the buttons and the keys and stops at the ends", () => {
    const { h, state } = host();
    const c = createCarousel(h);
    expect(c.canPrev()).toBe(false);
    c.next();
    c.next();
    c.next();
    c.next();
    expect(state.index).toBe(3);
    expect(c.canNext()).toBe(false);
    const left = keyEvent("ArrowLeft");
    expect(c.keyDown(left)).toBe(true);
    expect(left.defaultPrevented).toBe(true);
    expect(state.index).toBe(2);
    expect(c.keyDown(keyEvent("Enter"))).toBe(false);
    c.goTo(9);
    expect(state.index).toBe(3);
  });

  it("wraps when looping", () => {
    const { h, state } = host({ loop: () => true });
    const c = createCarousel(h);
    expect(c.canPrev()).toBe(true);
    c.prev();
    expect(state.index).toBe(3);
    c.next();
    expect(state.index).toBe(0);
  });

  it("rotates on its own only while nothing holds it", () => {
    vi.useFakeTimers();
    const { h, state } = host({ autoplay: () => 1000 });
    const c = createCarousel(h);
    const disconnect = c.connect();
    expect(c.playing()).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(state.index).toBe(1);
    c.hover(true);
    expect(c.playing()).toBe(false);
    vi.advanceTimersByTime(3000);
    expect(state.index).toBe(1);
    c.hover(false);
    vi.advanceTimersByTime(1000);
    expect(state.index).toBe(2);
    c.focus(true);
    vi.advanceTimersByTime(3000);
    expect(state.index).toBe(2);
    c.focus(false);
    c.toggleRotation();
    expect(c.stopped()).toBe(true);
    vi.advanceTimersByTime(3000);
    expect(state.index).toBe(2);
    c.toggleRotation();
    vi.advanceTimersByTime(2000);
    // It wraps past the last slide even without loop.
    expect(state.index).toBe(0);
    disconnect();
    vi.advanceTimersByTime(3000);
    expect(state.index).toBe(0);
  });

  it("never rotates without autoplay", () => {
    vi.useFakeTimers();
    const { h, state } = host();
    const c = createCarousel(h);
    c.connect();
    expect(c.playing()).toBe(false);
    vi.advanceTimersByTime(10000);
    expect(state.index).toBe(0);
  });
});
