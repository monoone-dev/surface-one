"use client";

import {
  createElement,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { columnCount } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { definePart, flag, type PolymorphicProps } from "../../utils/part";

export type SoneStatGroupLayout = "grid" | "inline";
export type SoneStatVariant = "card" | "inset" | "plain";
export type SoneStatSize = "sm" | "md" | "lg";
export type SoneStatLabelPosition = "top" | "bottom";

export type SoneStatAlign = "start" | "center";
export type SoneStatTrendTone = "auto" | "positive" | "negative" | "neutral";

export interface SoneStatGroupOwnProps {
  readonly layout?: SoneStatGroupLayout;
  /** A fixed column count (grid layout); default: as many as fit. */
  readonly columns?: number | null;
  readonly separated?: boolean;
}

/** `<dl data-slot="stat-group">` — a grid or inline row of key figures. */
export function SoneStatGroup<E extends ElementType = "dl">({
  as,
  layout = "grid",
  columns = null,
  separated = false,
  style,
  ...rest
}: PolymorphicProps<E, SoneStatGroupOwnProps>): ReactElement {
  const cols = columnCount(columns);
  return createElement(as ?? "dl", {
    "data-slot": "stat-group",
    "data-layout": layout,
    "data-columns": cols,
    "data-separated": flag(separated),
    ...rest,
    style:
      cols === undefined
        ? style
        : ({ "--stat-columns": cols, ...style } as CSSProperties),
  });
}

export interface SoneStatOwnProps {
  readonly variant?: SoneStatVariant;
  readonly size?: SoneStatSize;
  readonly labelPosition?: SoneStatLabelPosition;
  /** `center` centres the label, value and hint (a hero figure). */
  readonly align?: SoneStatAlign;
}

/** One figure: label, value and optional hint / trend. */
export const SoneStat = definePart<"div", SoneStatOwnProps>({
  name: "SoneStat",
  tag: "div",
  slot: "stat",
  props: ["variant", "size", "labelPosition", "align"],
  attrs: (p) => ({
    "data-variant": p.variant ?? "card",
    "data-size": p.size ?? "md",
    "data-label-position": p.labelPosition ?? "top",
    "data-align": p.align === "center" ? "center" : undefined,
  }),
});

export const SoneStatLabel = definePart({
  name: "SoneStatLabel",
  tag: "dt",
  slot: "stat-label",
});

export const SoneStatValue = definePart({
  name: "SoneStatValue",
  tag: "dd",
  slot: "stat-value",
});

export const SoneStatHint = definePart({
  name: "SoneStatHint",
  tag: "dd",
  slot: "stat-hint",
});

const GLYPH = {
  up: "M6 2.5 10 8H2z",
  down: "M6 9.5 2 4h8z",
  flat: "M2 5.25h8v1.5H2z",
};

export interface SoneStatTrendProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
  /** The change; its sign draws the arrow (none when `null`). */
  readonly delta?: number | null;
  readonly tone?: SoneStatTrendTone;
}

/**
 * `<dd data-slot="stat-trend">` — the change since the last period. `delta`'s sign
 * draws the arrow and, with `tone="auto"`, the colour; screen readers hear the
 * direction ("up") before the children.
 */
export function SoneStatTrend({
  delta = null,
  tone = "auto",
  children,
  ...rest
}: SoneStatTrendProps): ReactElement {
  const m = useSoneMessages();
  const dir: "up" | "down" | "flat" | null =
    delta === null || delta === undefined || !Number.isFinite(delta)
      ? null
      : delta > 0
        ? "up"
        : delta < 0
          ? "down"
          : "flat";
  const resolved =
    tone !== "auto"
      ? tone
      : dir === "up"
        ? "positive"
        : dir === "down"
          ? "negative"
          : "neutral";
  return (
    <dd
      data-slot="stat-trend"
      data-tone={resolved}
      data-direction={dir ?? undefined}
      {...rest}
    >
      {dir ? (
        <svg
          className="stat-trend-glyph"
          data-slot="stat-trend-glyph"
          viewBox="0 0 12 12"
          aria-hidden="true"
          focusable="false"
        >
          <path d={GLYPH[dir]} />
        </svg>
      ) : null}
      {dir ? (
        <span className="sr-only">
          {`${dir === "up" ? m.statTrendUp : dir === "down" ? m.statTrendDown : m.statTrendFlat} `}
        </span>
      ) : null}
      {children}
    </dd>
  );
}
