"use client";

import {
  createElement,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  type ElementType,
  type ReactElement,
} from "react";

import {
  createScrollArea,
  type ScrollArea,
  type ScrollAreaOrientation,
} from "@surface-one/core";

import { cx, flag, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";

export interface SoneScrollAreaOwnProps {
  readonly orientation?: ScrollAreaOrientation;
  /** Fade the content out at the edges where more of it is hidden. */
  readonly fade?: boolean;
}

/**
 * `<SoneScrollArea>` — the React twin of `[soneScrollArea]`: a scroll container with
 * thin, token-coloured scrollbars that keeps the browser's own scrolling (no emulated
 * scrollbar). Give it a height (a width for `horizontal`); `orientation` picks the axes.
 * While it overflows it is a keyboard stop (`tabIndex={0}`, unless you set one), a named
 * one (`aria-label`) is a `region`, and `fade` softens the edges where content is hidden.
 */
export function SoneScrollArea<E extends ElementType = "div">({
  as,
  orientation = "vertical",
  fade = false,
  className,
  ref,
  ...rest
}: PolymorphicProps<E, SoneScrollAreaOwnProps>): ReactElement {
  const el = useRef<HTMLElement | null>(null);
  const area = useRef<ScrollArea | null>(null);
  const live = useRef(orientation);
  useLayoutEffect(() => {
    live.current = orientation;
  });
  useEffect(() => {
    if (!el.current) return;
    const created = createScrollArea(el.current, () => live.current);
    area.current = created;
    return () => {
      created.disconnect();
      area.current = null;
    };
  }, []);
  useEffect(() => area.current?.update(), [orientation]);
  const rootRef = useMemo(() => mergeRefs(el, ref as never), [ref]);
  return createElement(as ?? "div", {
    ...rest,
    ref: rootRef,
    className: cx("scroll-area", className as string | undefined),
    "data-slot": "scroll-area",
    "data-orientation": orientation,
    "data-fade": flag(fade),
  });
}
