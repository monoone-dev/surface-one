"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent as ReactFocusEvent,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
} from "react";

import {
  createCarousel,
  type Carousel,
  type CarouselOrientation,
  type ShellIcon,
} from "@surface-one/core";

import { useControllable } from "@surface-one/core/react/controllable";
import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";
import { SoneIcon } from "../icon/icon";

type ButtonVariant =
  "default" | "secondary" | "outline" | "ghost" | "destructive" | "link";
type ButtonSize =
  "xs" | "sm" | "default" | "lg" | "icon-xs" | "icon-sm" | "icon" | "icon-lg";

interface CarouselContext {
  readonly index: number;
  readonly orientation: CarouselOrientation;
  readonly slides: readonly HTMLElement[];
  readonly trackId: string;
  readonly controller: Carousel;
  readonly playing: boolean;
  readonly canPrev: boolean;
  readonly canNext: boolean;
  readonly slideRoleDescription: string | null;
  readonly track: (el: HTMLElement | null) => void;
  register(el: HTMLElement): () => void;
}

const CAROUSEL = createContext<CarouselContext | null>(null);

function useCarousel(part: string): CarouselContext {
  const context = useContext(CAROUSEL);
  if (!context) throw new Error(`${part} needs a SoneCarousel`);
  return context;
}

