import {
  createElement,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
  type ReactElement,
} from "react";

import { cx, flag } from "../../utils/part";
import type { AlertVariant } from "../alert/alert";

export type BannerKind = "info" | "success" | "warning" | "danger";

const stroke = { stroke: "currentColor", strokeWidth: "1.5" } as const;

const RING = <circle cx="8" cy="8" r="6.25" {...stroke} />;

const GLYPHS: Record<BannerKind, ReactNode> = {
  success: (
    <>
      {RING}
      <path
        d="m5.4 8.2 1.8 1.8 3.4-3.6"
        {...stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  warning: (
    <>
      <path
        d="M7.13 2.5a1 1 0 0 1 1.74 0l5.4 9.5a1 1 0 0 1-.87 1.5H2.6a1 1 0 0 1-.87-1.5l5.4-9.5Z"
        {...stroke}
        strokeLinejoin="round"
      />
      <path d="M8 6.2v3" {...stroke} strokeLinecap="round" />
      <circle cx="8" cy="11.3" r="0.85" fill="currentColor" />
    </>
  ),
  danger: (
    <>
      {RING}
      <path d="M8 4.9v3.5" {...stroke} strokeLinecap="round" />
      <circle cx="8" cy="10.9" r="0.85" fill="currentColor" />
    </>
  ),
  info: (
    <>
      {RING}
      <path d="M8 7.4v3.7" {...stroke} strokeLinecap="round" />
      <circle cx="8" cy="5.05" r="0.85" fill="currentColor" />
    </>
  ),
};

export interface SoneBannerProps extends HTMLAttributes<HTMLElement> {
  readonly kind?: BannerKind;
  /** An opaque overlay banner: overlay surface, strong or status border, large shadow. */
  readonly floating?: boolean;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-banner>` — a one-line alert with its kind's glyph; `danger` / `warning` are announced at once. `floating` makes it an opaque overlay banner. */
export function SoneBanner({
  kind = "info",
  floating = false,
  className,
  children,
  ...rest
}: SoneBannerProps): ReactElement {
  const variant: AlertVariant = kind === "danger" ? "destructive" : kind;
  return createElement(
    "sone-banner",
    {
      "data-slot": "alert",
      "data-variant": variant,
      "data-floating": flag(floating),
      role: kind === "danger" || kind === "warning" ? "alert" : "status",
      ...rest,
      className: cx("alert", className),
    },
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {GLYPHS[kind] ?? GLYPHS.info}
    </svg>,
    <span className="banner-body">{children}</span>,
  );
}
