"use client";

import { createElement, type HTMLAttributes, type Ref } from "react";

import { useSoneMessages } from "../../context/messages";
import { SoneButton } from "../button/button";
import { SoneSpinner } from "../spinner/spinner";

export type LoadMoreAlign = "start" | "center";

export interface SoneLoadMoreProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onLoad"
> {
  /** The next page is loading. */
  readonly busy?: boolean;
  /** How many items are left; shown in the label, and `0` hides the control. `null` = unknown. */
  readonly remaining?: number | null;
  /** Why the last load failed; shown above a retry button. */
  readonly error?: string | null;
  /** Default: the "Show more" message. */
  readonly label?: string | null;
  /** Default: the "Loading…" message. */
  readonly busyLabel?: string | null;
  /** Default: the "Try again" message. */
  readonly retryLabel?: string | null;
  readonly align?: LoadMoreAlign;
  /** Load the next page (or retry the failed one). Never called while `busy`. */
  readonly onLoad?: () => void;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-load-more>` — the "Show more" button at the end of a paged list. It calls
 * `onLoad`; the owner fetches the next page and sets `busy` meanwhile (the button stays
 * focusable, `aria-disabled`, and shows a spinner with `busyLabel`). `remaining` adds the
 * count left to the label — "Show more (12)" — and hides the whole thing at 0. When the
 * last page failed, set `error`: the message is announced (`role="alert"`) and the button
 * becomes `retryLabel`.
 */
export function SoneLoadMore({
  busy = false,
  remaining = null,
  error = null,
  label = null,
  busyLabel = null,
  retryLabel = null,
  align = "center",
  onLoad,
  ...rest
}: SoneLoadMoreProps) {
  const messages = useSoneMessages();
  const state = busy ? "loading" : error ? "error" : "idle";
  const done = remaining === 0 && !error && !busy;
  let text: string;
  if (busy) text = busyLabel ?? messages.showMoreBusy;
  else if (error) text = retryLabel ?? messages.showMoreRetry;
  else {
    const base = label ?? messages.showMore;
    text = remaining === null ? base : `${base} (${remaining})`;
  }
  const ariaBusy = busy ? "true" : undefined;
  return createElement(
    "sone-load-more",
    {
      "data-slot": "load-more",
      "data-align": align,
      "data-state": state,
      hidden: done || undefined,
      ...rest,
    },
    error ? (
      <p className="error" data-slot="load-more-error" role="alert">
        {error}
      </p>
    ) : null,
    <SoneButton
      variant="ghost"
      size="sm"
      type="button"
      className="button"
      aria-disabled={ariaBusy}
      aria-busy={ariaBusy}
      onClick={() => {
        if (!busy) onLoad?.();
      }}
    >
      {busy ? (
        <SoneSpinner size={14} label={null} data-icon="inline-start" />
      ) : null}
      {text}
    </SoneButton>,
  );
}
