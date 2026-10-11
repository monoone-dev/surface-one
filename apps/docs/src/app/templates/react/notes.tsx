"use client";

import DOMPurify from "dompurify";
import { Marked } from "marked";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneCard,
  SoneCardContent,
  SoneEmpty,
  SoneEmptyDescription,
  SoneIcon,
  SoneMenu,
  SoneMenuGroup,
  SoneMenuItem,
  SonePageHeader,
  SonePageHeaderActions,
  SonePageHeaderContent,
  SonePageHeaderDescription,
  SonePageHeaderEyebrow,
  SonePageHeaderTitle,
  SoneSlider,
} from "@surface-one/react";

import { SILENT_WAV, NOTES } from "../data/notes";

interface Segment {
  readonly id: number;
  readonly speakerKey: string;
  readonly speaker: string;
  readonly tone: "me" | "others";
  readonly startS: number;
  readonly endS: number;
  readonly text: string;
}

/** Consecutive segments of one speaker, shown as one turn. */
interface Turn {
  readonly key: string;
  readonly speakerKey: string;
  readonly speaker: string;
  readonly tone: "me" | "others";
  readonly startS: number;
  endS: number;
  text: string;
  readonly fragments: Segment[];
}

const SEGMENTS: readonly Segment[] = [
  {
    id: 0,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 0,
    endS: 7,
    text: "Thanks for joining. Let's lock the Harbor launch plan today.",
  },
  {
    id: 1,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 7,
    endS: 14,
    text: "I'd like to move the date to October 18 to give billing a full week.",
  },
  {
    id: 2,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 14,
    endS: 23,
    text: "That works. I can freeze the release branch on the 14th and run the migration dry run on the 15th.",
  },
  {
    id: 3,
    speakerKey: "mina",
    speaker: "Mina Sato",
    tone: "others",
    startS: 23,
    endS: 31,
    text: "I'll own the launch checklist and share a draft in Friday's sync.",
  },
  {
    id: 4,
    speakerKey: "mina",
    speaker: "Mina Sato",
    tone: "others",
    startS: 31,
    endS: 37,
    text: "Who is covering support during launch week?",
  },
  {
    id: 5,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 37,
    endS: 45,
    text: "Still open. Leo, can you propose a rota by Wednesday?",
  },
  {
    id: 6,
    speakerKey: "leo",
    speaker: "Leo Ruiz",
    tone: "others",
    startS: 45,
    endS: 52,
    text: "Sure, I'll draft it and ask the support leads to review.",
  },
  {
    id: 7,
    speakerKey: "ada",
    speaker: "Ada Park",
    tone: "me",
    startS: 52,
    endS: 60,
    text: "Great. Last item: the pricing page screenshots still need updating.",
  },
];

function foldTurns(segments: readonly Segment[]): Turn[] {
  const out: Turn[] = [];
  for (const s of segments) {
    const cur = out[out.length - 1];
    if (cur && cur.speakerKey === s.speakerKey) {
      cur.fragments.push(s);
      cur.endS = s.endS;
      cur.text += ` ${s.text}`;
    } else {
      out.push({ ...s, key: `t${s.id}`, fragments: [s] });
    }
  }
  return out;
}

const clock = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");

// Read-only task boxes as spans, the same markup <sone-markdown> renders.
const md = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    checkbox({ checked }) {
      return `<span class="markdown-task-box" role="checkbox" aria-label="Task" aria-checked="${checked}" aria-disabled="true"></span>`;
    },
    listitem(item) {
      if (!item.task) return false;
      const cls = item.checked ? " is-done" : "";
      return `<li class="markdown-task task-list-item${cls}"><span class="markdown-task-text">${this.parser.parse(item.tokens)}</span></li>\n`;
    },
  },
});

const turns = foldTurns(SEGMENTS);

/** The output of the trusted NOTES constant above. */
const NOTES_HTML = md.parse(NOTES, { async: false });

