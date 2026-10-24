"use client";

import {
  createElement,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";
import { SoneToggle } from "../toggle-group/toggle-group";

export interface SoneMicToggleProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly muted?: boolean;
  readonly compact?: boolean;
  readonly disabled?: boolean;
  /** The accessible name while live (default: the "Mute microphone" message). */
  readonly muteLabel?: string;
  /** The accessible name while muted (default: the "Unmute microphone" message). */
  readonly unmuteLabel?: string;
  /** The button was pressed; the parent owns `muted`. */
  readonly onMuteToggle?: () => void;
  readonly ref?: Ref<HTMLElement>;
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: "1.9",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * `<sone-mic-toggle>` — the microphone's mute button: a pressed toggle with the mic
 * glyph and a "Mute" / "Muted" label (`compact` hides the label).
 */
export function SoneMicToggle({
  muted = false,
  compact = false,
  disabled = false,
  muteLabel,
  unmuteLabel,
  onMuteToggle,
  ...rest
}: SoneMicToggleProps): ReactElement {
  const m = useSoneMessages();
  const label = muted ? (unmuteLabel ?? m.micUnmute) : (muteLabel ?? m.micMute);
  return createElement(
    "sone-mic-toggle",
    {
      "data-slot": "mic-toggle",
      "data-state": muted ? "muted" : "live",
      ...rest,
    },
    <SoneToggle
      variant="outline"
      type="button"
      className={cx("mic", muted && "is-muted", compact && "is-compact")}
      pressed={muted}
      disabled={disabled}
      aria-label={label}
      title={label}
      onClick={() => onMuteToggle?.()}
    >
      {muted ? (
        <svg
          className="mic-ico"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M9 9V5a3 3 0 0 1 5.12-2.12M15 9.34V10a3 3 0 0 1-3 3"
            {...stroke}
          />
          <path
            d="M17 11a5 5 0 0 1-.54 2.27M5 11a7 7 0 0 0 7 7m0 0v3m0-3a6.97 6.97 0 0 0 1.6-.18"
            {...stroke}
          />
          <path d="M3 3l18 18" {...stroke} />
        </svg>
      ) : (
        <svg
          className="mic-ico"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <rect
            x="9"
            y="2"
            width="6"
            height="12"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.9"
          />
          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" {...stroke} />
        </svg>
      )}
      {compact ? null : (
        <span className="mic-label">
          {muted ? m.micMuted : m.micMuteAction}
        </span>
      )}
    </SoneToggle>,
  );
}
