"use client";

import {
  createElement,
  useImperativeHandle,
  useRef,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  type UIEvent,
} from "react";

import { speakerInitials, type TranscriptTone } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";
import { SoneAvatar, SoneAvatarFallback } from "../avatar/avatar";
import { SoneBadge } from "../badge/badge";
import { SoneBubble, SoneBubbleContent } from "../bubble/bubble";
import { SoneButton } from "../button/button";
import { SoneMarker, SoneMarkerContent } from "../marker/marker";
import {
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageFooter,
  SoneMessageHeader,
} from "../message/message";

export interface LiveTranscriptLine {
  id: string;
  speaker: string;
  tone?: TranscriptTone;
  timeLabel: string;
  datetime?: string;
  /** `false` = the in-progress partial result from speech-to-text. */
  final: boolean;
  /** A badge under the line ("Possible question"). */
  flag?: string | null;
  text: string;
  translation?: string;
}

/** What a live transcript's `handleRef` exposes. */
export interface SoneLiveTranscriptHandle {
  /** Scrolls the log to its newest line. */
  scrollToEnd(): void;
}

export interface SoneLiveTranscriptProps extends HTMLAttributes<HTMLElement> {
  readonly lines?: readonly LiveTranscriptLine[];
  readonly following?: boolean;
  readonly canShowOlder?: boolean;
  /** Before "· Jump to latest" (default: the "Live transcript" message). */
  readonly jumpLabel?: string;
  /** The log's name (default: the "Live transcript history" message). */
  readonly label?: string;
  /** Beside a partial line (default: the "Listening…" message). */
  readonly partialLabel?: string;
  /** The `lang` of the translations. */
  readonly translationLang?: string | null;
  readonly onShowOlder?: () => void;
  readonly onJumpToLatest?: () => void;
  /** Whether the reader is at the end of the log, on every scroll. */
  readonly onAtBottomChange?: (atBottom: boolean) => void;
  /** Shown while there are no lines. */
  readonly children?: ReactNode;
  /** `scrollToEnd()`. */
  readonly handleRef?: Ref<SoneLiveTranscriptHandle>;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-live-transcript>` — the running transcript of a live recording: a `role="log"`
 * of speaker bubbles (aria-live off — the reader asks for it), the partial line as a
 * shimmering marker, flags and translations. `following={false}` shows a "Jump to
 * latest" button. `children` show while there are no lines.
 */
export function SoneLiveTranscript({
  lines = [],
  following = true,
  canShowOlder = false,
  jumpLabel,
  label,
  partialLabel,
  translationLang = null,
  onShowOlder,
  onJumpToLatest,
  onAtBottomChange,
  children,
  handleRef,
  ...rest
}: SoneLiveTranscriptProps): ReactElement {
  const m = useSoneMessages();
  const scroller = useRef<HTMLDivElement | null>(null);
  useImperativeHandle(handleRef, () => ({
    scrollToEnd: () => {
      const el = scroller.current;
      if (el) el.scrollTop = el.scrollHeight;
    },
  }));

  const onScroll = (event: UIEvent<HTMLDivElement>): void => {
    const el = event.currentTarget;
    onAtBottomChange?.(el.scrollHeight - el.scrollTop - el.clientHeight <= 48);
  };

  return createElement(
    "sone-live-transcript",
    {
      "data-slot": "live-transcript",
      "data-state": following ? "following" : "scrolled",
      ...rest,
    },
    <div
      ref={scroller}
      className="transcript"
      role="log"
      aria-live="off"
      tabIndex={0}
      aria-label={label ?? m.liveTranscriptLabel}
      onScroll={onScroll}
    >
      {canShowOlder ? (
        <SoneButton
          variant="ghost"
          size="sm"
          type="button"
          className="older-btn"
          onClick={() => onShowOlder?.()}
        >
          {m.liveTranscriptOlder}
        </SoneButton>
      ) : null}
      {lines.length
        ? lines.map((line) => {
            const me = line.tone === "me";
            const align = me ? "end" : "start";
            return (
              <SoneMessage
                key={line.id}
                as="article"
                className={cx(
                  "bubble-row",
                  me && "is-me",
                  !!line.flag && "is-flagged",
                  !line.final && "is-partial",
                )}
                align={align}
              >
                <SoneMessageAvatar
                  as={SoneAvatar}
                  size="sm"
                  className="line-avatar"
                  data-tone={line.tone ?? undefined}
                  aria-hidden="true"
                >
                  <SoneAvatarFallback>
                    {speakerInitials(line.speaker)}
                  </SoneAvatarFallback>
                </SoneMessageAvatar>
                <SoneMessageContent>
                  <SoneMessageHeader className="bubble-meta">
                    <span className="speaker">{line.speaker}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={line.datetime} title={line.datetime}>
                      {line.timeLabel}
                    </time>
                    {line.final ? null : (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{partialLabel ?? m.liveTranscriptPartial}</span>
                      </>
                    )}
                  </SoneMessageHeader>
                  {line.final ? (
                    <SoneBubble variant={me ? "tinted" : "muted"} align={align}>
                      <SoneBubbleContent as="p" className="bubble">
                        {line.text}
                      </SoneBubbleContent>
                      {line.translation ? (
                        <p
                          className="translation"
                          lang={translationLang ?? undefined}
                        >
                          {line.translation}
                        </p>
                      ) : null}
                    </SoneBubble>
                  ) : (
                    <SoneMarker className="bubble">
                      <SoneMarkerContent className="shimmer">
                        {line.text}
                      </SoneMarkerContent>
                    </SoneMarker>
                  )}
                  {line.flag ? (
                    <SoneMessageFooter>
                      <SoneBadge variant="warning" className="question-label">
                        {line.flag}
                      </SoneBadge>
                    </SoneMessageFooter>
                  ) : null}
                </SoneMessageContent>
              </SoneMessage>
            );
          })
        : children}
    </div>,
    following ? null : (
      <SoneButton
        variant="outline"
        size="sm"
        type="button"
        className="jump-btn"
        onClick={() => onJumpToLatest?.()}
      >
        {m.liveTranscriptJumpToLatest(jumpLabel ?? m.liveTranscriptJump)}
      </SoneButton>
    ),
  );
}
