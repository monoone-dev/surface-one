"use client";

import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { processingStageLabel } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneProgress } from "../progress/progress";
import { SoneStatusOrb } from "../status-orb/status-orb";

export type ProcessingStatusSize = "default" | "sm";

export interface SoneProcessingStatusProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** `recording`, `transcribing`, `summarizing`, `exporting`, `saved`, `finalized`, `done`, `error` or your own. */
  readonly stage?: string;
  /** Overrides for the built-in stage labels; an unknown stage shows itself capitalised. */
  readonly labels?: Partial<Record<string, string>>;
  /** A live detail that replaces the stage label while it is non-empty. */
  readonly message?: string | null;
  /** 0..1; `null` = indeterminate. */
  readonly progress?: number | null;
  /** Draw the progress track (off for a compact row status). */
  readonly showProgress?: boolean;
  readonly size?: ProcessingStatusSize;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-processing-status>` — where a recording is in the pipeline: the processing
 * orb, the stage label and a thin `SoneProgress`. A polite live region
 * (`role="status"`), so a stage change is announced once.
 */
export function SoneProcessingStatus({
  stage = "transcribing",
  labels,
  message = null,
  progress = null,
  showProgress = true,
  size = "default",
  ...rest
}: SoneProcessingStatusProps): ReactElement {
  const m = useSoneMessages();
  const text =
    message?.trim() ||
    (labels?.[stage] ??
      m.processingStage(stage) ??
      processingStageLabel(stage));
  const failed = stage === "error";
  const value =
    progress === null || progress === undefined || !Number.isFinite(progress)
      ? null
      : Math.min(1, Math.max(0, progress)) * 100;
  return createElement(
    "sone-processing-status",
    {
      role: "status",
      "data-slot": "processing-status",
      "data-stage": stage,
      "data-size": size,
      ...rest,
    },
    <SoneStatusOrb state={failed ? "error" : "processing"} size={size} />,
    <span
      className="processing-status-label"
      data-slot="processing-status-label"
    >
      {text}
    </span>,
    showProgress && !failed ? (
      <SoneProgress
        className="processing-status-track"
        value={value}
        aria-label={text}
      />
    ) : null,
  );
}
