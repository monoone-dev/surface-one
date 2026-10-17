import { defineComponent, h, ref } from "vue";

export type {
  AgentEntryKind,
  AgentFrom,
  AgentState,
  AgentTime,
  AgentTone,
} from "@surface-one/core";

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
} from "./agent-shared";

/**
 * `<sone-terminal>` — the frame of an agent conversation shown as a terminal: a monospace log
 * (`SoneTerminalLog`), the agent's live status (`SoneTerminalStatus`) and the prompt
 * (`SoneTerminalPrompt`). `SoneAgentChat` takes the very same parts as a chat.
 */
export const SoneTerminal = defineComponent({
  name: "SoneTerminal",
  setup(_, { slots }) {
    return () =>
      h("sone-terminal", { "data-slot": "terminal" }, slots.default?.());
  },
});

/** `<sone-terminal-log>` — the scrolling `role="log"`: follows the newest line, offers “Jump to newest”. */
export const SoneTerminalLog = defineComponent({
  name: "SoneTerminalLog",
  props: agentLogProps,
  setup(props, { slots, expose }) {
    const messages = useSoneMessages();
    const viewport = ref<HTMLElement | null>(null);
    const log = useAgentLog(viewport, () => props.follow);
    expose({ scrollToEnd: log.scrollToEnd });
    return () =>
      h("sone-terminal-log", { "data-slot": "terminal-log" }, [
        h(
          "div",
          {
            ref: viewport,
            "data-slot": "terminal-log-viewport",
            role: "log",
            "aria-live": "polite",
            tabindex: "0",
            "aria-label": props.label ?? messages.value.terminalLabel,
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
                "data-slot": "terminal-log-jump",
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
 * `<sone-terminal-line>` — one entry: time, speaker (`You → Lead`), glyph and text. The
 * person's lines stand out; `kind="activity"` is a quiet one-line record of tool work. The
 * `meta` slot sits at the end of the line, the `detail` slot under it.
 */
export const SoneTerminalLine = defineComponent({
  name: "SoneTerminalLine",
  props: agentEntryProps,
  setup(props, { slots }) {
    const entry = useAgentEntry(props);
    return () =>
      h("sone-terminal-line", entry.host("terminal-line"), [
        h(
          "time",
          {
            "data-slot": "terminal-line-time",
            datetime: entry.iso.value ?? undefined,
          },
          entry.clock.value,
        ),
        h("span", { "data-slot": "terminal-line-who" }, [
          entry.who.value
            ? h(
                "span",
                { "data-slot": "terminal-line-speaker" },
                entry.who.value,
              )
            : null,
          props.to
            ? renderAgentTo(
                "terminal-line-to",
                props.to,
                entry.messages.value.agentTo,
              )
            : null,
        ]),
        h("div", { "data-slot": "terminal-line-body" }, [
          entry.mark.value
            ? h(
                "span",
                { "data-slot": "terminal-line-glyph", "aria-hidden": "true" },
                entry.mark.value,
              )
            : null,
          h("div", { "data-slot": "terminal-line-text" }, slots.default?.()),
          h("div", { "data-slot": "terminal-line-meta" }, slots.meta?.()),
        ]),
        h("div", { "data-slot": "terminal-line-detail" }, slots.detail?.()),
      ]);
  },
});

/** `<sone-terminal-divider>` — a run boundary or a turn summary across the log. */
export const SoneTerminalDivider = defineAgentDivider(
  "SoneTerminalDivider",
  "terminal-divider",
);

const TERMINAL_MARKS = {
  done: " ✓ ",
  error: " ✕ ",
  idle: " ○ ",
  waiting: " ● ",
};

/**
 * `<sone-terminal-status>` — what the agent is doing right now: an animated mark, the
 * sentence (“Lead is working”), the running time, the default slot (what it is doing) and the
 * `actions` slot (Interrupt).
 */
export const SoneTerminalStatus = defineComponent({
  name: "SoneTerminalStatus",
  props: agentStatusProps,
  setup(props, { slots }) {
    const status = useAgentStatus(props);
    return () => {
      const mark =
        TERMINAL_MARKS[props.state as keyof typeof TERMINAL_MARKS] ?? null;
      return h("sone-terminal-status", status.host("terminal-status"), [
        h(
          "span",
          { "data-slot": "terminal-status-indicator", "aria-hidden": "true" },
          mark ?? [h("i"), h("i"), h("i")],
        ),
        h(
          "span",
          {
            "data-slot": "terminal-status-text",
            role: "status",
            "aria-live": "polite",
          },
          status.sentence.value,
        ),
        status.timer("terminal-status-time"),
        h("span", { "data-slot": "terminal-status-detail" }, slots.default?.()),
        h(
          "span",
          { "data-slot": "terminal-status-actions" },
          slots.actions?.(),
        ),
      ]);
    };
  },
});

/** `<sone-terminal-prompt>` — the `❯` prompt around a `SoneTerminalPromptInput`; `actions` slot for Send. */
export const SoneTerminalPrompt = defineComponent({
  name: "SoneTerminalPrompt",
  emits: {
    /** The person sent (Enter, or a submit button inside). */
    submitted: () => true,
  },
  setup(_, { slots, emit }) {
    const onSubmit = submitHandler(() => emit("submitted"));
    return () =>
      h("sone-terminal-prompt", { "data-slot": "terminal-prompt" }, [
        h("form", { "data-slot": "terminal-prompt-form", onSubmit }, [
          h(
            "span",
            { "data-slot": "terminal-prompt-glyph", "aria-hidden": "true" },
            "❯",
          ),
          slots.default?.(),
          h(
            "span",
            { "data-slot": "terminal-prompt-actions" },
            slots.actions?.(),
          ),
        ]),
      ]);
  },
});

/** The prompt's field (`v-model`): Enter sends, Shift+Enter breaks the line. */
export const SoneTerminalPromptInput = defineAgentPromptInput(
  "SoneTerminalPromptInput",
  "terminal-prompt-input",
);