export interface SoneCarouselProps extends HTMLAttributes<HTMLElement> {
  /** The current slide (controlled), with `onIndexChange`; or `defaultIndex`. */
  readonly index?: number;
  readonly defaultIndex?: number;
  readonly onIndexChange?: (index: number) => void;
  readonly orientation?: CarouselOrientation;
  /** Wrap from the last slide to the first and back. */
  readonly loop?: boolean;
  /** ms between automatic steps; 0 (the default) never moves on its own. */
  readonly autoplay?: number;
  /** The region's role description (default: the `carousel` message). */
  readonly roleDescription?: string | null;
  /** Each slide's role description (default: the `carouselSlide` message). */
  readonly slideRoleDescription?: string | null;
  readonly stopLabel?: string | null;
  readonly startLabel?: string | null;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<SoneCarousel>` — the React twin of `sone-carousel`: a dependency-free carousel
 * (WAI-ARIA carousel pattern) whose slides sit in a CSS scroll-snap track.
 * `SoneCarouselPrevious` / `SoneCarouselNext`, `SoneCarouselDots` and the arrow keys
 * step it, `index` / `defaultIndex` / `onIndexChange` is the current slide and `loop`
 * wraps at the ends. Nothing moves on its own unless `autoplay` (ms) is set: it then
 * holds on hover and focus, starts stopped under reduced motion and shows a rotation
 * control. Name it with `aria-label`.
 */
export function SoneCarousel({
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  orientation = "horizontal",
  loop = false,
  autoplay = 0,
  roleDescription = null,
  slideRoleDescription = null,
  stopLabel = null,
  startLabel = null,
  className,
  children,
  onKeyDown,
  onPointerEnter,
  onPointerLeave,
  onFocus,
  onBlur,
  ref,
  ...rest
}: SoneCarouselProps): ReactElement {
  const m = useSoneMessages();
  const [index, setIndex] = useControllable(
    indexProp,
    defaultIndex,
    onIndexChange,
  );
  const [slides, setSlides] = useState<readonly HTMLElement[]>([]);
  const [version, bump] = useReducer((v: number) => v + 1, 0);
  const root = useRef<HTMLElement | null>(null);
  const trackEl = useRef<HTMLElement | null>(null);
  const trackId = `sone-carousel-${useId()}-content`;
  const live = useRef({ index, setIndex, slides, loop, orientation, autoplay });
  useInsertionEffect(() => {
    live.current = { index, setIndex, slides, loop, orientation, autoplay };
  });
  const [controller] = useState(() =>
    createCarousel({
      index: () => live.current.index,
      setIndex: (i) => {
        live.current.index = i;
        live.current.setIndex(i);
      },
      count: () => live.current.slides.length,
      loop: () => live.current.loop,
      orientation: () => live.current.orientation,
      autoplay: () => live.current.autoplay,
      track: () => trackEl.current,
      slides: () => live.current.slides,
      changed: bump,
    }),
  );
  useEffect(() => controller.connect(), [controller]);
  useEffect(() => controller.sync(), [controller, index, autoplay, slides]);

  const register = useCallback((el: HTMLElement) => {
    setSlides((list) =>
      [...list, el].sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING
          ? -1
          : 1,
      ),
    );
    return () => setSlides((list) => list.filter((s) => s !== el));
  }, []);
  const track = useCallback((el: HTMLElement | null) => {
    trackEl.current = el;
  }, []);

  void version;
  const playing = controller.playing();
  const stopped = controller.stopped();
  const canPrev = controller.canPrev();
  const canNext = controller.canNext();
  const context = useMemo<CarouselContext>(
    () => ({
      index,
      orientation,
      slides,
      trackId,
      controller,
      playing,
      slideRoleDescription,
      track,
      register,
      canPrev,
      canNext,
    }),
    [
      index,
      orientation,
      slides,
      trackId,
      controller,
      playing,
      slideRoleDescription,
      track,
      register,
      canPrev,
      canNext,
    ],
  );
  const rootRef = useMemo(() => mergeRefs(root, ref), [ref]);

  return (
    <CAROUSEL.Provider value={context}>
      {createElement(
        "sone-carousel",
        {
          ...rest,
          ref: rootRef,
          className: cx("carousel", className),
          "data-slot": "carousel",
          role: "region",
          "aria-roledescription": roleDescription ?? m.carousel,
          "data-orientation": orientation,
          onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => {
            onKeyDown?.(e);
            controller.keyDown(e);
          },
          onPointerEnter: (e: ReactPointerEvent<HTMLElement>) => {
            onPointerEnter?.(e);
            if (e.pointerType !== "touch") controller.hover(true);
          },
          onPointerLeave: (e: ReactPointerEvent<HTMLElement>) => {
            onPointerLeave?.(e);
            if (e.pointerType !== "touch") controller.hover(false);
          },
          // React's focus and blur bubble, like focusin and focusout.
          onFocus: (e: ReactFocusEvent<HTMLElement>) => {
            onFocus?.(e);
            const target = e.target as Element | null;
            controller.focus(
              !target?.closest('[data-slot="carousel-rotation"]'),
            );
          },
          onBlur: (e: ReactFocusEvent<HTMLElement>) => {
            onBlur?.(e);
            const next = e.relatedTarget as Node | null;
            if (!next || !root.current?.contains(next)) controller.focus(false);
          },
        },
        autoplay > 0 ? (
          <button
            type="button"
            className="btn carousel-rotation"
            data-slot="carousel-rotation"
            data-variant="outline"
            data-size="icon-sm"
            aria-label={
              stopped
                ? (startLabel ?? m.carouselStart)
                : (stopLabel ?? m.carouselStop)
            }
            aria-controls={trackId}
            onClick={() => controller.toggleRotation()}
          >
            <SoneIcon icon={stopped ? "play" : "pause"} />
          </button>
        ) : null,
        children,
      )}
    </CAROUSEL.Provider>
  );
}

/** `[soneCarouselContent]` — the scroll-snap track of the slides: focusable, a polite live region while nothing rotates. */
export function SoneCarouselContent({
  className,
  onScroll,
  ref,
  ...rest
}: ComponentPropsWithRef<"div">): ReactElement {
  const c = useCarousel("SoneCarouselContent");
  const trackRef = useMemo(() => mergeRefs(c.track, ref), [c.track, ref]);
  return (
    <div
      tabIndex={0}
      {...rest}
      ref={trackRef}
      className={cx("carousel-content", className)}
      data-slot="carousel-content"
      id={c.trackId}
      data-orientation={c.orientation}
      aria-live={c.playing ? "off" : "polite"}
      onScroll={(e: UIEvent<HTMLDivElement>) => {
        onScroll?.(e);
        c.controller.scrolled();
      }}
    />
  );
}

/** `[soneCarouselItem]` — one slide: a `group` with `aria-roledescription="slide"`, named "N of M". */
export function SoneCarouselItem({
  className,
  ref,
  ...rest
}: ComponentPropsWithRef<"div">): ReactElement {
  const c = useCarousel("SoneCarouselItem");
  const m = useSoneMessages();
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const { register } = c;
  useLayoutEffect(() => (el ? register(el) : undefined), [el, register]);
  const itemRef = useMemo(() => mergeRefs(setEl, ref), [ref]);
  const at = el ? c.slides.indexOf(el) : -1;
  return (
    <div
      aria-label={
        at >= 0 ? m.carouselSlidePosition(at + 1, c.slides.length) : undefined
      }
      {...rest}
      ref={itemRef}
      className={cx("carousel-item", className)}
      data-slot="carousel-item"
      role="group"
      aria-roledescription={c.slideRoleDescription ?? m.carouselSlide}
      data-current={at >= 0 && at === c.index ? "" : undefined}
    />
  );
}

export interface SoneCarouselStepProps extends ComponentPropsWithRef<"button"> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

function step(
  name: string,
  dir: "previous" | "next",
  icons: readonly [ShellIcon, ShellIcon],
) {
  function Step({
    variant = "outline",
    size = "icon-sm",
    className,
    children,
    onClick,
    ...rest
  }: SoneCarouselStepProps): ReactElement {
    const c = useCarousel(name);
    const m = useSoneMessages();
    const can = dir === "previous" ? c.canPrev : c.canNext;
    return (
      <button
        type="button"
        aria-label={dir === "previous" ? m.carouselPrevious : m.carouselNext}
        {...rest}
        className={cx("btn", `carousel-${dir}`, className)}
        data-slot={`carousel-${dir}`}
        data-variant={variant}
        data-size={size}
        aria-controls={c.trackId}
        disabled={!can}
        onClick={(e) => {
          onClick?.(e);
          if (dir === "previous") c.controller.prev();
          else c.controller.next();
        }}
      >
        <SoneIcon icon={c.orientation === "vertical" ? icons[1] : icons[0]} />
        {children}
      </button>
    );
  }
  Step.displayName = name;
  return Step;
}

/** `button[soneCarouselPrevious]` — steps back one slide; disabled on the first unless `loop`. */
export const SoneCarouselPrevious = step("SoneCarouselPrevious", "previous", [
  "chevron-left",
  "chevron-up",
]);

/** `button[soneCarouselNext]` — steps on one slide; disabled on the last unless `loop`. */
export const SoneCarouselNext = step("SoneCarouselNext", "next", [
  "chevron-right",
  "chevron-down",
]);

/** `<sone-carousel-dots>` — one button per slide; the current one is `aria-current`. */
export function SoneCarouselDots({
  className,
  ...rest
}: HTMLAttributes<HTMLElement> & {
  readonly ref?: Ref<HTMLElement>;
}): ReactElement {
  const c = useCarousel("SoneCarouselDots");
  const m = useSoneMessages();
  return createElement(
    "sone-carousel-dots",
    {
      "aria-label": m.carouselDots,
      ...rest,
      className: cx("carousel-dots", className),
      "data-slot": "carousel-dots",
      role: "group",
    },
    c.slides.map((_, i) => (
      <button
        key={i}
        type="button"
        className="carousel-dot"
        data-slot="carousel-dot"
        aria-label={m.carouselGoTo(i + 1)}
        aria-controls={c.trackId}
        aria-current={i === c.index ? "true" : undefined}
        onClick={() => c.controller.goTo(i)}
      />
    )),
  );
}
