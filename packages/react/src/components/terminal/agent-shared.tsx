"use client";

// The shared behaviour of the two agent conversation views — SoneTerminal* and SoneAgentChat*
// (the twins of @surface-one/angular/core's agent-base.ts). Both families build their parts
// from these helpers, so their props are the same by construction and an app swaps one view
// for the other part by part. Private: not exported from the package.

import {
  createElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  type ReactElement,
} from "react";

import {
  agentClock,
  agentElapsed,
  agentHueStyle,
  agentIsoTime,
  agentStateIsActive,
  agentStateIsBusy,
  durationLabel,
  followLog,
  type AgentEntryKind,
  type AgentFrom,
  type AgentState,
  type AgentTime,
  type AgentTone,
  type LogFollower,
} from "@surface-one/core";

import { useSoneMessages, type SoneMessages } from "../../context/messages";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";

type HostProps = Omit<HTMLAttributes<HTMLElement>, "children">;

/** `style` with `--agent-hue` added when the hue is set. */
export function hueStyle(
  hue: number | null | undefined,
  style: CSSProperties | undefined,
): CSSProperties | undefined {
  const hueVars = agentHueStyle(hue);
  return hueVars ? ({ ...style, ...hueVars } as CSSProperties) : style;
}

/** `data-tone`, left out for `default`. */
export const toneAttr = (tone: AgentTone): AgentTone | undefined =>
  tone === "default" ? undefined : tone;

// ── Frame ─────────────────────────────────────────────────────────────────────

export interface SoneAgentFrameProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement>;
}

export function renderFrame(
  tag: string,
  slot: string,
  props: SoneAgentFrameProps,
): ReactElement {
  return createElement(tag, { "data-slot": slot, ...props });
}

// ── Entry ─────────────────────────────────────────────────────────────────────

