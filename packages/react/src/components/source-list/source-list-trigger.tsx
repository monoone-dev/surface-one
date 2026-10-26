"use client";

import {
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";

export interface SoneSourceListTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** How many sources there are (the count on the chip). */
  readonly count?: number;
  /** Up to three marks, stacked (favicons, `SoneMark`s, avatars). */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLButtonElement>;
}

/**
 * `button[soneSourceListTrigger]` — the sources behind an answer folded into one chip: up to
 * three stacked marks (`children`) and a count (“6 sources”). A plain button: open the full
 * `SoneSourceList` from it and set `aria-expanded` / `aria-controls` for what it opens.
 */
export function SoneSourceListTrigger({
  count = 0,
  type = "button",
  children,
  ...rest
}: SoneSourceListTriggerProps): ReactElement {
  const m = useSoneMessages();
  return (
    <button type={type} data-slot="source-list-trigger" {...rest}>
      <span data-slot="source-list-trigger-marks" aria-hidden="true">
        {children}
      </span>
      <span data-slot="source-list-trigger-label">
        {m.sourceListCount(Math.max(0, Math.round(count)))}
      </span>
    </button>
  );
}
