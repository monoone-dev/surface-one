// The carousel, with no framework in it: the Angular `sone-carousel`, the Vue and React
// `SoneCarousel` (through @surface-one/core) share it. The slides sit in a CSS
// scroll-snap track, so touch, trackpad and wheel scrolling are the browser's own; this
// keeps the index in step with the scroll, steps it from the buttons, the dots and the
// arrow keys, and runs the optional auto-rotation the WAI-ARIA carousel pattern allows.

export type CarouselOrientation = "horizontal" | "vertical";

/** The slide `delta` away from `index`: wrapped when `loop`, else clamped to `[0, last]`. */
export function carouselStep(
  index: number,
  last: number,
  delta: number,
  loop: boolean,
): number {
  if (last < 0) return 0;
  const next = index + delta;
  if (next < 0) return loop ? last : 0;
  if (next > last) return loop ? 0 : last;
  return next;
}

/**
 * The scroll offset of each slide, relative to the first, clamped to the farthest the
 * track scrolls (the last slides of a track that shows several at once share it).
 * Empty when the track has no layout (hidden, or a DOM without one such as jsdom).
 */
export function carouselOffsets(
  slides: readonly number[],
  maxScroll: number,
): number[] {
  if (slides.length === 0 || maxScroll <= 0) return [];
  const first = slides[0];
  return slides.map((s) => Math.max(0, Math.min(maxScroll, s - first)));
}

/** The first slide whose offset is nearest `scroll`. */
export function carouselNearest(
  offsets: readonly number[],
  scroll: number,
): number {
  let best = 0;
  for (let i = 1; i < offsets.length; i++) {
    if (Math.abs(offsets[i] - scroll) < Math.abs(offsets[best] - scroll) - 0.5)
      best = i;
  }
  return best;
}

/**
 * The last slide a step can land on: the first one that scrolls the track to its end
 * (the slides after it are already in view), or the last slide without a layout.
 */
export function carouselLastStop(
  offsets: readonly number[],
  count: number,
): number {
  if (offsets.length === 0) return count - 1;
  const end = offsets[offsets.length - 1];
  const at = offsets.findIndex((o) => o >= end - 0.5);
  return at < 0 ? count - 1 : at;
}

/** The step an arrow key asks for along `orientation`: -1, +1, or null for any other key. */
export function carouselKeyDelta(
  key: string,
  orientation: CarouselOrientation,
): -1 | 1 | null {
  if (orientation === "vertical") {
    if (key === "ArrowUp") return -1;
    if (key === "ArrowDown") return 1;
    return null;
  }
  if (key === "ArrowLeft") return -1;
  if (key === "ArrowRight") return 1;
  return null;
}

/** What the carousel reads from, and writes back to, the component that owns it. */
export interface CarouselHost {
  /** The current slide. */
  index(): number;
  /** The carousel moved: the owner stores (and emits) the new index. */
  setIndex(index: number): void;
  /** How many slides there are. */
  count(): number;
  loop(): boolean;
  orientation(): CarouselOrientation;
  /** ms between automatic steps; 0 turns auto-rotation off. */
  autoplay(): number;
  /** The scroll-snap track (`[soneCarouselContent]`), once rendered. */
  track(): HTMLElement | null;
  /** The slides' elements, in order. */
  slides(): readonly HTMLElement[];
  /** Derived state (`playing`, the last stop) changed: the owner re-renders. */
  changed(): void;
}