const css = `
.tpl-notes.notes-template {
  display: block;
  padding: var(--space-6);
}
.tpl-notes .player {
  margin-bottom: var(--space-6);
}
.tpl-notes .columns {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: start;
}
.tpl-notes .column {
  display: grid;
  gap: var(--space-3);
  min-width: 0;
}
.tpl-notes .column-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  min-height: var(--space-7);
}
.tpl-notes .column-head h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-notes .search {
  width: 12rem;
  max-width: 60%;
}

/* Page actions (the <sone-page-actions> host styles). */
.tpl-notes .page-actions {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: var(--space-2);
  min-width: 0;
  font-size: var(--font-size-sm);
}
.tpl-notes .page-actions-status {
  overflow: hidden;
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-notes .menu-anchor {
  position: relative;
  display: inline-flex;
}
.tpl-notes .menu-panel {
  position: absolute;
  top: calc(100% + var(--space-1));
  right: 0;
  width: 15rem;
  z-index: var(--z-dropdown);
}

/* Audio player (from the <sone-audio-player> styles). */
.tpl-notes .audio-player {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}
.tpl-notes .play {
  flex: none;
  border-radius: var(--radius-pill);
}
.tpl-notes .time {
  flex: none;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}
.tpl-notes .track {
  flex: 1 1 auto;
  min-width: 0;
}

/* Transcript (from the <sone-transcript> styles). */
.tpl-notes .transcript-card {
  padding: var(--space-3);
  max-height: 520px;
  overflow: auto;
}
.tpl-notes .turns {
  list-style: none;
  padding: 0;
  margin: 0;
}
.tpl-notes .turn {
  scroll-margin: var(--space-4);
}
.tpl-notes .turn-avatar {
  align-self: flex-start;
}
.tpl-notes .turn-speaker {
  color: var(--text-secondary);
}
.tpl-notes .turn-time {
  padding: 0;
  border: none;
  border-radius: var(--radius-xs);
  background: transparent;
  color: inherit;
  font: inherit;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition: color var(--transition);
}
.tpl-notes .turn-time:hover,
.tpl-notes .turn.is-active .turn-time {
  color: var(--accent-text);
}
.tpl-notes .turn-time:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.tpl-notes .turn-text {
  margin: 0;
}
.tpl-notes .frag {
  display: inline;
  /* A <button> computes to inline-block; keep every fragment at least 24px tall (WCAG 2.5.8). */
  min-height: 24px;
  margin: 0;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  vertical-align: baseline;
  cursor: pointer;
  transition:
    color var(--transition),
    background var(--transition);
}
.tpl-notes .frag:hover {
  color: var(--accent-text);
}
.tpl-notes .frag:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.tpl-notes .frag.is-active {
  background: var(--surface-base);
  box-shadow: 0 0 0 var(--focus-ring-width) var(--surface-base);
}

@media (max-width: 720px) {
  .tpl-notes.notes-template {
    padding: var(--space-4);
  }
  .tpl-notes .columns {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-notes .audio-player {
    flex-wrap: wrap;
  }
  .tpl-notes .track {
    order: 1;
    flex-basis: 100%;
  }
}
`;

