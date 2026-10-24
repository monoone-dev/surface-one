"use client";

import {
  createElement,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import {
  activeTranscriptFragmentIds,
  activeTranscriptTurnKey,
  clockTime,
  filterTranscriptTurns,
  flashTranscriptFragment,
  followTranscriptRow,
  speakerInitials,
  transcriptWindow,
  type TranscriptTurn,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";
import { SoneAvatar, SoneAvatarFallback } from "../avatar/avatar";
import { SoneBadge } from "../badge/badge";
import { SoneBubble, SoneBubbleContent } from "../bubble/bubble";
import { SoneButton } from "../button/button";
import { SoneEmpty, SoneEmptyDescription } from "../empty-state/empty-state";
import {
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageGroup,
  SoneMessageHeader,
} from "../message/message";

export {
  foldTranscriptTurns,
  type TranscriptFragment,
  type TranscriptSegment,
  type TranscriptTone,
  type TranscriptTurn,
} from "@surface-one/core";

/** What a transcript's `handleRef` exposes. */
export interface SoneTranscriptHandle {
  /** Every turn renders (past the row and fragment caps). */
  readonly expanded: boolean;
  /** Back to the window around the playing turn. */
  collapse(): void;
}

export interface SoneTranscriptProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly turns?: readonly TranscriptTurn[];
  readonly currentTime?: number;
  readonly query?: string;
  readonly flashId?: number | null;
  /** Bump it to flash the same fragment again. */
  readonly flashSeq?: number;
  readonly seekable?: boolean;
  readonly renderCap?: number;
  readonly fragmentCap?: number;
  /** A time or a fragment was clicked: its start, in seconds. */
  readonly onSeek?: (seconds: number) => void;
  /** The flashed fragment's highlight finished. */
  readonly onFlashEnd?: (id: number) => void;
  /** `expanded` and `collapse()`. */
  readonly handleRef?: Ref<SoneTranscriptHandle>;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-transcript>` — a recording's transcript as speaker turns (fold segments with
 * `foldTranscriptTurns`): the playing turn and fragments highlight and follow
 * `currentTime`, a click on a time or a fragment calls `onSeek`, `query` filters the
 * turns, and `flashId` flashes one fragment into view. Long transcripts render a window
 * around the playing turn, with a "Show all" button.
 */
export function SoneTranscript({
  turns = [],
  currentTime = 0,
  query = "",
  flashId = null,
  flashSeq = 0,
  seekable = true,
  renderCap = 80,
  fragmentCap = 160,
  onSeek,
  onFlashEnd,
  handleRef,
  ...rest
}: SoneTranscriptProps): ReactElement {
  const m = useSoneMessages();
  const [expanded, setExpanded] = useState(false);
  const scroller = useRef<HTMLDivElement | null>(null);
  const lastScrolledFlashKey = useRef("");
  useImperativeHandle(
    handleRef,
    () => ({ expanded, collapse: () => setExpanded(false) }),
    [expanded],
  );

  const flashKey = `${flashId ?? ""}#${flashSeq}`;
  const visibleTurns = useMemo(
    () => filterTranscriptTurns(turns, query),
    [turns, query],
  );
  const activeTurnKey = activeTranscriptTurnKey(turns, currentTime);
  const renderedTurns = useMemo(
    () =>
      transcriptWindow(visibleTurns, {
        expanded,
        rowCap: renderCap,
        fragmentCap,
        flashId,
        activeKey: activeTurnKey,
      }),
    [visibleTurns, expanded, renderCap, fragmentCap, flashId, activeTurnKey],
  );
  const hiddenTurnCount = visibleTurns.length - renderedTurns.length;
  const activeFragmentIds = activeTranscriptFragmentIds(
    renderedTurns,
    currentTime,
  );

  // Keep the playing turn in view (not while filtering).
  useEffect(() => {
    const box = scroller.current;
    if (!activeTurnKey || query.trim() || !box) return;
    const row = Array.from(
      box.querySelectorAll<HTMLElement>("[data-turn]"),
    ).find((r) => r.getAttribute("data-turn") === activeTurnKey);
    if (row) followTranscriptRow(box, row);
  }, [activeTurnKey, query]);

  // Flash the fragment once per flashId / flashSeq.
  useEffect(() => {
    if (
      flashId === null ||
      renderedTurns.length === 0 ||
      flashKey === lastScrolledFlashKey.current
    ) {
      return;
    }
    const frag = scroller.current?.querySelector<HTMLElement>(
      `.frag[data-flash="${CSS.escape(flashKey)}"]`,
    );
    if (!frag) return;
    lastScrolledFlashKey.current = flashKey;
    flashTranscriptFragment(frag);
  }, [flashId, flashKey, renderedTurns]);

  let body: ReactElement;
  if (visibleTurns.length) {
    body = (
      <div ref={scroller} className="transcript-card panel-card">
        <SoneMessageGroup as="ul" className="turns">
          {renderedTurns.map((t) => {
            const active = t.key === activeTurnKey;
            return (
              <SoneMessage
                key={t.key}
                as="li"
                className={cx("turn", active && "is-active")}
                data-turn={t.key}
              >
                {t.speaker ? (
                  <SoneMessageAvatar
                    as={SoneAvatar}
                    size="sm"
                    className="turn-avatar"
                    data-tone={t.tone ?? undefined}
                    aria-hidden="true"
                  >
                    <SoneAvatarFallback>
                      {speakerInitials(t.speaker)}
                    </SoneAvatarFallback>
                  </SoneMessageAvatar>
                ) : null}
                <SoneMessageContent>
                  <SoneMessageHeader className="turn-head">
                    {t.speaker ? (
                      <>
                        <span className="turn-speaker">{t.speaker}</span>
                        <span aria-hidden="true">·</span>
                      </>
                    ) : null}
                    <button
                      type="button"
                      className="turn-time"
                      disabled={!seekable}
                      onClick={() => onSeek?.(t.startS)}
                    >
                      {clockTime(t.startS)}
                    </button>
                  </SoneMessageHeader>
                  <SoneBubble variant={active ? "tinted" : "muted"}>
                    <SoneBubbleContent as="p" className="turn-text">
                      {t.fragments.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          className={cx(
                            "frag",
                            activeFragmentIds.has(f.id) && "is-active",
                            f.id === flashId && "is-flash",
                          )}
                          data-flash={f.id === flashId ? flashKey : undefined}
                          onAnimationEnd={() => {
                            if (flashId === f.id) onFlashEnd?.(f.id);
                          }}
                          disabled={!seekable}
                          onClick={() => onSeek?.(f.startS)}
                        >
                          {f.text}
                        </button>
                      ))}
                    </SoneBubbleContent>
                    {t.secondaryText ? (
                      <p className="turn-secondary">{t.secondaryText}</p>
                    ) : null}
                  </SoneBubble>
                </SoneMessageContent>
              </SoneMessage>
            );
          })}
        </SoneMessageGroup>
        {hiddenTurnCount > 0 ? (
          <SoneButton
            variant="ghost"
            type="button"
            className="show-all"
            onClick={() => setExpanded(true)}
          >
            {m.transcriptShowAll(visibleTurns.length)}
            <SoneBadge variant="secondary">{`+${hiddenTurnCount}`}</SoneBadge>
          </SoneButton>
        ) : null}
      </div>
    );
  } else {
    body = (
      <SoneEmpty className="empty-card panel-card">
        <SoneEmptyDescription>
          {turns.length ? m.transcriptNoMatch(query) : m.transcriptEmpty}
        </SoneEmptyDescription>
      </SoneEmpty>
    );
  }
  return createElement(
    "sone-transcript",
    { "data-slot": "transcript", ...rest },
    body,
  );
}
