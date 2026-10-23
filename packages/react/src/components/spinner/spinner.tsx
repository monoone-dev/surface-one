"use client";

import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";

export interface SoneSpinnerProps extends HTMLAttributes<HTMLElement> {
  readonly size?: number;
  /** The accessible name (default: the "Loading" message); `null` for a decorative spinner. */
  readonly label?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-spinner>` — `role="status"` with a label (default: the "Loading" message); `label={null}` for a decorative one. */
export function SoneSpinner({
  size = 16,
  label: labelProp,
  ...rest
}: SoneSpinnerProps): ReactElement {
  const messages = useSoneMessages();
  const label = labelProp === undefined ? messages.loading : labelProp;
  return createElement(
    "sone-spinner",
    { "data-slot": "spinner", ...rest },
    <svg
      className="spinner-glyph"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "status" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : "true"}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>,
  );
}
