"use client";

import { createElement, type HTMLAttributes, type Ref } from "react";

import { useSoneMessages } from "../../context/messages";
import {
  speakerInitials,
  speakerNumber,
  speakerTone,
} from "../../utils/format";
import { SoneAvatar, SoneAvatarFallback } from "../avatar/avatar";

export type SpeakerChipSize = "sm" | "default";

export interface SoneSpeakerChipProps extends HTMLAttributes<HTMLElement> {
  readonly speaker?: string | null;
  readonly label?: string | null;
  readonly size?: SpeakerChipSize;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-speaker-chip>` — initials in a tone-coloured avatar plus the speaker's
 * name, from one key: `me` → Me, `others` → Others, `others-N` → Speaker N+1,
 * `speaker-N` → Speaker N (names from the messages); an unknown key shows as it is.
 */
export function SoneSpeakerChip({
  speaker = null,
  label = null,
  size = "default",
  ...rest
}: SoneSpeakerChipProps) {
  const messages = useSoneMessages();
  const name = (() => {
    const override = label?.trim();
    if (override) return override;
    if (speaker === "me") return messages.speakerMe;
    if (speaker === "others") return messages.speakerOthers;
    const n = speakerNumber(speaker);
    return n === null ? (speaker ?? "").trim() : messages.speakerNumbered(n);
  })();
  const tone = speakerTone(speaker) ?? undefined;
  return createElement(
    "sone-speaker-chip",
    {
      "data-slot": "speaker-chip",
      "data-tone": tone,
      "data-size": size,
      ...rest,
    },
    name ? (
      <>
        <SoneAvatar
          className="speaker-chip-avatar"
          aria-hidden="true"
          size="sm"
          data-tone={tone}
        >
          <SoneAvatarFallback>{speakerInitials(name)}</SoneAvatarFallback>
        </SoneAvatar>
        <span className="speaker-chip-label" data-slot="speaker-chip-label">
          {name}
        </span>
      </>
    ) : null,
  );
}
