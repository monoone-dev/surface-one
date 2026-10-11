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

import {
  attachSoneTooltip,
  resolveTooltipOptions as resolveOptions,
  type TooltipOptions,
  type TooltipSide,
  type TooltipValue,
} from "@surface-one/core";

import { mergeRefs } from "../utils/refs";

export {
  attachSoneTooltip,
  type TooltipAlign,
  type TooltipOptions,
  type TooltipSide,
  type TooltipValue,
} from "@surface-one/core";

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
    (el: T | null) =>
      el ? attachSoneTooltip(el, () => options.current) : undefined,
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
