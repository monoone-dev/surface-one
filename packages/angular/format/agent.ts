// Plain helpers of the agent conversation views (`@surface-one/angular/terminal`,
// `@surface-one/angular/agent-chat`) — Angular-free, so the Vue and React twins bundle the
// very same code through @surface-one/core.

/** Who wrote an entry: the person at the keyboard, an agent, or the system around them. */
export type AgentFrom = "user" | "agent" | "system";

/** A conversation entry: something said, or a quiet line of tool activity (read, edit, ran). */
export type AgentEntryKind = "message" | "activity";

/** How an entry or a divider ended; `default` says nothing either way. */
export type AgentTone = "default" | "success" | "warning" | "danger";

/**
 * What the agent is doing right now. `working` and `thinking` are busy; `waiting` means it
 * needs the person; `done` and `error` close a turn; `idle` is ready for the next message.
 */
export type AgentState =
  "idle" | "working" | "thinking" | "waiting" | "done" | "error";

/** A point in time an entry accepts: a `Date`, epoch milliseconds or an ISO string. */
export type AgentTime = Date | number | string;

/** The states that tick a running timer and mark the view busy. */
export function agentStateIsActive(state: AgentState): boolean {
  return state === "working" || state === "thinking" || state === "waiting";
}

/** The states in which the agent itself is busy (not waiting for the person). */
export function agentStateIsBusy(state: AgentState): boolean {
  return state === "working" || state === "thinking";
}

/** A valid epoch-milliseconds value of `time`, or `null`. */
export function agentTimeValue(
  time: AgentTime | null | undefined,
): number | null {
  if (time === null || time === undefined || time === "") return null;
  const value =
    time instanceof Date
      ? time.getTime()
      : typeof time === "number"
        ? time
        : Date.parse(time);
  return Number.isFinite(value) ? value : null;
}

function two(value: number): string {
  return String(value).padStart(2, "0");
}

/** The time of day of an entry, as a terminal prints it: `14:53:09` (local time). */
export function agentClock(time: AgentTime | null | undefined): string {
  const value = agentTimeValue(time);
  if (value === null) return "";
  const at = new Date(value);
  return `${two(at.getHours())}:${two(at.getMinutes())}:${two(at.getSeconds())}`;
}

/** The `datetime` of an entry's `<time>`: ISO 8601, or `null` when there is no time. */
export function agentIsoTime(
  time: AgentTime | null | undefined,
): string | null {
  const value = agentTimeValue(time);
  return value === null ? null : new Date(value).toISOString();
}

/** Whole seconds between `since` and `now` (never negative); `null` without a start. */
export function agentElapsed(
  since: AgentTime | null | undefined,
  now: number | null,
): number | null {
  const start = agentTimeValue(since);
  if (start === null || now === null) return null;
  return Math.max(0, Math.floor((now - start) / 1000));
}

/** The two-letter mark of a speaker: `Lead` → `Le`, `Code reviewer` → `Cr`. */
export function agentInitials(name: string | null | undefined): string {
  const words = (name ?? "")
    .split(/[\s_\-/]+/u)
    .filter((word) => word.length > 0);
  const first = words[0];
  if (first === undefined) return "?";
  const second = words[1];
  const tail = second === undefined ? first.slice(1, 2) : second.slice(0, 1);
  return first.slice(0, 1).toUpperCase() + tail.toLowerCase();
}

/** A speaker colour: `1`–`8` pick a chart hue (`var(--chart-N)`); anything else none. */
export function agentHue(hue: number | null | undefined): string | null {
  if (hue === null || hue === undefined) return null;
  const n = Math.round(hue);
  return n >= 1 && n <= 8 ? `var(--chart-${n})` : null;
}

/** The inline style of a speaker colour (`--agent-hue`), or none when `agentHue` gives none. */
export function agentHueStyle(
  hue: number | null | undefined,
): { readonly "--agent-hue": string } | undefined {
  const color = agentHue(hue);
  return color === null ? undefined : { "--agent-hue": color };
}

/** The default glyph in front of an entry: `❯` for the person, `›` for activity. */
export function agentGlyph(
  from: AgentFrom,
  kind: AgentEntryKind,
  glyph: string | null | undefined,
): string | null {
  if (glyph !== null && glyph !== undefined) return glyph || null;
  if (from === "user") return "❯";
  return kind === "activity" ? "›" : null;
}

/** The sentences an agent status says, overridable per app (Vue / React) or by `$localize`. */
export interface AgentStatusSentences {
  readonly idle: (speaker: string | null) => string;
  readonly working: (speaker: string | null) => string;
  readonly thinking: (speaker: string | null) => string;
  readonly waiting: (speaker: string | null) => string;
  readonly done: (speaker: string | null) => string;
  readonly error: (speaker: string | null) => string;
}

/** The English sentences (the Vue and React default messages use them too). */
export const AGENT_STATUS_EN: AgentStatusSentences = {
  idle: (s) => (s ? `${s} is ready` : "Ready"),
  working: (s) => (s ? `${s} is working` : "Working"),
  thinking: (s) => (s ? `${s} is thinking` : "Thinking"),
  waiting: (s) => (s ? `${s} is waiting for you` : "Waiting for you"),
  done: (s) => (s ? `${s} is done` : "Done"),
  error: (s) => (s ? `${s} stopped with an error` : "Stopped with an error"),
};

/**
 * Keeps a scrolling log pinned to its newest line while the reader is there, and lets go
 * the moment they scroll up — the `Jump to newest` button brings them back. Browser-only:
 * call it after render (never on the server); `destroy()` when the view goes.
 */
export interface LogFollower {
  /** Scroll to the newest line and follow again. */
  jump(smooth?: boolean): void;
  destroy(): void;
}

/** How close to the end (px) still counts as "at the newest line". */
const AT_END_SLACK = 24;

export function followLog(
  viewport: HTMLElement,
  onAtEnd: (atEnd: boolean) => void,
  follow: () => boolean = () => true,
): LogFollower {
  let atEnd = true;
  const set = (next: boolean): void => {
    if (next === atEnd) return;
    atEnd = next;
    onAtEnd(next);
  };
  const measure = (): boolean =>
    viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight <=
    AT_END_SLACK;
  const toEnd = (smooth: boolean): void => {
    // Not every DOM has scrollTo on elements (jsdom); fall back to the property.
    if (typeof viewport.scrollTo !== "function") {
      viewport.scrollTop = viewport.scrollHeight;
      return;
    }
    viewport.scrollTo({
      top: viewport.scrollHeight,
      behavior: smooth ? "smooth" : "auto",
    });
  };
  const onScroll = (): void => set(measure());
  const onGrow = (): void => {
    if (atEnd && follow()) toEnd(false);
    else set(measure());
  };
  viewport.addEventListener("scroll", onScroll, { passive: true });
  const mutations =
    typeof MutationObserver === "undefined"
      ? null
      : new MutationObserver(onGrow);
  mutations?.observe(viewport, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  const resizes =
    typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onGrow);
  resizes?.observe(viewport);
  if (follow()) toEnd(false);
  return {
    jump(smooth = true) {
      toEnd(smooth);
      set(true);
    },
    destroy() {
      viewport.removeEventListener("scroll", onScroll);
      mutations?.disconnect();
      resizes?.disconnect();
    },
  };
}
