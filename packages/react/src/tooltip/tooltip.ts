"use client";

import {
  cloneElement,
  isValidElement,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactElement,
  type Ref,
  type RefCallback,
} from "react";

import { mergeRefs } from "../utils/refs";

const SHOW_DELAY_MS = 350;
const OFFSET_PX = 8;
const MARGIN_PX = 8;
const ARROW_INSET_PX = 12;

export type TooltipSide = "top" | "right" | "bottom" | "left";
export type TooltipAlign = "start" | "center" | "end";

export interface TooltipOptions {
  readonly text?: string;
  readonly side?: TooltipSide;
  readonly align?: TooltipAlign;
  readonly arrow?: boolean;
  readonly disabled?: boolean;
  readonly showDelay?: number;
}

/** The tooltip text, or an options object. */
export type TooltipValue = string | TooltipOptions | null | undefined;

const OPPOSITE: Record<TooltipSide, TooltipSide> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

interface TooltipState {
  options: Required<TooltipOptions>;
  bubble: HTMLDivElement | null;
  timer: ReturnType<typeof setTimeout> | null;
}

function resolveOptions(
  value: TooltipValue,
  side?: TooltipSide,
): Required<TooltipOptions> {
  const v = typeof value === "string" ? { text: value } : (value ?? {});
  return {
    text: v.text ?? "",
    side: v.side ?? side ?? "bottom",
    align: v.align ?? "center",
    arrow: v.arrow ?? true,
    disabled: v.disabled ?? false,
    showDelay: v.showDelay ?? SHOW_DELAY_MS,
  };
}

function clearTimer(state: TooltipState): void {
  if (state.timer !== null) {
    clearTimeout(state.timer);
    state.timer = null;
  }
}

function hide(state: TooltipState): void {
  clearTimer(state);
  state.bubble?.remove();
  state.bubble = null;
}

/** The bound text, else the host's native `title` (moved aside so two tooltips never show). */
function resolveText(el: HTMLElement, state: TooltipState): string {
  const bound = state.options.text.trim();
  if (bound) return bound;
  const title = el.getAttribute("title")?.trim() ?? "";
  if (title) {
    el.removeAttribute("title");
    el.dataset["tooltip"] = title;
  }
  return title || (el.dataset["tooltip"] ?? "");
}

function place(
  el: HTMLElement,
  state: TooltipState,
  bubble: HTMLDivElement,
): void {
  const anchor = el.getBoundingClientRect();
  const box = { width: bubble.offsetWidth, height: bubble.offsetHeight };
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const fits = (side: TooltipSide): boolean => {
    switch (side) {
      case "top":
        return anchor.top - OFFSET_PX - box.height >= MARGIN_PX;
      case "bottom":
        return anchor.bottom + OFFSET_PX + box.height <= vh - MARGIN_PX;
      case "left":
        return anchor.left - OFFSET_PX - box.width >= MARGIN_PX;
      case "right":
        return anchor.right + OFFSET_PX + box.width <= vw - MARGIN_PX;
    }
  };
  const preferred = state.options.side;
  const side =
    fits(preferred) || !fits(OPPOSITE[preferred])
      ? preferred
      : OPPOSITE[preferred];
  const vertical = side === "top" || side === "bottom";
  const align = state.options.align;

  let top: number;
  let left: number;
  if (vertical) {
    top =
      side === "bottom"
        ? anchor.bottom + OFFSET_PX
        : anchor.top - OFFSET_PX - box.height;
    left =
      align === "start"
        ? anchor.left
        : align === "end"
          ? anchor.right - box.width
          : anchor.left + anchor.width / 2 - box.width / 2;
  } else {
    left =
      side === "right"
        ? anchor.right + OFFSET_PX
        : anchor.left - OFFSET_PX - box.width;
    top =
      align === "start"
        ? anchor.top
        : align === "end"
          ? anchor.bottom - box.height
          : anchor.top + anchor.height / 2 - box.height / 2;
  }
  left = Math.max(MARGIN_PX, Math.min(left, vw - box.width - MARGIN_PX));
  top = Math.max(MARGIN_PX, Math.min(top, vh - box.height - MARGIN_PX));

  bubble.dataset["side"] = side;
  bubble.dataset["align"] = align;
  bubble.style.top = `${Math.round(top)}px`;
  bubble.style.left = `${Math.round(left)}px`;

  const span = vertical ? box.width : box.height;
  const target = vertical
    ? anchor.left + anchor.width / 2 - left
    : anchor.top + anchor.height / 2 - top;
  const lo = Math.min(ARROW_INSET_PX, span / 2);
  const arrowAt = Math.max(lo, Math.min(target, span - lo));
  bubble.style.setProperty(
    "--sone-tooltip-arrow-at",
    `${Math.round(arrowAt)}px`,
  );
}

