import {
  computed,
  defineComponent,
  h,
  nextTick,
  onMounted,
  ref,
  watch,
  type PropType,
} from "vue";

import {
  activeTranscriptFragmentIds,
  activeTranscriptTurnKey,
  clockTime,
  filterTranscriptTurns,
  flashTranscriptFragment,
  followTranscriptRow,
  speakerInitials,
  transcriptWindow,
  type TranscriptTurn,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneAvatar, SoneAvatarFallback } from "../avatar/avatar";
import { SoneBadge } from "../badge/badge";
import { SoneBubble, SoneBubbleContent } from "../bubble/bubble";
import { SoneButton } from "../button/button";
import { SoneEmpty, SoneEmptyDescription } from "../empty-state/empty-state";
import {
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageGroup,
  SoneMessageHeader,
} from "../message/message";

export {
  foldTranscriptTurns,
  type TranscriptFragment,
  type TranscriptSegment,
  type TranscriptTone,
  type TranscriptTurn,
} from "@surface-one/core";

/** What a `SoneTranscript` template ref exposes. */
export interface SoneTranscriptExposed {
  /** Every turn renders (past the row and fragment caps). */
  readonly expanded: boolean;
  /** Back to the window around the playing turn. */
  collapse(): void;
}

/**
 * `<sone-transcript>` — a recording's transcript as speaker turns (fold segments with
 * `foldTranscriptTurns`): the playing turn and fragments highlight and follow
 * `currentTime`, a click on a time or a fragment emits `seek`, `query` filters the
 * turns, and `flashId` flashes one fragment into view. Long transcripts render a window
 * around the playing turn, with a "Show all" button.
 */
