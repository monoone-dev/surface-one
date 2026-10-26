import {
  computed,
  defineComponent,
  h,
  inject,
  provide,
  ref,
  type ComputedRef,
  type InjectionKey,
  type PropType,
} from "vue";

import { useSoneMessages } from "../../composables/messages";
import { asProp, definePart, flag, renderAs } from "../../utils/part";
import { flatten } from "../../utils/vnodes";
import { SoneBubble, type BubbleVariant } from "../bubble/bubble";
import { SoneButton } from "../button/button";
import { SoneMessageContent } from "../message/message";
import { SoneSpinner } from "../spinner/spinner";

export type ChatMessageFrom = "user" | "assistant";

// ── Pane ──────────────────────────────────────────────────────────────────────

/** `[soneChatPane]` — the chat frame: a card unless `bare`. */
export const SoneChatPane = definePart({
  name: "SoneChatPane",
  tag: "div",
  slot: "chat-pane",
  props: { bare: { type: Boolean, default: false } },
  attrs: (p) => ({
    class: p.bare ? undefined : "card",
    "data-bare": flag(p.bare),
  }),
});

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

/** What a `SoneChatThread` template ref exposes. */
export interface SoneChatThreadExposed {
  /** Scrolls to the newest message. */
  scrollToEnd(): void;
}

/**
 * `<sone-chat-thread>` — the scrolling conversation, a polite `role="log"`. The owner
 * calls `scrollToEnd()` (a template ref) after it appends a message.
 */
export const SoneChatThread = defineComponent({
  name: "SoneChatThread",
  props: {
    /** The log's accessible name (default: the "Conversation" message). */
    label: { type: String, default: undefined },
  },
  setup(props, { slots, expose }) {
    const messages = useSoneMessages();
    const host = ref<HTMLElement | null>(null);
    const exposed: SoneChatThreadExposed = {
      scrollToEnd: () => {
        const el = host.value;
        if (el) el.scrollTop = el.scrollHeight;
      },
    };
    expose(exposed);
    return () =>
      h(
        "sone-chat-thread",
        {
          ref: host,
          "data-slot": "chat-thread",
          role: "log",
          "aria-live": "polite",
          // The thread scrolls: it takes focus so the keyboard can scroll it too.
          tabindex: 0,
          "aria-label": props.label ?? messages.value.chatConversation,
        },
        slots.default?.(),
      );
  },
});

// ── Message ───────────────────────────────────────────────────────────────────

const CHAT_MESSAGE: InjectionKey<ComputedRef<ChatMessageFrom>> =
  Symbol("SONE_CHAT_MESSAGE");

/**
 * The text of a `SoneChatMessage`, drawn in its bubble (`[soneChatMessageContent]`).
 * Its accessible name says who spoke ("You said" / "Assistant said") unless `label`
 * gives another.
 */
export const SoneChatMessageContent = defineComponent({
  name: "SoneChatMessageContent",
  props: {
    ...asProp,
    label: { type: String, default: undefined },
  },
  setup(props, { slots }) {
    const messages = useSoneMessages();
    const from = inject(CHAT_MESSAGE, null);
    return () =>
      renderAs(
        props.as ?? "div",
        {
          "data-slot": "bubble-content",
          "aria-label":
            props.label ??
            (from?.value === "user"
              ? messages.value.chatYouSaid
              : messages.value.chatAssistantSaid),
        },
        slots,
      );
  },
});

/**
 * `<sone-chat-message>` — one turn. The person's text is a bubble at the end, the
 * assistant's a ghost bubble at the start (`variant` overrides it). The bubble wraps the
 * `SoneChatMessageContent`; anything else (a typing indicator, sources) follows it.
 */
export const SoneChatMessage = defineComponent({
  name: "SoneChatMessage",
  props: {
    from: { type: String as PropType<ChatMessageFrom>, required: true },
    variant: {
      type: String as PropType<BubbleVariant | null>,
      default: null,
    },
  },
  setup(props, { slots }) {
    provide(
      CHAT_MESSAGE,
      computed(() => props.from),
    );
    return () => {
      const align = props.from === "user" ? "end" : "start";
      const nodes = flatten(slots.default?.());
      const text = nodes.filter((n) => n.type === SoneChatMessageContent);
      const rest = nodes.filter((n) => n.type !== SoneChatMessageContent);
      return h(
        "sone-chat-message",
        {
          class: {
            "is-user": props.from === "user",
            "is-assistant": props.from === "assistant",
          },
          "data-slot": "message",
          "data-align": align,
          "data-from": props.from,
        },
        h(SoneMessageContent, null, () => [
          text.length
            ? h(
                SoneBubble,
                {
                  variant:
                    props.variant ??
                    (props.from === "user" ? "default" : "ghost"),
                  align,
                },
                () => text,
              )
            : null,
          ...rest,
        ]),
      );
    };
  },
});

// ── Typing indicator ──────────────────────────────────────────────────────────

/** `<sone-typing-indicator>` — a marker with a spinner and a shimmering "Thinking…". */
export const SoneTypingIndicator = defineComponent({
  name: "SoneTypingIndicator",
  props: {
    label: { type: String, default: undefined },
  },
  setup(props) {
    const messages = useSoneMessages();
    return () => {
      const label = props.label ?? messages.value.chatThinking;
      return h(
        "sone-typing-indicator",
        {
          "data-slot": "marker",
          "data-variant": "default",
          "aria-label": label,
        },
        [
          h(
            "span",
            { "data-slot": "marker-icon", "aria-hidden": "true" },
            h(SoneSpinner, { size: 16, label: null }),
          ),
          h(
            "span",
            { class: "shimmer", "data-slot": "marker-content" },
            `${label}…`,
          ),
        ],
      );
    };
  },
});

// ── Suggestion chips ──────────────────────────────────────────────────────────

/** `<sone-suggestion-chips>` — starter questions as outline buttons; `picked` gets the text. */
export const SoneSuggestionChips = defineComponent({
  name: "SoneSuggestionChips",
  props: {
    suggestions: {
      type: Array as PropType<readonly string[]>,
      default: () => [],
    },
    disabled: { type: Boolean, default: false },
    /** The group's accessible name (default: the "Suggested questions" message). */
    label: { type: String, default: undefined },
  },
  emits: {
    picked: (suggestion: string) => typeof suggestion === "string",
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    return () =>
      h(
        "sone-suggestion-chips",
        {
          "data-slot": "suggestions",
          role: "group",
          "aria-label": props.label ?? messages.value.chatSuggestions,
        },
        props.suggestions.map((s, i) =>
          h(
            SoneButton,
            {
              key: s,
              variant: "outline",
              size: "sm",
              type: "button",
              style: { "--i": i },
              disabled: props.disabled,
              onClick: () => emit("picked", s),
            },
            () => s,
          ),
        ),
      );
  },
});