export default function NotesTemplate() {
  const [currentTime, setCurrentTime] = useState(14);
  const [query, setQuery] = useState("");
  const [starred, setStarred] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  /**
   * DOMPurify needs a DOM, so it runs in the browser only; on the server (SSR) the
   * output of the trusted NOTES constant above is used as is. Sanitise any markdown
   * that comes from users or a model.
   */
  const [notesHtml, setNotesHtml] = useState(NOTES_HTML);
  useEffect(() => setNotesHtml(DOMPurify.sanitize(NOTES_HTML)), []);

  const q = query.trim().toLowerCase();
  const visibleTurns = q
    ? turns.filter((t) => t.text.toLowerCase().includes(q))
    : turns;
  const activeTurnKey =
    turns.find((t) => currentTime >= t.startS && currentTime < t.endS)?.key ??
    null;
  const isActive = (f: Segment): boolean =>
    currentTime >= f.startS && currentTime < f.endS;

  // The audio player's own state.
  const audio = useRef<HTMLAudioElement>(null);
  const [playerTime, setPlayerTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  function togglePlay(): void {
    const el = audio.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => setPlaying(false));
    else el.pause();
  }

  function onLoaded(): void {
    const el = audio.current;
    if (el && Number.isFinite(el.duration)) setDuration(el.duration);
  }

  function onTimeUpdate(): void {
    const t = audio.current?.currentTime ?? 0;
    setPlayerTime(t);
    setCurrentTime(t);
  }

  function seekAudio(seconds: number): void {
    const el = audio.current;
    if (!el) return;
    el.currentTime = seconds;
    onTimeUpdate();
  }

  // The page menu closes on a click outside it (listener added in the browser only).
  const menuEl = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menuOpen) return;
    const onDocumentClick = (event: MouseEvent): void => {
      if (!menuEl.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [menuOpen]);

  return (
    <div className="tpl-notes notes-template">
      <style>{css}</style>
      <SonePageHeader as="div">
        <SonePageHeaderContent>
          <SonePageHeaderEyebrow>
            Meeting · Oct 2 · 42 min
          </SonePageHeaderEyebrow>
          <SonePageHeaderTitle as="h2">
            Harbor launch — weekly sync
          </SonePageHeaderTitle>
          <SonePageHeaderDescription>
            Ada Park, Leo Ruiz and Mina Sato · Product
          </SonePageHeaderDescription>
        </SonePageHeaderContent>
        <SonePageHeaderActions>
          {/* The same markup as <sone-page-actions>, with a SoneMenu. */}
          <div
            data-slot="page-actions"
            className="page-actions"
            data-state={menuOpen ? "open" : "closed"}
          >
            <span
              className="page-actions-status"
              data-slot="page-actions-status"
            >
              Edited 2 min ago
            </span>
            <span data-slot="page-actions-lead">
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Favorite"
                aria-pressed={starred}
                onClick={() => setStarred((on) => !on)}
              >
                <SoneIcon icon="star" />
              </SoneButton>
            </span>
            <div
              ref={menuEl}
              className="menu-anchor"
              onKeyDown={(e) => {
                if (e.key === "Escape") setMenuOpen(false);
              }}
            >
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="More actions"
                title="More actions"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((open) => !open)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </SoneButton>
              {menuOpen ? (
                <SoneMenu
                  className="menu-panel"
                  aria-label="More actions"
                  onClick={() => setMenuOpen(false)}
                >
                  <SoneMenuGroup>
                    <SoneMenuItem type="button" role="menuitem">
                      <SoneIcon icon="link" /> Copy link
                    </SoneMenuItem>
                    <SoneMenuItem type="button" role="menuitem">
                      <SoneIcon icon="share" /> Share
                    </SoneMenuItem>
                    <SoneMenuItem type="button" role="menuitem">
                      <SoneIcon icon="download" /> Export as Markdown
                    </SoneMenuItem>
                  </SoneMenuGroup>
                  <SoneMenuGroup>
                    <SoneMenuItem type="button" role="menuitem">
                      <SoneIcon icon="refresh" /> Regenerate notes
                    </SoneMenuItem>
                    <SoneMenuItem
                      variant="destructive"
                      type="button"
                      role="menuitem"
                    >
                      <SoneIcon icon="trash" /> Move to Trash
                    </SoneMenuItem>
                  </SoneMenuGroup>
                </SoneMenu>
              ) : null}
            </div>
          </div>
        </SonePageHeaderActions>
      </SonePageHeader>

      <SoneCard size="sm" className="player">
        <SoneCardContent>
          {/* A simplified <sone-audio-player> (play, time, seek). */}
          <div
            data-slot="audio-player"
            className="audio-player"
            data-state={playing ? "playing" : "paused"}
          >
            <audio
              ref={audio}
              src={SILENT_WAV}
              preload="metadata"
              onLoadedMetadata={onLoaded}
              onTimeUpdate={onTimeUpdate}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
            <SoneButton
              size="icon"
              type="button"
              className="play"
              aria-label={playing ? "Pause" : "Play"}
              onClick={togglePlay}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 3.9v16.2a1 1 0 0 0 1.5.86l13.5-8.1a1 1 0 0 0 0-1.72L7.5 3.04A1 1 0 0 0 6 3.9Z" />
                </svg>
              )}
            </SoneButton>
            <span className="time" data-slot="audio-player-time">
              {clock(playerTime)}
            </span>
            <SoneSlider
              className="track"
              ariaLabel="Seek"
              value={playerTime}
              max={duration}
              aria-valuetext={`${clock(playerTime)} of ${clock(duration)}`}
              onValueChange={seekAudio}
            />
            <span className="time" data-slot="audio-player-duration">
              {clock(duration)}
            </span>
          </div>
        </SoneCardContent>
      </SoneCard>

      <div className="columns">
        <div className="column" role="group" aria-labelledby="notes-summary">
          <div className="column-head">
            <h3 id="notes-summary">Summary</h3>
            <SoneBadge variant="secondary">
              <SoneIcon icon="sparkles" size="xs" /> Generated
            </SoneBadge>
          </div>
          {/* The same wrapper as <sone-markdown>. */}
          <div className="markdown" data-slot="markdown" data-size="default">
            <div
              className="markdown-block"
              dangerouslySetInnerHTML={{ __html: notesHtml }}
            />
          </div>
        </div>

        <div className="column" role="group" aria-labelledby="notes-transcript">
          <div className="column-head">
            <h3 id="notes-transcript">Transcript</h3>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="search"
              className="search"
              aria-label="Filter transcript"
              placeholder="Filter…"
            />
          </div>
          {/* The same markup and classes as <sone-transcript>. */}
          <div data-slot="transcript">
            {visibleTurns.length ? (
              <div className="transcript-card panel-card">
                <ul data-slot="message-group" className="turns">
                  {visibleTurns.map((t) => (
                    <li
                      key={t.key}
                      data-slot="message"
                      data-align="start"
                      className={
                        t.key === activeTurnKey ? "turn is-active" : "turn"
                      }
                      data-turn={t.key}
                    >
                      <SoneAvatar
                        data-slot="message-avatar"
                        size="sm"
                        className="turn-avatar"
                        data-tone={t.tone}
                        aria-hidden="true"
                      >
                        <SoneAvatarFallback>
                          {initials(t.speaker)}
                        </SoneAvatarFallback>
                      </SoneAvatar>
                      <div data-slot="message-content">
                        <div data-slot="message-header" className="turn-head">
                          <span className="turn-speaker">{t.speaker}</span>
                          <span aria-hidden="true">·</span>
                          <button
                            type="button"
                            className="turn-time"
                            onClick={() => setCurrentTime(t.startS)}
                          >
                            {clock(t.startS)}
                          </button>
                        </div>
                        <div
                          data-slot="bubble"
                          data-variant={
                            t.key === activeTurnKey ? "tinted" : "muted"
                          }
                          data-align="start"
                        >
                          <p data-slot="bubble-content" className="turn-text">
                            {t.fragments.map((f, i) => (
                              <Fragment key={f.id}>
                                {i > 0 ? " " : null}
                                <button
                                  type="button"
                                  className={
                                    isActive(f) ? "frag is-active" : "frag"
                                  }
                                  onClick={() => setCurrentTime(f.startS)}
                                >
                                  {f.text}
                                </button>
                              </Fragment>
                            ))}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <SoneEmpty className="empty-card panel-card">
                <SoneEmptyDescription>
                  No turns match “{query}”.
                </SoneEmptyDescription>
              </SoneEmpty>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