export const SoneTranscript = defineComponent({
  name: "SoneTranscript",
  props: {
    turns: { type: Array as PropType<TranscriptTurn[]>, default: () => [] },
    currentTime: { type: Number, default: 0 },
    query: { type: String, default: "" },
    flashId: { type: Number as PropType<number | null>, default: null },
    /** Bump it to flash the same fragment again. */
    flashSeq: { type: Number, default: 0 },
    seekable: { type: Boolean, default: true },
    renderCap: { type: Number, default: 80 },
    fragmentCap: { type: Number, default: 160 },
  },
  emits: {
    seek: (_seconds: number) => true,
    flashEnd: (_id: number) => true,
  },
  setup(props, { emit, expose }) {
    const messages = useSoneMessages();
    const expanded = ref(false);
    const scroller = ref<HTMLElement | null>(null);
    expose({
      get expanded() {
        return expanded.value;
      },
      collapse: () => {
        expanded.value = false;
      },
    } satisfies SoneTranscriptExposed);

    const flashKey = computed(() => `${props.flashId ?? ""}#${props.flashSeq}`);
    const visibleTurns = computed(() =>
      filterTranscriptTurns(props.turns, props.query),
    );
    const activeTurnKey = computed(() =>
      activeTranscriptTurnKey(props.turns, props.currentTime),
    );
    const renderedTurns = computed(() =>
      transcriptWindow(visibleTurns.value, {
        expanded: expanded.value,
        rowCap: props.renderCap,
        fragmentCap: props.fragmentCap,
        flashId: props.flashId,
        activeKey: activeTurnKey.value,
      }),
    );
    const hiddenTurnCount = computed(
      () => visibleTurns.value.length - renderedTurns.value.length,
    );
    const activeFragmentIds = computed(() =>
      activeTranscriptFragmentIds(renderedTurns.value, props.currentTime),
    );

    // Keep the playing turn in view (not while filtering).
    const follow = (): void => {
      const key = activeTurnKey.value;
      const box = scroller.value;
      if (!key || props.query.trim() || !box) return;
      const row = Array.from(
        box.querySelectorAll<HTMLElement>("[data-turn]"),
      ).find((r) => r.getAttribute("data-turn") === key);
      if (row) followTranscriptRow(box, row);
    };
    // Flash the fragment once per flashId / flashSeq.
    let lastScrolledFlashKey = "";
    const flash = (): void => {
      const key = flashKey.value;
      if (
        props.flashId === null ||
        renderedTurns.value.length === 0 ||
        key === lastScrolledFlashKey
      ) {
        return;
      }
      const frag = scroller.value?.querySelector<HTMLElement>(
        `.frag[data-flash="${CSS.escape(key)}"]`,
      );
      if (!frag) return;
      lastScrolledFlashKey = key;
      flashTranscriptFragment(frag);
    };
    onMounted(() => {
      follow();
      flash();
    });
    watch([activeTurnKey, () => props.query], () => void nextTick(follow), {
      flush: "post",
    });
    watch(
      [() => props.flashId, flashKey, renderedTurns],
      () => void nextTick(flash),
      {
        flush: "post",
      },
    );

    const onFlashEnd = (id: number): void => {
      if (props.flashId === id) emit("flashEnd", id);
    };

    const turnRow = (t: TranscriptTurn) => {
      const active = t.key === activeTurnKey.value;
      return h(
        SoneMessage,
        {
          key: t.key,
          as: "li",
          class: { turn: true, "is-active": active },
          "data-turn": t.key,
        },
        () => [
          t.speaker
            ? h(
                SoneMessageAvatar,
                {
                  as: SoneAvatar,
                  size: "sm",
                  class: "turn-avatar",
                  "data-tone": t.tone ?? undefined,
                  "aria-hidden": "true",
                },
                () => h(SoneAvatarFallback, () => speakerInitials(t.speaker)),
              )
            : null,
          h(SoneMessageContent, () => [
            h(SoneMessageHeader, { class: "turn-head" }, () => [
              ...(t.speaker
                ? [
                    h("span", { class: "turn-speaker" }, t.speaker),
                    h("span", { "aria-hidden": "true" }, "·"),
                  ]
                : []),
              h(
                "button",
                {
                  type: "button",
                  class: "turn-time",
                  disabled: !props.seekable,
                  onClick: () => emit("seek", t.startS),
                },
                clockTime(t.startS),
              ),
            ]),
            h(SoneBubble, { variant: active ? "tinted" : "muted" }, () => [
              h(SoneBubbleContent, { as: "p", class: "turn-text" }, () =>
                t.fragments.map((f) =>
                  h(
                    "button",
                    {
                      key: f.id,
                      type: "button",
                      class: {
                        frag: true,
                        "is-active": activeFragmentIds.value.has(f.id),
                        "is-flash": f.id === props.flashId,
                      },
                      "data-flash":
                        f.id === props.flashId ? flashKey.value : undefined,
                      onAnimationend: () => onFlashEnd(f.id),
                      disabled: !props.seekable,
                      onClick: () => emit("seek", f.startS),
                    },
                    f.text,
                  ),
                ),
              ),
              t.secondaryText
                ? h("p", { class: "turn-secondary" }, t.secondaryText)
                : null,
            ]),
          ]),
        ],
      );
    };

    return () => {
      const m = messages.value;
      let body;
      if (visibleTurns.value.length) {
        body = h(
          "div",
          { ref: scroller, class: "transcript-card panel-card" },
          [
            h(SoneMessageGroup, { as: "ul", class: "turns" }, () =>
              renderedTurns.value.map(turnRow),
            ),
            hiddenTurnCount.value > 0
              ? h(
                  SoneButton,
                  {
                    variant: "ghost",
                    type: "button",
                    class: "show-all",
                    onClick: () => {
                      expanded.value = true;
                    },
                  },
                  () => [
                    m.transcriptShowAll(visibleTurns.value.length),
                    h(
                      SoneBadge,
                      { variant: "secondary" },
                      () => `+${hiddenTurnCount.value}`,
                    ),
                  ],
                )
              : null,
          ],
        );
      } else {
        body = h(SoneEmpty, { class: "empty-card panel-card" }, () =>
          h(SoneEmptyDescription, () =>
            props.turns.length
              ? m.transcriptNoMatch(props.query)
              : m.transcriptEmpty,
          ),
        );
      }
      return h("sone-transcript", { "data-slot": "transcript" }, body);
    };
  },
});
