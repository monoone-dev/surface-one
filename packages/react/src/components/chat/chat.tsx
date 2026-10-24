"use client";

import {
  createContext,
  createElement,
  isValidElement,
  useContext,
  useImperativeHandle,
  useMemo,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { flattenChildren } from "@surface-one/core/react/children";

import { useSoneMessages } from "../../context/messages";
import { cx, definePart, flag, type PolymorphicProps } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";
import { SoneBubble, type BubbleVariant } from "../bubble/bubble";
import { SoneButton } from "../button/button";
import { SoneMessageContent } from "../message/message";
import { SoneSpinner } from "../spinner/spinner";

export type ChatMessageFrom = "user" | "assistant";

// ── Pane ──────────────────────────────────────────────────────────────────────

export interface SoneChatPaneOwnProps {
  /** No card chrome (border, background, radius). */
  readonly bare?: boolean;
}

/** `[soneChatPane]` — the chat frame: a card unless `bare`. */
export function SoneChatPane<E extends ElementType = "div">({
  as,
  bare = false,
  className,
  ...rest
}: PolymorphicProps<E, SoneChatPaneOwnProps>): ReactElement {
  return createElement(as ?? "div", {
    "data-slot": "chat-pane",
    "data-bare": flag(bare),
    ...rest,
    className: cx(bare ? undefined : "card", className),
  });
}

export const SoneChatPaneHeader = definePart({
  name: "SoneChatPaneHeader",
  tag: "div",
  slot: "chat-pane-header",
});

export const SoneChatPaneHeading = definePart({
  name: "SoneChatPaneHeading",
  tag: "div",
  slot: "chat-pane-heading",
});

export const SoneChatPaneTitle = definePart({
  name: "SoneChatPaneTitle",
  tag: "h3",
  slot: "chat-pane-title",
});

export const SoneChatPaneDescription = definePart({
  name: "SoneChatPaneDescription",
  tag: "span",
  slot: "chat-pane-description",
});

export const SoneChatPaneActions = definePart({
  name: "SoneChatPaneActions",
  tag: "div",
  slot: "chat-pane-actions",
});

// ── Thread ────────────────────────────────────────────────────────────────────

/** What a chat thread's `handleRef` exposes. */
export interface SoneChatThreadHandle {
  /** Scrolls to the newest message. */
  scrollToEnd(): void;
}

export interface SoneChatThreadProps extends HTMLAttributes<HTMLElement> {
  /** The log's accessible name (default: the "Conversation" message). */
  readonly label?: string;
  /** `scrollToEnd()`, for the owner to call after it appends a message. */
  readonly handleRef?: Ref<SoneChatThreadHandle>;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-chat-thread>` — the scrolling conversation, a polite `role="log"`. */
export function SoneChatThread({
  label,
  handleRef,
  ref,
  children,
  ...rest
}: SoneChatThreadProps): ReactElement {
  const m = useSoneMessages();
  const host = useRef<HTMLElement | null>(null);
  const hostRef = useMemo(() => mergeRefs(host, ref as never), [ref]);
  useImperativeHandle(handleRef, () => ({
    scrollToEnd: () => {
      const el = host.current;
      if (el) el.scrollTop = el.scrollHeight;
    },
  }));
  return createElement(
    "sone-chat-thread",
    {
      "data-slot": "chat-thread",
      role: "log",
      "aria-live": "polite",
      "aria-label": label ?? m.chatConversation,
      ...rest,
      ref: hostRef,
    },
    children,
  );
}

// ── Message ───────────────────────────────────────────────────────────────────

const ChatMessageContext = createContext<ChatMessageFrom | null>(null);

export interface SoneChatMessageContentOwnProps {
  /** The accessible name (default: "You said" / "Assistant said", by sender). */
  readonly label?: string;
}

/**
 * The text of a `SoneChatMessage`, drawn in its bubble (`[soneChatMessageContent]`).
 * Its accessible name says who spoke unless `label` gives another.
 */
export function SoneChatMessageContent<E extends ElementType = "div">({
  as,
  label,
  ...rest
}: PolymorphicProps<E, SoneChatMessageContentOwnProps>): ReactElement {
  const m = useSoneMessages();
  const from = useContext(ChatMessageContext);
  return createElement(as ?? "div", {
    "data-slot": "bubble-content",
    "aria-label":
      label ?? (from === "user" ? m.chatYouSaid : m.chatAssistantSaid),
    ...rest,
  });
}

export interface SoneChatMessageProps extends HTMLAttributes<HTMLElement> {
  readonly from: ChatMessageFrom;
  /** The bubble's variant (default: `default` for the person, `ghost` for the assistant). */
  readonly variant?: BubbleVariant | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-chat-message>` — one turn. The person's text is a bubble at the end, the
 * assistant's a ghost bubble at the start. The bubble wraps the `SoneChatMessageContent`;
 * anything else (a typing indicator, sources) follows it.
 */
export function SoneChatMessage({
  from,
  variant = null,
  className,
  children,
  ...rest
}: SoneChatMessageProps): ReactElement {
  const align = from === "user" ? "end" : "start";
  const nodes = flattenChildren(children);
  const isText = (n: ReactNode): boolean =>
    isValidElement(n) && n.type === SoneChatMessageContent;
  const text = nodes.filter(isText);
  const others = nodes.filter((n) => !isText(n));
  return createElement(
    "sone-chat-message",
    {
      "data-slot": "message",
      "data-align": align,
      "data-from": from,
      ...rest,
      className: cx(
        from === "user" && "is-user",
        from === "assistant" && "is-assistant",
        className,
      ),
    },
    <ChatMessageContext.Provider value={from}>
      <SoneMessageContent>
        {text.length ? (
          <SoneBubble
            variant={variant ?? (from === "user" ? "default" : "ghost")}
            align={align}
          >
            {text}
          </SoneBubble>
        ) : null}
        {others}
      </SoneMessageContent>
    </ChatMessageContext.Provider>,
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

export interface SoneTypingIndicatorProps extends HTMLAttributes<HTMLElement> {
  /** What the assistant is doing (default: the "Thinking" message). */
  readonly label?: string;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-typing-indicator>` — a marker with a spinner and a shimmering "Thinking…". */
export function SoneTypingIndicator({
  label: labelProp,
  ...rest
}: SoneTypingIndicatorProps): ReactElement {
  const m = useSoneMessages();
  const label = labelProp ?? m.chatThinking;
  return createElement(
    "sone-typing-indicator",
    {
      "data-slot": "marker",
      "data-variant": "default",
      "aria-label": label,
      ...rest,
    },
    <span data-slot="marker-icon" aria-hidden="true">
      <SoneSpinner size={16} label={null} />
    </span>,
    <span className="shimmer" data-slot="marker-content">
      {`${label}…`}
    </span>,
  );
}

// ── Suggestion chips ──────────────────────────────────────────────────────────

export interface SoneSuggestionChipsProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly suggestions?: readonly string[];
  readonly disabled?: boolean;
  /** The group's accessible name (default: the "Suggested questions" message). */
  readonly label?: string;
  /** A chip was clicked, with its text. */
  readonly onPicked?: (suggestion: string) => void;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-suggestion-chips>` — starter questions as outline buttons. */
export function SoneSuggestionChips({
  suggestions = [],
  disabled = false,
  label,
  onPicked,
  ...rest
}: SoneSuggestionChipsProps): ReactElement {
  const m = useSoneMessages();
  return createElement(
    "sone-suggestion-chips",
    {
      "data-slot": "suggestions",
      role: "group",
      "aria-label": label ?? m.chatSuggestions,
      ...rest,
    },
    suggestions.map((s, i) => (
      <SoneButton
        key={s}
        variant="outline"
        size="sm"
        type="button"
        style={{ "--i": i } as CSSProperties}
        disabled={disabled}
        onClick={() => onPicked?.(s)}
      >
        {s}
      </SoneButton>
    )),
  );
}
