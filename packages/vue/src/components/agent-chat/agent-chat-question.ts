import { computed, defineComponent, h, ref, useId, type PropType } from "vue";

import {
  agentClock,
  agentHueStyle,
  agentInitials,
  agentIsoTime,
  agentQuestionKey,
  type AgentTime,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { useModel } from "../../utils/model";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import { SoneKbd } from "../kbd/kbd";

/** One answer of an agent's question: what it says and, under it, what it leads to. */
export interface AgentQuestionOption {
  readonly label: string;
  readonly hint?: string;
}

/**
 * `<sone-agent-chat-question>` — a question an agent asks in the thread and waits on: who asks
 * with a “Needs you” badge, the `question` and its `reason`, the `options` as rows, and a field
 * for your own words. Keys `1`…`9` pick an answer while the field is empty; Enter sends what
 * you wrote. `answer` emits the option's label or your trimmed text.
 */
export const SoneAgentChatQuestion = defineComponent({
  name: "SoneAgentChatQuestion",
  props: {
    /** Who asks: its name, shown with its initials. */
    who: { type: String as PropType<string | null>, default: null },
    /** When it asked. */
    time: {
      type: [Date, Number, String] as PropType<AgentTime | null>,
      default: null,
    },
    /** The question itself. */
    question: { type: String, default: "" },
    /** Why it asks, in one line. */
    reason: { type: String as PropType<string | null>, default: null },
    /** The answers to pick from (keys `1`…`9`). */
    options: {
      type: Array as PropType<readonly AgentQuestionOption[]>,
      default: () => [],
    },
    /** The own-answer field's placeholder. */
    placeholder: { type: String as PropType<string | null>, default: null },
    /** A speaker colour, `1`–`8` (the chart hues). */
    hue: { type: Number as PropType<number | null>, default: null },
    /** The key hints row under the field. */
    hints: { type: Boolean, default: true },
  },
  emits: {
    /** The picked option's label, or the trimmed text written in the field. */
    answer: (value: string) => typeof value === "string",
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();
    const titleId = `sone-agent-chat-question-${useId()}-title`;
    const draft = ref("");
    const keyed = computed(() => props.options.slice(0, 9));

    const send = (event?: Event): void => {
      event?.preventDefault();
      const text = draft.value.trim();
      if (!text) return;
      emit("answer", text);
      draft.value = "";
    };
    const onKeydown = (event: KeyboardEvent): void => {
      const action = agentQuestionKey(event, props.options.length);
      if (action === null) return;
      if (action.kind === "send") return send(event);
      const option = props.options[action.index];
      if (!option) return;
      event.preventDefault();
      emit("answer", option.label);
    };

    return () => {
      const m = messages.value;
      const clock = agentClock(props.time);
      const canSend = draft.value.trim() !== "";
      return h(
        "sone-agent-chat-question",
        {
          "data-slot": "agent-chat-question",
          role: "group",
          "aria-labelledby": titleId,
          style: agentHueStyle(props.hue),
          onKeydown,
        },
        [
          h("div", { "data-slot": "agent-chat-question-header" }, [
            h(
              "span",
              {
                "data-slot": "agent-chat-question-avatar",
                "aria-hidden": "true",
              },
              agentInitials(props.who),
            ),
            props.who
              ? h("span", { "data-slot": "agent-chat-question-who" }, props.who)
              : null,
            h(
              SoneBadge,
              { variant: "warning", dot: true },
              () => m.agentQuestionNeedsYou,
            ),
            clock
              ? h(
                  "time",
                  {
                    "data-slot": "agent-chat-question-time",
                    datetime: agentIsoTime(props.time) ?? undefined,
                  },
                  clock,
                )
              : null,
          ]),
          h("div", { "data-slot": "agent-chat-question-body" }, [
            h(
              "p",
              { "data-slot": "agent-chat-question-title", id: titleId },
              props.question,
            ),
            props.reason
              ? h(
                  "p",
                  { "data-slot": "agent-chat-question-reason" },
                  props.reason,
                )
              : null,
          ]),
          props.options.length
            ? h(
                "div",
                {
                  "data-slot": "agent-chat-question-options",
                  role: "group",
                  "aria-label": m.agentQuestionAnswers,
                },
                props.options.map((option, i) =>
                  h(
                    "button",
                    {
                      key: i,
                      type: "button",
                      "data-slot": "agent-chat-question-option",
                      onClick: () => emit("answer", option.label),
                    },
                    [
                      i < 9 ? h(SoneKbd, null, () => String(i + 1)) : null,
                      h(
                        "span",
                        { "data-slot": "agent-chat-question-option-text" },
                        [
                          h(
                            "span",
                            { "data-slot": "agent-chat-question-option-title" },
                            option.label,
                          ),
                          option.hint
                            ? h(
                                "span",
                                {
                                  "data-slot":
                                    "agent-chat-question-option-hint",
                                },
                                option.hint,
                              )
                            : null,
                        ],
                      ),
                      h(SoneIcon, { icon: "chevron-right" }),
                    ],
                  ),
                ),
              )
            : null,
          h(
            "form",
            { "data-slot": "agent-chat-question-answer", onSubmit: send },
            [
              h("input", {
                "data-slot": "agent-chat-question-input",
                type: "text",
                autocomplete: "off",
                "aria-label": m.agentQuestionYourAnswer,
                placeholder: props.placeholder ?? m.agentQuestionPlaceholder,
                value: draft.value,
                onInput: (event: Event) => {
                  draft.value = (event.target as HTMLInputElement).value;
                },
              }),
              h(
                SoneButton,
                {
                  type: "submit",
                  size: "icon-sm",
                  disabled: !canSend,
                  "aria-label": m.agentQuestionSend,
                },
                () => h(SoneIcon, { icon: "arrow-up" }),
              ),
            ],
          ),
          props.hints
            ? h("p", { "data-slot": "agent-chat-question-keys" }, [
                ...(keyed.value.length
                  ? [
                      h("span", { "data-slot": "agent-chat-question-key" }, [
                        ...keyed.value.map((_, i) =>
                          h(SoneKbd, { key: i }, () => String(i + 1)),
                        ),
                        h("span", m.agentQuestionToAnswer),
                      ]),
                      h("span", { "aria-hidden": "true" }, "·"),
                    ]
                  : []),
                h("span", { "data-slot": "agent-chat-question-key" }, [
                  h(SoneKbd, null, () => "/"),
                  h("span", m.agentQuestionCommands),
                ]),
                h("span", { "aria-hidden": "true" }, "·"),
                h("span", { "data-slot": "agent-chat-question-key" }, [
                  h(SoneKbd, null, () => "⌘K"),
                  h("span", m.agentQuestionAnywhere),
                ]),
              ])
            : null,
        ],
      );
    };
  },
});

/**
 * `<sone-agent-chat-thought>` — an agent's reasoning folded into a quiet row (“Thought for 12
 * seconds ›”) that opens a ruled panel with the default slot. `v-model:open`.
 */
export const SoneAgentChatThought = defineComponent({
  name: "SoneAgentChatThought",
  props: {
    /** How long the agent thought, in whole seconds. */
    seconds: { type: Number, default: 0 },
    /** The reasoning panel shows (`v-model:open`). */
    open: { type: Boolean, default: false },
  },
  emits: {
    "update:open": (value: boolean) => typeof value === "boolean",
  },
  setup(props, { slots, emit }) {
    const messages = useSoneMessages();
    const panelId = `sone-agent-chat-thought-${useId()}-panel`;
    const open = useModel(
      () => props.open,
      (v) => emit("update:open", v),
    );
    const isOpen = computed(() => open.value);
    const toggle = (): void => open.set(!open.value);
    return () =>
      h(
        "sone-agent-chat-thought",
        {
          "data-slot": "agent-chat-thought",
          "data-open": isOpen.value ? "" : undefined,
        },
        [
          h(
            "button",
            {
              type: "button",
              "data-slot": "agent-chat-thought-trigger",
              "aria-expanded": isOpen.value ? "true" : "false",
              "aria-controls": panelId,
              onClick: toggle,
            },
            [
              h(SoneIcon, { icon: "lightbulb" }),
              h(
                "span",
                { "data-slot": "agent-chat-thought-label" },
                messages.value.agentThought(
                  Math.max(0, Math.round(props.seconds)),
                ),
              ),
              h(SoneIcon, { icon: "chevron-right" }),
            ],
          ),
          h(
            "div",
            {
              "data-slot": "agent-chat-thought-panel",
              id: panelId,
              hidden: !isOpen.value,
            },
            slots.default?.(),
          ),
        ],
      );
  },
});