/** The fields of a key event the carousel reads. */
export interface CarouselKeyEvent {
  readonly key: string;
  readonly target: EventTarget | null;
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

export interface Carousel {
  canPrev(): boolean;
  canNext(): boolean;
  /** Auto-rotation is on and running (not held by hover, focus, the user or reduced motion). */
  playing(): boolean;
  /** The rotation control's state: the user (or reduced motion) stopped the rotation. */
  stopped(): boolean;
  prev(): void;
  next(): void;
  goTo(index: number): void;
  /** Scrolls the track to the current index (after the owner changed it). */
  sync(): void;
  /** The track scrolled: the index follows once it settles. */
  scrolled(): void;
  /** A key on the carousel: the arrow keys along it step it. `true` when handled. */
  keyDown(event: CarouselKeyEvent): boolean;
  /** The pointer rests on the carousel (or left it): rotation holds meanwhile. */
  hover(on: boolean): void;
  /** Focus is inside the carousel (or left it): rotation holds meanwhile. */
  focus(on: boolean): void;
  /** The rotation control: start or stop the auto-rotation. */
  toggleRotation(): void;
  /** In the browser, once rendered: measures the track and starts the rotation. Returns the teardown. */
  connect(): () => void;
}

const TYPING = /^(INPUT|TEXTAREA|SELECT)$/;

/**
 * A carousel (WAI-ARIA carousel pattern, shadcn/ui Carousel): Previous / Next and the
 * dots step it, ArrowLeft / ArrowRight (ArrowUp / ArrowDown when vertical) step it while
 * focus is inside, and the index follows the track as it is swiped. `loop` wraps at the
 * ends. With `autoplay` it advances every `autoplay` ms, holding while the pointer rests
 * on it or focus is inside, and not at all until asked when the user prefers reduced
 * motion; the rotation control stops and restarts it.
 */
export function createCarousel(host: CarouselHost): Carousel {
  let offsets: number[] = [];
  let lastStop = -1;
  let hovered = false;
  let focused = false;
  let stoppedByUser = false;
  let reducedMotion = false;
  let connected = false;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let settle: ReturnType<typeof setTimeout> | null = null;

  const last = (): number =>
    lastStop >= 0 ? Math.min(lastStop, host.count() - 1) : host.count() - 1;
  const horizontal = (): boolean => host.orientation() !== "vertical";

  const measure = (): void => {
    const track = host.track();
    const slides = host.slides();
    if (!track) return;
    const max = horizontal()
      ? track.scrollWidth - track.clientWidth
      : track.scrollHeight - track.clientHeight;
    offsets = carouselOffsets(
      slides.map((s) => (horizontal() ? s.offsetLeft : s.offsetTop)),
      max,
    );
    const stop = carouselLastStop(offsets, slides.length);
    if (stop !== lastStop) {
      lastStop = stop;
      host.changed();
    }
  };

  const scrollTo = (index: number, smooth: boolean): void => {
    const track = host.track();
    if (!track) return;
    measure();
    if (offsets.length === 0) return;
    const to = offsets[Math.max(0, Math.min(index, offsets.length - 1))];
    const now = horizontal() ? track.scrollLeft : track.scrollTop;
    if (Math.abs(now - to) < 1) return;
    const behavior: ScrollBehavior =
      smooth && !reducedMotion ? "smooth" : "instant";
    if (typeof track.scrollTo === "function") {
      track.scrollTo(
        horizontal() ? { left: to, behavior } : { top: to, behavior },
      );
    } else if (horizontal()) {
      track.scrollLeft = to;
    } else {
      track.scrollTop = to;
    }
  };

  const go = (index: number): void => {
    const count = host.count();
    if (count === 0) return;
    const next = Math.max(0, Math.min(index, count - 1));
    if (next !== host.index()) host.setIndex(next);
    scrollTo(next, true);
    if (timer !== null) schedule();
  };

  const playing = (): boolean =>
    connected &&
    host.autoplay() > 0 &&
    host.count() > 1 &&
    !stoppedByUser &&
    !hovered &&
    !focused;

  function schedule(): void {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    if (!playing()) return;
    timer = setTimeout(() => {
      timer = null;
      go(carouselStep(host.index(), last(), 1, true));
      schedule();
    }, host.autoplay());
  }

  const holdChanged = (): void => {
    schedule();
    host.changed();
  };

  return {
    canPrev: () => host.loop() || host.index() > 0,
    canNext: () => host.loop() || host.index() < last(),
    playing,
    stopped: () => stoppedByUser,
    prev: () => go(carouselStep(host.index(), last(), -1, host.loop())),
    next: () => go(carouselStep(host.index(), last(), 1, host.loop())),
    goTo: (index) => go(index),
    sync() {
      scrollTo(host.index(), connected);
      // `autoplay` may have changed: start or stop the timer to match.
      if (connected && (timer === null) === playing()) holdChanged();
    },
    scrolled() {
      if (settle !== null) clearTimeout(settle);
      settle = setTimeout(() => {
        settle = null;
        const track = host.track();
        if (!track) return;
        measure();
        if (offsets.length === 0) return;
        const at = carouselNearest(
          offsets,
          horizontal() ? track.scrollLeft : track.scrollTop,
        );
        if (at !== host.index()) host.setIndex(at);
      }, 120);
    },
    keyDown(event) {
      if (event.defaultPrevented) return false;
      const target = event.target as HTMLElement | null;
      if (target && (TYPING.test(target.tagName) || target.isContentEditable))
        return false;
      const delta = carouselKeyDelta(event.key, host.orientation());
      if (delta === null) return false;
      event.preventDefault();
      go(carouselStep(host.index(), last(), delta, host.loop()));
      return true;
    },
    hover(on) {
      if (hovered === on) return;
      hovered = on;
      holdChanged();
    },
    focus(on) {
      if (focused === on) return;
      focused = on;
      holdChanged();
    },
    toggleRotation() {
      stoppedByUser = !stoppedByUser;
      holdChanged();
    },
    connect() {
      connected = true;
      const win = host.track()?.ownerDocument.defaultView ?? null;
      reducedMotion = !!win?.matchMedia?.("(prefers-reduced-motion: reduce)")
        .matches;
      // Reduced motion: nothing moves on its own until the user starts it.
      if (reducedMotion && host.autoplay() > 0) stoppedByUser = true;
      measure();
      scrollTo(host.index(), false);
      const track = host.track();
      const observer =
        track && win && "ResizeObserver" in win
          ? new win.ResizeObserver(() => {
              measure();
              scrollTo(host.index(), false);
            })
          : null;
      if (track) observer?.observe(track);
      holdChanged();
      return () => {
        connected = false;
        observer?.disconnect();
        if (timer !== null) clearTimeout(timer);
        if (settle !== null) clearTimeout(settle);
        timer = settle = null;
      };
    },
  };
}
