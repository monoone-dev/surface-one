"use client";

import { createElement, type ReactElement } from "react";

import { agentClock, agentGlyph, agentIsoTime } from "@surface-one/core";

export type {
  AgentEntryKind,
  AgentFrom,
  AgentState,
  AgentTime,
  AgentTone,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import {
  entryHost,
  entryWho,
  renderDivider,
  renderFrame,
  renderPromptInput,
  renderTo,
  statusRest,
  submitHandler,
  useAgentLog,
  useAgentStatus,
  type SoneAgentDividerProps,
  type SoneAgentEntryProps,
  type SoneAgentFrameProps,
  type SoneAgentLogProps,
  type SoneAgentPromptInputProps,
  type SoneAgentPromptProps,
  type SoneAgentStatusProps,
} from "./agent-shared";

export type { SoneAgentLogHandle } from "./agent-shared";

export type SoneTerminalProps = SoneAgentFrameProps;
export type SoneTerminalLogProps = SoneAgentLogProps;
export type SoneTerminalLineProps = SoneAgentEntryProps;
export type SoneTerminalDividerProps = SoneAgentDividerProps;
export type SoneTerminalStatusProps = SoneAgentStatusProps;
export type SoneTerminalPromptProps = SoneAgentPromptProps;
export type SoneTerminalPromptInputProps = SoneAgentPromptInputProps;

/**
 * `<sone-terminal>` — the frame of an agent conversation shown as a terminal: a monospace log
 * (`SoneTerminalLog`), the agent's live status (`SoneTerminalStatus`) and the prompt
 * (`SoneTerminalPrompt`). `SoneAgentChat` takes the very same parts as a chat.
 */
export function SoneTerminal(props: SoneTerminalProps): ReactElement {
  return renderFrame("sone-terminal", "terminal", props);
}

/** `<sone-terminal-log>` — the scrolling `role="log"`: follows the newest line, offers “Jump to newest”. */
export function SoneTerminalLog(props: SoneTerminalLogProps): ReactElement {
  return useAgentLog(
    "sone-terminal-log",
    "terminal-log",
    (m) => m.terminalLabel,
    props,
  );
}

/**
 * `<sone-terminal-line>` — one entry: time, speaker (`You → Lead`), glyph and text. The person's
 * lines stand out; `kind="activity"` is a quiet, one-line record of tool work. `meta` sits at the
 * end of the line, `detail` under it (an expanded body, a command's output).
 */
export function SoneTerminalLine({
  from = "agent",
  kind = "message",
  speaker = null,
  to = null,
  time = null,
  tone = "default",
  glyph = null,
  hue = null,
  note = null,
  children,
  meta,
  detail,
  style,
  ...rest
}: SoneTerminalLineProps): ReactElement {
  const m = useSoneMessages();
  const who = entryWho(speaker, from, m);
  const mark = agentGlyph(from, kind, glyph);
  return createElement(
    "sone-terminal-line",
    {
      ...entryHost("terminal-line", { from, kind, tone, hue, style }),
      ...rest,
    },
    <time
      data-slot="terminal-line-time"
      dateTime={agentIsoTime(time) ?? undefined}
    >
      {agentClock(time)}
    </time>,
    <span data-slot="terminal-line-who">
      {who ? <span data-slot="terminal-line-speaker">{who}</span> : null}
      {to ? renderTo("terminal-line-to", to, m) : null}
    </span>,
    <div data-slot="terminal-line-body">
      {mark ? (
        <span data-slot="terminal-line-glyph" aria-hidden="true">
          {mark}
        </span>
      ) : null}
      {note ? <span data-slot="terminal-line-note">{note}</span> : null}
      <div data-slot="terminal-line-text">{children}</div>
      <div data-slot="terminal-line-meta">{meta}</div>
    </div>,
    <div data-slot="terminal-line-detail">{detail}</div>,
  );
}

/** `<sone-terminal-divider>` — a run boundary or a turn summary across the log. */
export function SoneTerminalDivider(
  props: SoneTerminalDividerProps,
): ReactElement {
  return renderDivider("sone-terminal-divider", "terminal-divider", props);
}

function terminalIndicator(state: SoneTerminalStatusProps["state"]) {
  switch (state) {
    case "done":
      return "✓";
    case "error":
      return "✕";
    case "idle":
    case undefined:
      return "○";
    case "waiting":
      return "●";
    default:
      return (
        <>
          <i />
          <i />
          <i />
        </>
      );
  }
}

/**
 * `<sone-terminal-status>` — what the agent is doing right now: an animated mark, the sentence
 * (“Lead is working”), the running time, the detail (`children`) and `actions` (Interrupt).
 */
export function SoneTerminalStatus(
  props: SoneTerminalStatusProps,
): ReactElement {
  const { host, text, time } = useAgentStatus("terminal-status", props);
  return createElement(
    "sone-terminal-status",
    { ...host, ...statusRest(props) },
    <span data-slot="terminal-status-indicator" aria-hidden="true">
      {terminalIndicator(props.state)}
    </span>,
    text,
    time,
    <span data-slot="terminal-status-detail">{props.children}</span>,
    <span data-slot="terminal-status-actions">{props.actions}</span>,
  );
}

/** `<sone-terminal-prompt>` — the `❯` prompt around a `SoneTerminalPromptInput`. */
export function SoneTerminalPrompt({
  onSubmitted,
  children,
  actions,
  ...rest
}: SoneTerminalPromptProps): ReactElement {
  return createElement(
    "sone-terminal-prompt",
    { "data-slot": "terminal-prompt", ...rest },
    <form
      data-slot="terminal-prompt-form"
      onSubmit={submitHandler(onSubmitted)}
    >
      <span data-slot="terminal-prompt-glyph" aria-hidden="true">
        ❯
      </span>
      {children}
      <span data-slot="terminal-prompt-actions">{actions}</span>
    </form>,
  );
}

/** The prompt's field (`<textarea>`): Enter sends, Shift+Enter breaks the line. */
export function SoneTerminalPromptInput(
  props: SoneTerminalPromptInputProps,
): ReactElement {
  return renderPromptInput("terminal-prompt-input", useSoneMessages(), props);
}