/** The props of one conversation entry: `SoneTerminalLine` and `SoneAgentChatMessage`. */
export interface SoneAgentEntryProps extends HostProps {
  /** Who wrote it: the person (`user`), an `agent`, or the `system`. */
  readonly from?: AgentFrom;
  /** `message` is something said; `activity` is a quiet line of tool work. */
  readonly kind?: AgentEntryKind;
  /** The speaker's name; the person's defaults to “You”. */
  readonly speaker?: string | null;
  /** Who the person (or an agent) spoke to: “You → Lead”. */
  readonly to?: string | null;
  /** When it was said: a `Date`, epoch milliseconds or an ISO string. */
  readonly time?: AgentTime | null;
  /** `danger` for a failed command, `success` / `warning` for an outcome. */
  readonly tone?: AgentTone;
  /** The mark in front of the text; `❯` for the person, `›` for activity. `""` hides it. */
  readonly glyph?: string | null;
  /** A speaker colour, `1`–`8` (the chart hues), so each agent keeps its own. */
  readonly hue?: number | null;
  /** A quiet note about the entry, such as the model that wrote it: after the time in the chat, in front of the text in the terminal. */
  readonly note?: string | null;
  /** The text. */
  readonly children?: ReactNode;
  /** Trailing content: a metric, a badge, a “show more” toggle. */
  readonly meta?: ReactNode;
  /** Content under the entry: its expanded body or a command's output. */
  readonly detail?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/** The host attributes of an entry (`data-from`, `data-kind`, `data-tone`, `--agent-hue`). */
export function entryHost(
  slot: string,
  {
    from,
    kind,
    tone,
    hue,
    style,
  }: {
    from: AgentFrom;
    kind: AgentEntryKind;
    tone: AgentTone;
    hue: number | null;
    style: CSSProperties | undefined;
  },
) {
  return {
    "data-slot": slot,
    "data-from": from,
    "data-kind": kind,
    "data-tone": toneAttr(tone),
    style: hueStyle(hue, style),
  };
}

/** The speaker shown for an entry: its name, or “You” for the person. */
export const entryWho = (
  speaker: string | null | undefined,
  from: AgentFrom,
  m: SoneMessages,
): string | null => speaker ?? (from === "user" ? m.agentYou : null);

/** `<span data-slot="…-to">→ <sr-only>to</sr-only> Lead</span>`. */
export function renderTo(
  slot: string,
  to: string,
  m: SoneMessages,
): ReactElement {
  return (
    <span data-slot={slot}>
      <span aria-hidden="true">→</span>
      <span className="sr-only">{m.agentTo}</span> {to}
    </span>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

export interface SoneAgentDividerProps extends HostProps {
  readonly time?: AgentTime | null;
  readonly tone?: AgentTone;
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

export function renderDivider(
  tag: string,
  slot: string,
  { time = null, tone = "default", children, ...rest }: SoneAgentDividerProps,
): ReactElement {
  const clock = agentClock(time);
  return createElement(
    tag,
    { "data-slot": slot, "data-tone": toneAttr(tone), ...rest },
    <span data-slot={`${slot}-rule`} aria-hidden="true" />,
    <span data-slot={`${slot}-label`}>
      {children}
      {clock ? (
        <>
          <span aria-hidden="true">·</span>
          <time dateTime={agentIsoTime(time) ?? undefined}>{clock}</time>
        </>
      ) : null}
    </span>,
    <span data-slot={`${slot}-rule`} aria-hidden="true" />,
  );
}

// ── Log ───────────────────────────────────────────────────────────────────────

/** What a log's `handleRef` exposes. */
export interface SoneAgentLogHandle {
  /** Scroll to the newest line and follow it again. */
  scrollToEnd(smooth?: boolean): void;
}

export interface SoneAgentLogProps extends HostProps {
  /** The log's accessible name. */
  readonly label?: string | null;
  /** Stay pinned to the newest line while the reader is there. */
  readonly follow?: boolean;
  readonly children?: ReactNode;
  /** `scrollToEnd()`, for a “Jump to newest” of the app's own. */
  readonly handleRef?: Ref<SoneAgentLogHandle>;
  readonly ref?: Ref<HTMLElement>;
}

/** Follows the newest line of a scrolling viewport (browser-only: runs in an effect). */
function useLogFollower(
  follow: boolean,
  handleRef: Ref<SoneAgentLogHandle> | undefined,
) {
  const viewport = useRef<HTMLDivElement>(null);
  const follower = useRef<LogFollower | null>(null);
  const followRef = useRef(follow);
  followRef.current = follow;
  const [atEnd, setAtEnd] = useState(true);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const f = followLog(el, setAtEnd, () => followRef.current);
    follower.current = f;
    return () => {
      f.destroy();
      follower.current = null;
    };
  }, []);

  const scrollToEnd = useCallback((smooth = true) => {
    follower.current?.jump(smooth);
  }, []);
  useImperativeHandle(handleRef, () => ({ scrollToEnd }), [scrollToEnd]);

  return { viewport, atEnd, scrollToEnd };
}

export function useAgentLog(
  tag: string,
  slot: string,
  defaultLabel: (m: SoneMessages) => string,
  {
    label = null,
    follow = true,
    children,
    handleRef,
    ...rest
  }: SoneAgentLogProps,
) {
  const m = useSoneMessages();
  const { viewport, atEnd, scrollToEnd } = useLogFollower(follow, handleRef);
  return createElement(
    tag,
    { "data-slot": slot, ...rest },
    <div
      ref={viewport}
      data-slot={`${slot}-viewport`}
      role="log"
      aria-live="polite"
      tabIndex={0}
      aria-label={label ?? defaultLabel(m)}
    >
      {children}
    </div>,
    atEnd ? null : (
      <SoneButton
        type="button"
        variant="secondary"
        size="sm"
        data-slot={`${slot}-jump`}
        onClick={() => scrollToEnd()}
      >
        <SoneIcon icon="arrow-down" />
        {m.agentJumpToNewest}
      </SoneButton>
    ),
  );
}

// ── Status ────────────────────────────────────────────────────────────────────

export interface SoneAgentStatusProps extends HostProps {
  readonly state?: AgentState;
  /** Who it is about: “Lead is working”. */
  readonly speaker?: string | null;
  /** When the current state began; a running time is shown while the agent is active. */
  readonly since?: AgentTime | null;
  /** Replaces the built-in sentence. */
  readonly label?: string | null;
  /** The speaker colour, `1`–`8`. */
  readonly hue?: number | null;
  /** The detail after the sentence (“Reading the test log”). */
  readonly children?: ReactNode;
  /** Actions at the end of the status (Interrupt, Stop). */
  readonly actions?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * The live parts of a status: the sentence, the running time and the host attributes. `now`
 * starts at null, so the server and the first client render show no time (hydration
 * matches); the browser ticks once a second while the agent is active.
 */
export function useAgentStatus(
  slot: string,
  {
    state = "idle",
    speaker = null,
    since = null,
    label = null,
    hue = null,
    style,
  }: SoneAgentStatusProps,
) {
  const m = useSoneMessages();
  const [now, setNow] = useState<number | null>(null);
  const active = agentStateIsActive(state);
  const ticking = active && since !== null && since !== undefined;

  useEffect(() => {
    if (!ticking) return;
    setNow(Date.now());
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [ticking]);

  const seconds = active ? agentElapsed(since, now) : null;
  const sentence = label ?? m.agentStatus(state, speaker ?? null);
  const time =
    seconds === null ? null : (
      <time
        data-slot={`${slot}-time`}
        role="timer"
        aria-label={m.agentStatusTime}
        dateTime={`PT${seconds}S`}
      >
        {durationLabel(seconds)}
      </time>
    );
  const text = (
    <span data-slot={`${slot}-text`} role="status" aria-live="polite">
      {sentence}
    </span>
  );
  const host = {
    "data-slot": slot,
    "data-state": state,
    "data-active": active ? "" : undefined,
    "data-busy": agentStateIsBusy(state) ? "" : undefined,
    style: hueStyle(hue, style),
  };
  return { host, text, time };
}

/** The props a status hands on to its host element. */
export function statusRest({
  state: _state,
  speaker: _speaker,
  since: _since,
  label: _label,
  hue: _hue,
  style: _style,
  children: _children,
  actions: _actions,
  ...rest
}: SoneAgentStatusProps) {
  return rest;
}

// ── Prompt ────────────────────────────────────────────────────────────────────

export interface SoneAgentPromptProps extends HostProps {
  /** Fires when the person sends (Enter, or a submit button inside). */
  readonly onSubmitted?: () => void;
  /** The field (`SoneTerminalPromptInput` / `SoneAgentChatComposerInput`). */
  readonly children?: ReactNode;
  /** Buttons and selects at the end (model, send). */
  readonly actions?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

export const submitHandler =
  (onSubmitted: (() => void) | undefined) =>
  (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmitted?.();
  };

export interface SoneAgentPromptInputProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "rows"
> {
  /** The field's accessible name (it has no visible label); `null` leaves it out. */
  readonly ariaLabel?: string | null;
  readonly ref?: Ref<HTMLTextAreaElement>;
}

/** The prompt's textarea: Enter sends, Shift+Enter breaks the line, IME composition is left alone. */
export function renderPromptInput(
  slot: string,
  m: SoneMessages,
  { ariaLabel, onKeyDown, ...rest }: SoneAgentPromptInputProps,
): ReactElement {
  const onKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    if (
      event.key !== "Enter" ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    event.preventDefault();
    event.currentTarget.form?.requestSubmit();
  };
  return (
    <textarea
      data-slot={slot}
      rows={1}
      aria-label={
        ariaLabel === undefined ? m.agentPromptLabel : (ariaLabel ?? undefined)
      }
      onKeyDown={onKey}
      {...rest}
    />
  );
}
