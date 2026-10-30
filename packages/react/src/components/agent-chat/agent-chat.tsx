"use client";

import { createElement, type ReactElement, type ReactNode } from "react";

import {
  agentClock,
  agentGlyph,
  agentInitials,
  agentIsoTime,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { SoneIcon } from "../icon/icon";
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
} from "../terminal/agent-shared";

export type SoneAgentChatProps = SoneAgentFrameProps;
export type SoneAgentChatLogProps = SoneAgentLogProps;
export interface SoneAgentChatMessageProps extends SoneAgentEntryProps {
  /** What stands in the avatar instead of the speaker's initials, such as the mark of the app that spoke. */
  readonly avatar?: ReactNode;
}
export type SoneAgentChatDividerProps = SoneAgentDividerProps;
export type SoneAgentChatStatusProps = SoneAgentStatusProps;
export type SoneAgentChatComposerProps = SoneAgentPromptProps;
export type SoneAgentChatComposerInputProps = SoneAgentPromptInputProps;

/**
 * `<sone-agent-chat>` — the frame of an agent conversation shown as a chat: the thread
 * (`SoneAgentChatLog`), the agent's live status (`SoneAgentChatStatus`) and the composer
 * (`SoneAgentChatComposer`). Every part takes the same props as its `SoneTerminal*` twin, so
 * an app switches between the two views without touching its data.
 */
export function SoneAgentChat(props: SoneAgentChatProps): ReactElement {
  return renderFrame("sone-agent-chat", "agent-chat", props);
}

/** `<sone-agent-chat-log>` — the scrolling `role="log"`: follows the newest message, offers “Jump to newest”. */
export function SoneAgentChatLog(props: SoneAgentChatLogProps): ReactElement {
  return useAgentLog(
    "sone-agent-chat-log",
    "agent-chat-log",
    (m) => m.agentChatLabel,
    props,
  );
}

/**
 * `<sone-agent-chat-message>` — one entry. The person's messages are accent bubbles on the right;
 * an agent's sit on the left under its avatar, name and time; `kind="activity"` is a quiet line
 * of tool work with no bubble. `meta` sits at the end of the bubble, `detail` under it.
 */
export function SoneAgentChatMessage({
  from = "agent",
  kind = "message",
  speaker = null,
  to = null,
  time = null,
  tone = "default",
  glyph = null,
  hue = null,
  note = null,
  avatar,
  children,
  meta,
  detail,
  style,
  ...rest
}: SoneAgentChatMessageProps): ReactElement {
  const m = useSoneMessages();
  const who = entryWho(speaker, from, m);
  const clock = agentClock(time);
  const mark = kind === "activity" ? agentGlyph(from, kind, glyph) : null;
  return createElement(
    "sone-agent-chat-message",
    {
      ...entryHost("agent-chat-message", { from, kind, tone, hue, style }),
      ...rest,
    },
    <span data-slot="agent-chat-message-avatar" aria-hidden="true">
      {avatar ?? agentInitials(who)}
    </span>,
    <div data-slot="agent-chat-message-main">
      <div data-slot="agent-chat-message-header">
        {who ? <span data-slot="agent-chat-message-speaker">{who}</span> : null}
        {to ? renderTo("agent-chat-message-to", to, m) : null}
        {clock ? (
          <time
            data-slot="agent-chat-message-time"
            dateTime={agentIsoTime(time) ?? undefined}
          >
            {clock}
          </time>
        ) : null}
        {note ? <span data-slot="agent-chat-message-note">{note}</span> : null}
      </div>
      <div data-slot="agent-chat-message-bubble">
        {mark ? (
          <span data-slot="agent-chat-message-glyph" aria-hidden="true">
            {mark}
          </span>
        ) : null}
        <div data-slot="agent-chat-message-text">{children}</div>
        <div data-slot="agent-chat-message-meta">{meta}</div>
      </div>
      <div data-slot="agent-chat-message-detail">{detail}</div>
    </div>,
  );
}

/** `<sone-agent-chat-divider>` — a run boundary or a turn summary across the thread. */
export function SoneAgentChatDivider(
  props: SoneAgentChatDividerProps,
): ReactElement {
  return renderDivider("sone-agent-chat-divider", "agent-chat-divider", props);
}

function chatIndicator(state: SoneAgentChatStatusProps["state"]) {
  switch (state) {
    case "done":
      return <SoneIcon icon="check" size="sm" />;
    case "error":
      return <SoneIcon icon="circle-x" size="sm" />;
    case "idle":
    case "waiting":
    case undefined:
      return <i />;
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
 * `<sone-agent-chat-status>` — what the agent is doing right now, under the thread: its avatar
 * (ringed while busy), an animated mark, the sentence (“Lead is working”), the running time, the
 * detail (`children`) and `actions` (Interrupt).
 */
export function SoneAgentChatStatus(
  props: SoneAgentChatStatusProps,
): ReactElement {
  const { host, text, time } = useAgentStatus("agent-chat-status", props);
  return createElement(
    "sone-agent-chat-status",
    { ...host, ...statusRest(props) },
    props.speaker ? (
      <span data-slot="agent-chat-status-avatar" aria-hidden="true">
        {agentInitials(props.speaker)}
      </span>
    ) : null,
    <div data-slot="agent-chat-status-bubble">
      <span data-slot="agent-chat-status-indicator" aria-hidden="true">
        {chatIndicator(props.state)}
      </span>
      {text}
      {time}
      <span data-slot="agent-chat-status-detail">{props.children}</span>
    </div>,
    <span data-slot="agent-chat-status-actions">{props.actions}</span>,
  );
}

/** `<sone-agent-chat-composer>` — the message box around a `SoneAgentChatComposerInput`. */
export function SoneAgentChatComposer({
  onSubmitted,
  children,
  actions,
  ...rest
}: SoneAgentChatComposerProps): ReactElement {
  return createElement(
    "sone-agent-chat-composer",
    { "data-slot": "agent-chat-composer", ...rest },
    <form
      data-slot="agent-chat-composer-form"
      onSubmit={submitHandler(onSubmitted)}
    >
      {children}
      <div data-slot="agent-chat-composer-actions">{actions}</div>
    </form>,
  );
}

/** The composer's field (`<textarea>`): Enter sends, Shift+Enter breaks the line. */
export function SoneAgentChatComposerInput(
  props: SoneAgentChatComposerInputProps,
): ReactElement {
  return renderPromptInput(
    "agent-chat-composer-input",
    useSoneMessages(),
    props,
  );
}
