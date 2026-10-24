import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  type ExtractPropTypes,
  type PropType,
  type Ref,
  type VNode,
  watch,
} from "vue";

import {
  agentClock,
  agentElapsed,
  agentGlyph,
  agentHueStyle,
  agentInitials,
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

import { useSoneMessages } from "../../composables/messages";
import { flag } from "../../utils/part";

// The shared behaviour of the two agent conversation views (SoneTerminal*, SoneAgentChat*) —
// the twin of packages/angular/core/agent-base.ts. Private: not exported from the package.

const timeProp = {
  type: [Date, Number, String] as PropType<AgentTime | null>,
  default: null,
};
const nullableString = {
  type: String as PropType<string | null>,
  default: null,
};
const nullableNumber = {
  type: Number as PropType<number | null>,
  default: null,
};

/** The props of one conversation entry (`SoneTerminalLine`, `SoneAgentChatMessage`). */
export const agentEntryProps = {
  /** Who wrote it: the person (`user`), an `agent`, or the `system`. */
  from: { type: String as PropType<AgentFrom>, default: "agent" },
  /** `message` is something said; `activity` is a quiet line of tool work. */
  kind: { type: String as PropType<AgentEntryKind>, default: "message" },
  /** The speaker's name; the person's defaults to the "You" message. */
  speaker: nullableString,
  /** Who the person (or an agent) spoke to: “You → Lead”. */
  to: nullableString,
  /** When it was said: a `Date`, epoch milliseconds or an ISO string. */
  time: timeProp,
  /** `danger` for a failed command, `success` / `warning` for an outcome. */
  tone: { type: String as PropType<AgentTone>, default: "default" },
  /** The mark in front of the text; `❯` for the person, `›` for activity. `""` hides it. */
  glyph: nullableString,
  /** A speaker colour, `1`–`8` (the chart hues), so each agent keeps its own. */
  hue: nullableNumber,
} as const;

export type AgentEntryProps = ExtractPropTypes<typeof agentEntryProps>;

/** The props of a run boundary or turn summary. */
export const agentDividerProps = {
  time: timeProp,
  tone: { type: String as PropType<AgentTone>, default: "default" },
} as const;

/** The props of the scrolling log. */
export const agentLogProps = {
  /** The log's accessible name. */
  label: nullableString,
  /** Stay pinned to the newest line while the reader is there. */
  follow: { type: Boolean, default: true },
} as const;

/** The props of the live status line. */
export const agentStatusProps = {
  state: { type: String as PropType<AgentState>, default: "idle" },
  /** Who it is about: “Lead is working”. */
  speaker: nullableString,
  /** When the current state began; a running time is shown while the agent is active. */
  since: timeProp,
  /** Replaces the built-in sentence. */
  label: nullableString,
  /** The speaker colour, `1`–`8`. */
  hue: nullableNumber,
} as const;

export type AgentStatusProps = ExtractPropTypes<typeof agentStatusProps>;

const toneAttr = (tone: AgentTone): AgentTone | undefined =>
  tone === "default" ? undefined : tone;

/** The derived values of an entry and its host attributes. */
export function useAgentEntry(props: Readonly<AgentEntryProps>) {
  const messages = useSoneMessages();
  const who = computed(
    () =>
      props.speaker ?? (props.from === "user" ? messages.value.agentYou : null),
  );
  const mark = computed(() => agentGlyph(props.from, props.kind, props.glyph));
  return {
    messages,
    who,
    mark,
    clock: computed(() => agentClock(props.time)),
    iso: computed(() => agentIsoTime(props.time)),
    initials: computed(() => agentInitials(who.value)),
    host: (slot: string) => ({
      "data-slot": slot,
      "data-from": props.from,
      "data-kind": props.kind,
      "data-tone": toneAttr(props.tone),
      style: agentHueStyle(props.hue),
    }),
  };
}

/** `→ to Lead`: the arrow for the eye, the word for a screen reader. */
export function renderAgentTo(slot: string, to: string, word: string): VNode {
  return h("span", { "data-slot": slot }, [
    h("span", { "aria-hidden": "true" }, "→"),
    h("span", { class: "sr-only" }, word),
    ` ${to}`,
  ]);
}

/** A run boundary or a turn summary: the same markup in both views, under its own prefix. */
export function defineAgentDivider(name: string, prefix: string) {
  return defineComponent({
    name,
    props: agentDividerProps,
    setup(props, { slots }) {
      const clock = computed(() => agentClock(props.time));
      const iso = computed(() => agentIsoTime(props.time));
      const rule = () =>
        h("span", { "data-slot": `${prefix}-rule`, "aria-hidden": "true" });
      return () =>
        h(
          `sone-${prefix}`,
          { "data-slot": prefix, "data-tone": toneAttr(props.tone) },
          [
            rule(),
            h("span", { "data-slot": `${prefix}-label` }, [
              slots.default?.(),
              clock.value
                ? [
                    h("span", { "aria-hidden": "true" }, "·"),
                    h(
                      "time",
                      { datetime: iso.value ?? undefined },
                      clock.value,
                    ),
                  ]
                : null,
            ]),
            rule(),
          ],
        );
    },
  });
}

/**
 * The live status: the sentence, the busy flags and a running time that ticks once a second in
 * the browser. `now` starts at null, so the server and the first client render show no time.
 */
export function useAgentStatus(props: Readonly<AgentStatusProps>) {
  const messages = useSoneMessages();
  const now = ref<number | null>(null);
  const active = computed(() => agentStateIsActive(props.state));
  // Ticks only while there is a running time to show, as the React twin.
  const ticking = computed(
    () => active.value && props.since !== null && props.since !== undefined,
  );
  // Set once mounted, so the server and the first client render show no time.
  const mounted = ref(false);
  let tick: ReturnType<typeof setInterval> | undefined;
  const stop = (): void => {
    clearInterval(tick);
    tick = undefined;
  };
  watch([mounted, ticking], ([isMounted, on]) => {
    stop();
    if (!isMounted || !on) return;
    now.value = Date.now();
    tick = setInterval(() => (now.value = Date.now()), 1000);
  });
  onMounted(() => (mounted.value = true));
  onBeforeUnmount(stop);

  const seconds = computed(() =>
    active.value ? agentElapsed(props.since, now.value) : null,
  );
  return {
    messages,
    initials: computed(() => agentInitials(props.speaker)),
    sentence: computed(
      () =>
        props.label ??
        messages.value.agentStatus(props.state, props.speaker ?? null),
    ),
    host: (slot: string) => ({
      "data-slot": slot,
      "data-state": props.state,
      "data-active": flag(active.value),
      "data-busy": flag(agentStateIsBusy(props.state)),
      style: agentHueStyle(props.hue),
    }),
    /** The `<time role="timer">`, or null while there is no running time. */
    timer: (slot: string): VNode | null => {
      const s = seconds.value;
      if (s === null) return null;
      return h(
        "time",
        {
          "data-slot": slot,
          role: "timer",
          "aria-label": messages.value.agentStatusTime,
          datetime: `PT${s}S`,
        },
        durationLabel(s),
      );
    },
  };
}

/**
 * Keeps the log's viewport pinned to its newest line while the reader is there (browser only:
 * set up in `onMounted`); `atEnd` turns false when they scroll up.
 */
export function useAgentLog(
  viewport: Ref<HTMLElement | null>,
  follow: () => boolean,
) {
  const atEnd = ref(true);
  let follower: LogFollower | null = null;
  onMounted(() => {
    if (!viewport.value) return;
    follower = followLog(viewport.value, (v) => (atEnd.value = v), follow);
  });
  onBeforeUnmount(() => follower?.destroy());
  return {
    atEnd,
    /** Scroll to the newest line and follow it again. */
    scrollToEnd: (smooth = true): void => follower?.jump(smooth),
  };
}

/** The prompt's textarea: Enter sends, Shift+Enter breaks the line, IME composition is left alone. */
export function defineAgentPromptInput(name: string, slot: string) {
  return defineComponent({
    name,
    props: {
      modelValue: { type: String as PropType<string>, default: undefined },
      /** The field's accessible name (default: the "Message" message). */
      ariaLabel: nullableString,
    },
    emits: {
      "update:modelValue": (value: string) => typeof value === "string",
    },
    setup(props, { emit }) {
      const messages = useSoneMessages();
      const onKeydown = (event: KeyboardEvent): void => {
        if (event.key !== "Enter" || event.shiftKey || event.isComposing)
          return;
        event.preventDefault();
        (event.target as HTMLTextAreaElement).form?.requestSubmit();
      };
      const onInput = (event: Event): void =>
        emit("update:modelValue", (event.target as HTMLTextAreaElement).value);
      return () =>
        h("textarea", {
          "data-slot": slot,
          rows: "1",
          "aria-label": props.ariaLabel ?? messages.value.agentPromptLabel,
          value: props.modelValue,
          onKeydown,
          onInput,
        });
    },
  });
}

/** The `submit` handler of a prompt's form. */
export const submitHandler =
  (emit: () => void) =>
  (event: Event): void => {
    event.preventDefault();
    emit();
  };