function show(
  el: HTMLElement,
  state: TooltipState,
  text: string,
  delay: number,
): void {
  state.timer = null;
  if (!el.isConnected) return;
  hide(state);
  const bubble = document.createElement("div");
  bubble.className = "sone-tooltip";
  bubble.setAttribute("aria-hidden", "true");
  bubble.dataset["slot"] = "tooltip-content";
  bubble.dataset["state"] = delay > 0 ? "delayed-open" : "instant-open";
  if (state.options.arrow) bubble.dataset["arrow"] = "";
  bubble.textContent = text;
  bubble.dataset["side"] = state.options.side;
  document.body.appendChild(bubble);
  state.bubble = bubble;
  place(el, state, bubble);
}

function schedule(el: HTMLElement, state: TooltipState): void {
  const text = resolveText(el, state);
  if (!text || state.options.disabled) {
    hide(state);
    return;
  }
  clearTimer(state);
  const delay = Number.isFinite(state.options.showDelay)
    ? Math.max(0, state.options.showDelay)
    : SHOW_DELAY_MS;
  state.timer = setTimeout(() => show(el, state, text, delay), delay);
}

/**
 * Attaches a tooltip to an element and returns the cleanup; `read()` is called on every
 * hover / focus, so the latest options always apply.
 */
export function attachSoneTooltip(
  el: HTMLElement,
  read: () => Required<TooltipOptions>,
): () => void {
  const state: TooltipState = { options: read(), bubble: null, timer: null };
  const enter = (): void => {
    state.options = read();
    schedule(el, state);
  };
  const leave = (): void => hide(state);
  const onDocumentKeydown = (e: KeyboardEvent): void => {
    if (e.key === "Escape" && (state.bubble || state.timer !== null))
      hide(state);
  };
  const listeners: [string, () => void][] = [
    ["mouseenter", enter],
    ["focusin", enter],
    ["mouseleave", leave],
    ["focusout", leave],
    ["click", leave],
  ];
  for (const [type, fn] of listeners) el.addEventListener(type, fn);
  document.addEventListener("keydown", onDocumentKeydown);
  return () => {
    hide(state);
    for (const [type, fn] of listeners) el.removeEventListener(type, fn);
    document.removeEventListener("keydown", onDocumentKeydown);
  };
}

/**
 * `useSoneTooltip("Copy")` — the React twin of `[soneTooltip]` / `v-sone-tooltip`: a
 * short label on hover and focus, placed on the preferred side (flipped when it does
 * not fit). Put the returned ref on the element. The bubble is `aria-hidden`: the
 * control keeps naming itself as it already did, or a screen reader would announce the
 * name twice. Nothing renders on the server.
 */
export function useSoneTooltip<T extends HTMLElement = HTMLElement>(
  value: TooltipValue,
  side?: TooltipSide,
): RefCallback<T> {
  const options = useRef(resolveOptions(value, side));
  useLayoutEffect(() => {
    options.current = resolveOptions(value, side);
  });
  return useCallback(
    (el: T | null) => (el ? attachSoneTooltip(el, () => options.current) : undefined),
    [],
  );
}

export interface SoneTooltipProps extends TooltipOptions {
  /** One element that accepts a `ref` (a native element or a component that passes it on). */
  readonly children: ReactElement;
}

/** `<SoneTooltip text="Copy"><button …/></SoneTooltip>` — the component form of `useSoneTooltip`. */
export function SoneTooltip({ children, ...options }: SoneTooltipProps) {
  const ref = useSoneTooltip(options);
  const childRef = isValidElement<{ ref?: Ref<HTMLElement> }>(children)
    ? children.props.ref
    : undefined;
  const merged = useMemo(() => mergeRefs(ref, childRef), [ref, childRef]);
  if (!isValidElement(children)) return children;
  return cloneElement(children as ReactElement<{ ref?: Ref<HTMLElement> }>, {
    ref: merged,
  });
}
