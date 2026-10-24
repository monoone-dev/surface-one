import { defineComponent, h, ref, type PropType } from "vue";

import { speakerInitials, type TranscriptTone } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneAvatar, SoneAvatarFallback } from "../avatar/avatar";
import { SoneBadge } from "../badge/badge";
import { SoneBubble, SoneBubbleContent } from "../bubble/bubble";
import { SoneButton } from "../button/button";
import { SoneMarker, SoneMarkerContent } from "../marker/marker";
import {
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageFooter,
  SoneMessageHeader,
} from "../message/message";

export interface LiveTranscriptLine {
  id: string;
  speaker: string;
  tone?: TranscriptTone;
  timeLabel: string;
  datetime?: string;
  /** `false` = the in-progress partial result from speech-to-text. */
  final: boolean;
  /** A badge under the line ("Possible question"). */
  flag?: string | null;
  text: string;
  translation?: string;
}

/** What a `SoneLiveTranscript` template ref exposes. */
export interface SoneLiveTranscriptExposed {
  /** Scrolls the log to its newest line. */
  scrollToEnd(): void;
}

/**
 * `<sone-live-transcript>` — the running transcript of a live recording: a `role="log"`
 * of speaker bubbles (aria-live off — the reader asks for it), the partial line as a
 * shimmering marker, flags and translations. `following` off shows a "Jump to latest"
 * button; `atBottomChange` reports whether the reader is at the end. The default slot
 * shows while there are no lines.
 */
export const SoneLiveTranscript = defineComponent({
  name: "SoneLiveTranscript",
  props: {
    lines: { type: Array as PropType<LiveTranscriptLine[]>, default: () => [] },
    following: { type: Boolean, default: true },
    canShowOlder: { type: Boolean, default: false },
    /** Before "· Jump to latest" (default: the "Live transcript" message). */
    jumpLabel: { type: String as PropType<string>, default: undefined },
    /** The log's name (default: the "Live transcript history" message). */
    label: { type: String as PropType<string>, default: undefined },
    /** Beside a partial line (default: the "Listening…" message). */
    partialLabel: { type: String as PropType<string>, default: undefined },
    /** The `lang` of the translations. */
    translationLang: { type: String as PropType<string | null>, default: null },
  },
  emits: {
    showOlder: () => true,
    jumpToLatest: () => true,
    atBottomChange: (_atBottom: boolean) => true,
  },
  setup(props, { emit, expose, slots }) {
    const messages = useSoneMessages();
    const scroller = ref<HTMLElement | null>(null);
    expose({
      scrollToEnd: () => {
        const el = scroller.value;
        if (el) el.scrollTop = el.scrollHeight;
      },
    } satisfies SoneLiveTranscriptExposed);

    const onScroll = (event: Event): void => {
      const el = event.currentTarget as HTMLElement;
      emit(
        "atBottomChange",
        el.scrollHeight - el.scrollTop - el.clientHeight <= 48,
      );
    };

    const line = (l: LiveTranscriptLine) => {
      const me = l.tone === "me";
      const align = me ? "end" : "start";
      return h(
        SoneMessage,
        {
          key: l.id,
          as: "article",
          class: {
            "bubble-row": true,
            "is-me": me,
            "is-flagged": !!l.flag,
            "is-partial": !l.final,
          },
          align,
        },
        () => [
          h(
            SoneMessageAvatar,
            {
              as: SoneAvatar,
              size: "sm",
              class: "line-avatar",
              "data-tone": l.tone ?? undefined,
              "aria-hidden": "true",
            },
            () => h(SoneAvatarFallback, () => speakerInitials(l.speaker)),
          ),
          h(SoneMessageContent, () => [
            h(SoneMessageHeader, { class: "bubble-meta" }, () => [
              h("span", { class: "speaker" }, l.speaker),
              h("span", { "aria-hidden": "true" }, "·"),
              h(
                "time",
                {
                  datetime: l.datetime ?? undefined,
                  title: l.datetime ?? undefined,
                },
                l.timeLabel,
              ),
              ...(l.final
                ? []
                : [
                    h("span", { "aria-hidden": "true" }, "·"),
                    h(
                      "span",
                      props.partialLabel ??
                        messages.value.liveTranscriptPartial,
                    ),
                  ]),
            ]),
            l.final
              ? h(
                  SoneBubble,
                  { variant: me ? "tinted" : "muted", align },
                  () => [
                    h(
                      SoneBubbleContent,
                      { as: "p", class: "bubble" },
                      () => l.text,
                    ),
                    l.translation
                      ? h(
                          "p",
                          {
                            class: "translation",
                            lang: props.translationLang ?? undefined,
                          },
                          l.translation,
                        )
                      : null,
                  ],
                )
              : h(SoneMarker, { class: "bubble" }, () =>
                  h(SoneMarkerContent, { class: "shimmer" }, () => l.text),
                ),
            l.flag
              ? h(SoneMessageFooter, () =>
                  h(
                    SoneBadge,
                    { variant: "warning", class: "question-label" },
                    () => l.flag,
                  ),
                )
              : null,
          ]),
        ],
      );
    };

    return () => {
      const m = messages.value;
      return h(
        "sone-live-transcript",
        {
          "data-slot": "live-transcript",
          "data-state": props.following ? "following" : "scrolled",
        },
        [
          h(
            "div",
            {
              ref: scroller,
              class: "transcript",
              role: "log",
              "aria-live": "off",
              tabindex: "0",
              "aria-label": props.label ?? m.liveTranscriptLabel,
              onScroll,
            },
            [
              props.canShowOlder
                ? h(
                    SoneButton,
                    {
                      variant: "ghost",
                      size: "sm",
                      type: "button",
                      class: "older-btn",
                      onClick: () => emit("showOlder"),
                    },
                    () => m.liveTranscriptOlder,
                  )
                : null,
              ...(props.lines.length
                ? props.lines.map(line)
                : (slots.default?.() ?? [])),
            ],
          ),
          props.following
            ? null
            : h(
                SoneButton,
                {
                  variant: "outline",
                  size: "sm",
                  type: "button",
                  class: "jump-btn",
                  onClick: () => emit("jumpToLatest"),
                },
                () =>
                  m.liveTranscriptJumpToLatest(
                    props.jumpLabel ?? m.liveTranscriptJump,
                  ),
              ),
        ],
      );
    };
  },
});
