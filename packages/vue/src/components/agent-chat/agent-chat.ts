import { computed, defineComponent, h, ref } from "vue";

// The agent types (AgentState, AgentTone, …) are exported once, from ../terminal.

import { useSoneMessages } from "../../composables/messages";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import {
  agentEntryProps,
  agentLogProps,
  agentStatusProps,
  defineAgentDivider,
  defineAgentPromptInput,
  renderAgentTo,
  submitHandler,
  useAgentEntry,
  useAgentLog,
  useAgentStatus,
} from "../terminal/agent-shared";

/**
 * `<sone-agent-chat>` — the frame of an agent conversation shown as a chat: the thread
 * (`SoneAgentChatLog`), the agent's live status (`SoneAgentChatStatus`) and the composer
 * (`SoneAgentChatComposer`). Every part takes the same props as its `SoneTerminal*` twin.
 */
export const SoneAgentChat = defineComponent({
  name: "SoneAgentChat",
  setup(_, { slots }) {
    return () =>
      h("sone-agent-chat", { "data-slot": "agent-chat" }, slots.default?.());
  },
});

/** `<sone-agent-chat-log>` — the scrolling `role="log"`: follows the newest message, offers “Jump to newest”. */
export const SoneAgentChatLog = defineComponent({
  name: "SoneAgentChatLog",
  props: agentLogProps,
  setup(props, { slots, expose }) {
    const messages = useSoneMessages();
    const viewport = ref<HTMLElement | null>(null);
    const log = useAgentLog(viewport, () => props.follow);
    expose({ scrollToEnd: log.scrollToEnd });
    return () =>
      h("sone-agent-chat-log", { "data-slot": "agent-chat-log" }, [
        h(
          "div",
          {
            ref: viewport,
            "data-slot": "agent-chat-log-viewport",
            role: "log",
            "aria-live": "polite",
            tabindex: "0",
            "aria-label": props.label ?? messages.value.agentChatLabel,
          },
          slots.default?.(),
        ),
        log.atEnd.value
          ? null
          : h(
              SoneButton,
              {
                type: "button",
                variant: "secondary",
                size: "sm",
                "data-slot": "agent-chat-log-jump",
                onClick: () => log.scrollToEnd(),
              },
              () => [
                h(SoneIcon, { icon: "arrow-down" }),
                messages.value.agentJumpToNewest,
              ],
            ),
      ]);
  },
});

/**
 * `<sone-agent-chat-message>` — one entry. The person's messages are accent bubbles on the
 * right; an agent's sit on the left under its avatar, name and time; `kind="activity"` is a
 * quiet line of tool work. The `meta` slot sits at the end of the bubble, `detail` under it.
 */
export const SoneAgentChatMessage = defineComponent({
  name: "SoneAgentChatMessage",
  props: agentEntryProps,
  setup(props, { slots }) {
    const entry = useAgentEntry(props);
    const activityMark = computed(() =>
      props.kind === "activity" ? entry.mark.value : null,
    );
    return () =>
      h("sone-agent-chat-message", entry.host("agent-chat-message"), [
        h(
          "span",
          { "data-slot": "agent-chat-message-avatar", "aria-hidden": "true" },
          entry.initials.value,
        ),
        h("div", { "data-slot": "agent-chat-message-main" }, [
          h("div", { "data-slot": "agent-chat-message-header" }, [
            entry.who.value
              ? h(
                  "span",
                  { "data-slot": "agent-chat-message-speaker" },
                  entry.who.value,
                )
              : null,
            props.to
              ? renderAgentTo(
                  "agent-chat-message-to",
                  props.to,
                  entry.messages.value.agentTo,
                )
              : null,
            entry.clock.value
              ? h(
                  "time",
                  {
                    "data-slot": "agent-chat-message-time",
                    datetime: entry.iso.value ?? undefined,
                  },
                  entry.clock.value,
                )
              : null,
          ]),
          h("div", { "data-slot": "agent-chat-message-bubble" }, [
            activityMark.value
              ? h(
                  "span",
                  {
                    "data-slot": "agent-chat-message-glyph",
                    "aria-hidden": "true",
                  },
                  activityMark.value,
                )
              : null,
            h(
              "div",
              { "data-slot": "agent-chat-message-text" },
              slots.default?.(),
            ),
            h(
              "div",
              { "data-slot": "agent-chat-message-meta" },
              slots.meta?.(),
            ),
          ]),
          h(
            "div",
            { "data-slot": "agent-chat-message-detail" },
            slots.detail?.(),
          ),
        ]),
      ]);
  },
});

/** `<sone-agent-chat-divider>` — a run boundary or a turn summary across the thread. */
export const SoneAgentChatDivider = defineAgentDivider(
  "SoneAgentChatDivider",
  "agent-chat-divider",
);

/**
 * `<sone-agent-chat-status>` — what the agent is doing right now, under the thread: its avatar
 * (ringed while busy), an animated mark, the sentence (“Lead is working”), the running time,
 * the default slot (what it is doing) and the `actions` slot (Interrupt).
 */
export const SoneAgentChatStatus = defineComponent({
  name: "SoneAgentChatStatus",
  props: agentStatusProps,
  setup(props, { slots }) {
    const status = useAgentStatus(props);
    const indicator = () => {
      switch (props.state) {
        case "done":
          return h(SoneIcon, { icon: "check", size: "sm" });
        case "error":
          return h(SoneIcon, { icon: "circle-x", size: "sm" });
        case "idle":
        case "waiting":
          return h("i");
        default:
          return [h("i"), h("i"), h("i")];
      }
    };
    return () =>
      h("sone-agent-chat-status", status.host("agent-chat-status"), [
        props.speaker
          ? h(
              "span",
              {
                "data-slot": "agent-chat-status-avatar",
                "aria-hidden": "true",
              },
              status.initials.value,
            )
          : null,
        h("div", { "data-slot": "agent-chat-status-bubble" }, [
          h(
            "span",
            {
              "data-slot": "agent-chat-status-indicator",
              "aria-hidden": "true",
            },
            [indicator()],
          ),
          h(
            "span",
            {
              "data-slot": "agent-chat-status-text",
              role: "status",
              "aria-live": "polite",
            },
            status.sentence.value,
          ),
          status.timer("agent-chat-status-time"),
          h(
            "span",
            { "data-slot": "agent-chat-status-detail" },
            slots.default?.(),
          ),
        ]),
        h(
          "span",
          { "data-slot": "agent-chat-status-actions" },
          slots.actions?.(),
        ),
      ]);
  },
});

/** `<sone-agent-chat-composer>` — the message box around a `SoneAgentChatComposerInput`; `actions` slot for Send. */
export const SoneAgentChatComposer = defineComponent({
  name: "SoneAgentChatComposer",
  emits: {
    /** The person sent (Enter, or a submit button inside). */
    submitted: () => true,
  },
  setup(_, { slots, emit }) {
    const onSubmit = submitHandler(() => emit("submitted"));
    return () =>
      h("sone-agent-chat-composer", { "data-slot": "agent-chat-composer" }, [
        h("form", { "data-slot": "agent-chat-composer-form", onSubmit }, [
          slots.default?.(),
          h(
            "div",
            { "data-slot": "agent-chat-composer-actions" },
            slots.actions?.(),
          ),
        ]),
      ]);
  },
});

/** The composer's field (`v-model`): Enter sends, Shift+Enter breaks the line. */
export const SoneAgentChatComposerInput = defineAgentPromptInput(
  "SoneAgentChatComposerInput",
  "agent-chat-composer-input",
);
