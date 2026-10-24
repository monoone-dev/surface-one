"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import { pct, type SoneProgressSize } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneButton } from "../button/button";
import { SoneProgress } from "../progress/progress";
import { SoneSpinner } from "../spinner/spinner";

export interface SoneDownloadProgressProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** 0..1; `null` = indeterminate. */
  readonly frac?: number | null;
  /** The caption (default: the "Downloading…" message); `""` shows the percentage alone. */
  readonly label?: string;
  /** Between the label and the percentage. */
  readonly separator?: string;
  readonly ariaLabel?: string | null;
  readonly size?: SoneProgressSize;
  readonly cancellable?: boolean;
  /** The cancel button's text (default: the "Cancel download" message). */
  readonly cancelLabel?: string;
  readonly onCancelRequested?: () => void;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-download-progress>` — a progress bar with a caption ("Downloading… 42%") in a
 * `role="status"` region, a spinner while the share is unknown, and an optional cancel
 * button (`onCancelRequested`).
 */
export function SoneDownloadProgress({
  frac = null,
  label: labelProp,
  separator = " ",
  ariaLabel = null,
  size = "sm",
  cancellable = false,
  cancelLabel,
  onCancelRequested,
  ...rest
}: SoneDownloadProgressProps): ReactElement {
  const m = useSoneMessages();
  const label = labelProp ?? m.downloadProgressLabel;
  const known = frac !== null && frac !== undefined;
  const percent =
    known && Number.isFinite(frac) && (frac > 0 || !label) ? pct(frac) : null;
  const caption = !percent
    ? label
    : label
      ? `${label}${separator}${percent}`
      : percent;
  const state = !known ? "indeterminate" : frac >= 1 ? "complete" : "loading";
  return createElement(
    "sone-download-progress",
    {
      "data-slot": "download-progress",
      "data-state": state,
      "data-size": size,
      ...rest,
    },
    <div className="body" data-slot="download-progress-body" role="status">
      <SoneProgress
        value={known ? frac * 100 : null}
        size={size}
        aria-label={ariaLabel ?? undefined}
      />
      <span className="caption" data-slot="download-progress-label">
        {percent ? null : <SoneSpinner size={16} label={null} />}
        {caption}
      </span>
    </div>,
    cancellable ? (
      <SoneButton
        variant="ghost"
        type="button"
        onClick={() => onCancelRequested?.()}
      >
        {cancelLabel ?? m.downloadProgressCancel}
      </SoneButton>
    ) : null,
  );
}
