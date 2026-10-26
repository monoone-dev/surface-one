"use client";

import {
  createElement,
  useId,
  useState,
  type CSSProperties,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  agentClock,
  agentHueStyle,
  agentInitials,
  agentIsoTime,
  agentQuestionKey,
  type AgentTime,
} from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneKbd } from "../kbd/kbd";

/** One answer of an agent's question: what it says and, under it, what it leads to. */
export interface AgentQuestionOption {
  readonly label: string;
  readonly hint?: string;
}

export interface SoneAgentChatQuestionProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  /** Who asks: its name, shown with its initials. */
  readonly who?: string | null;
  /** When it asked. */
  readonly time?: AgentTime | null;
  /** The question itself. */
  readonly question?: string;
  /** Why it asks, in one line. */
  readonly reason?: string | null;
  /** The answers to pick from (keys `1`…`9`). */
  readonly options?: readonly AgentQuestionOption[];
  /** The own-answer field's placeholder. */
  readonly placeholder?: string | null;
  /** A speaker colour, `1`–`8` (the chart hues). */
  readonly hue?: number | null;
  /** The key hints row under the field. */
  readonly hints?: boolean;
  /** The picked option's label, or the trimmed text written in the field. */
  readonly onAnswer?: (answer: string) => void;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-agent-chat-question>` — a question an agent asks in the thread and waits on: who asks
 * with a “Needs you” badge, the `question` and its `reason`, the `options` as rows, and a field
 * for your own words. Keys `1`…`9` pick an answer while the field is empty; Enter sends what you
 * wrote. `onAnswer` gets the option's label or your trimmed text.
 */
export function SoneAgentChatQuestion({
  who = null,
  time = null,
  question = "",
  reason = null,
  options = [],
  placeholder = null,
  hue = null,
  hints = true,
  onAnswer,
  onKeyDown,
  style,
  ...rest
}: SoneAgentChatQuestionProps): ReactElement {
  const m = useSoneMessages();
  const titleId = `sone-agent-chat-question-${useId()}-title`;
  const [draft, setDraft] = useState("");
  const clock = agentClock(time);
  const keyed = options.slice(0, 9);
  const hueVars = agentHueStyle(hue);

  const send = (event?: { preventDefault(): void }): void => {
    event?.preventDefault();
    const text = draft.trim();
    if (!text) return;
    onAnswer?.(text);
    setDraft("");
  };
  const onKey = (event: KeyboardEvent<HTMLElement>): void => {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;
    const action = agentQuestionKey(
      {
        key: event.key,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        altKey: event.altKey,
        isComposing: event.nativeEvent.isComposing,
        target: event.target,
      },
      options.length,
    );
    if (action === null) return;
    if (action.kind === "send") return send(event);
    const option = options[action.index];
    if (!option) return;
    event.preventDefault();
    onAnswer?.(option.label);
  };

  return createElement(
    "sone-agent-chat-question",
    {
      "data-slot": "agent-chat-question",
      role: "group",
      "aria-labelledby": titleId,
      style: hueVars ? ({ ...style, ...hueVars } as CSSProperties) : style,
      onKeyDown: onKey,
      ...rest,
    },
    <div data-slot="agent-chat-question-header">
      <span data-slot="agent-chat-question-avatar" aria-hidden="true">
        {agentInitials(who)}
      </span>
      {who ? <span data-slot="agent-chat-question-who">{who}</span> : null}
      <SoneBadge variant="warning" dot>
        {m.agentQuestionNeedsYou}
      </SoneBadge>
      {clock ? (
        <time
          data-slot="agent-chat-question-time"
          dateTime={agentIsoTime(time) ?? undefined}
        >
          {clock}
        </time>
      ) : null}
    </div>,
    <div data-slot="agent-chat-question-body">
      <p data-slot="agent-chat-question-title" id={titleId}>
        {question}
      </p>
      {reason ? <p data-slot="agent-chat-question-reason">{reason}</p> : null}
    </div>,
    options.length ? (
      <div
        data-slot="agent-chat-question-options"
        role="group"
        aria-label={m.agentQuestionAnswers}
      >
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            data-slot="agent-chat-question-option"
            onClick={() => onAnswer?.(option.label)}
          >
            {i < 9 ? <SoneKbd>{String(i + 1)}</SoneKbd> : null}
            <span data-slot="agent-chat-question-option-text">
              <span data-slot="agent-chat-question-option-title">
                {option.label}
              </span>
              {option.hint ? (
                <span data-slot="agent-chat-question-option-hint">
                  {option.hint}
                </span>
              ) : null}
            </span>
            <SoneIcon icon="chevron-right" />
          </button>
        ))}
      </div>
    ) : null,
    <form
      data-slot="agent-chat-question-answer"
      onSubmit={(event: FormEvent<HTMLFormElement>) => send(event)}
    >
      <input
        data-slot="agent-chat-question-input"
        type="text"
        autoComplete="off"
        aria-label={m.agentQuestionYourAnswer}
        placeholder={placeholder ?? m.agentQuestionPlaceholder}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
      <SoneButton
        type="submit"
        size="icon-sm"
        disabled={draft.trim() === ""}
        aria-label={m.agentQuestionSend}
      >
        <SoneIcon icon="arrow-up" />
      </SoneButton>
    </form>,
    hints ? (
      <p data-slot="agent-chat-question-keys">
        {keyed.length ? (
          <>
            <span data-slot="agent-chat-question-key">
              {keyed.map((_, i) => (
                <SoneKbd key={i}>{String(i + 1)}</SoneKbd>
              ))}
              <span>{m.agentQuestionToAnswer}</span>
            </span>
            <span aria-hidden="true">·</span>
          </>
        ) : null}
        <span data-slot="agent-chat-question-key">
          <SoneKbd>/</SoneKbd>
          <span>{m.agentQuestionCommands}</span>
        </span>
        <span aria-hidden="true">·</span>
        <span data-slot="agent-chat-question-key">
          <SoneKbd>⌘K</SoneKbd>
          <span>{m.agentQuestionAnywhere}</span>
        </span>
      </p>
    ) : null,
  );
}

export interface SoneAgentChatThoughtProps extends HTMLAttributes<HTMLElement> {
  /** How long the agent thought, in whole seconds. */
  readonly seconds?: number;
  /** The reasoning panel shows, controlled with `onOpenChange` (the Vue `v-model:open`). */
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  /** The reasoning. */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-agent-chat-thought>` — an agent's reasoning folded into a quiet row (“Thought for 12
 * seconds ›”) that opens a ruled panel with the children.
 */
export function SoneAgentChatThought({
  seconds = 0,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  ...rest
}: SoneAgentChatThoughtProps): ReactElement {
  const m = useSoneMessages();
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange);
  const panelId = `sone-agent-chat-thought-${useId()}-panel`;
  return createElement(
    "sone-agent-chat-thought",
    {
      "data-slot": "agent-chat-thought",
      "data-open": open ? "" : undefined,
      ...rest,
    },
    <button
      type="button"
      data-slot="agent-chat-thought-trigger"
      aria-expanded={open}
      aria-controls={panelId}
      onClick={() => setOpen(!open)}
    >
      <SoneIcon icon="lightbulb" />
      <span data-slot="agent-chat-thought-label">
        {m.agentThought(Math.max(0, Math.round(seconds)))}
      </span>
      <SoneIcon icon="chevron-right" />
    </button>,
    <div data-slot="agent-chat-thought-panel" id={panelId} hidden={!open}>
      {children}
    </div>,
  );
}
