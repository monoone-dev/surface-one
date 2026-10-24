import { computed, defineComponent, h, ref, type PropType } from "vue";

import { clockTime } from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { SoneButton, SoneButtonGroup } from "../button/button";

/** What a `SoneAudioPlayer` template ref exposes. */
export interface SoneAudioPlayerExposed {
  readonly currentTime: number;
  readonly duration: number;
  readonly playing: boolean;
  togglePlay(): void;
  pause(): void;
  /**
   * Moves the playhead to `seconds` and (by default) starts playing; pass
   * `{ play: false }` to only move it. `false` when nothing is loaded.
   */
  seekTo(seconds: number, opts?: { play?: boolean }): boolean;
  stopAndUnload(): void;
}

const svg = {
  viewBox: "0 0 24 24",
  "aria-hidden": "true",
  focusable: "false",
} as const;
const strokeSvg = {
  ...svg,
  fill: "none",
  stroke: "currentColor",
  "stroke-width": "2",
  "stroke-linecap": "round",
  "stroke-linejoin": "round",
} as const;

/**
 * `<sone-audio-player>` — play / pause, skip back and forward, the elapsed and total
 * time, a seek track (`role="slider"`: arrows, Home / End, Space / Enter plays) and a
 * playback-speed button. Renders nothing until `src` is set.
 */
export const SoneAudioPlayer = defineComponent({
  name: "SoneAudioPlayer",
  props: {
    src: { type: String as PropType<string | null>, default: null },
    skipSeconds: { type: Number, default: 15 },
    keyStepSeconds: { type: Number, default: 5 },
    rates: {
      type: Array as PropType<readonly number[]>,
      default: () => [1, 1.25, 1.5, 2],
    },
  },
  emits: {
    timeUpdate: (_seconds: number) => true,
    durationChange: (_seconds: number) => true,
    playingChange: (_playing: boolean) => true,
    userSeek: (_seconds: number) => true,
    playbackEnd: () => true,
  },
  setup(props, { emit, expose }) {
    const messages = useSoneMessages();
    const audio = ref<HTMLAudioElement | null>(null);
    const currentTime = ref(0);
    const duration = ref(0);
    const playing = ref(false);
    const rate = ref<number | null>(null);

    const activeRate = computed(() => rate.value ?? props.rates[0] ?? 1);
    const progressPct = computed(() =>
      duration.value > 0
        ? Math.min(100, (currentTime.value / duration.value) * 100)
        : 0,
    );

    const setTime = (seconds: number): void => {
      currentTime.value = seconds;
      emit("timeUpdate", seconds);
    };
    const setPlaying = (value: boolean): void => {
      playing.value = value;
      emit("playingChange", value);
    };
    const userMove = (el: HTMLAudioElement, seconds: number): void => {
      emit("userSeek", seconds);
      el.currentTime = seconds;
      setTime(seconds);
    };

    const togglePlay = (): void => {
      const el = audio.value;
      if (!el) return;
      if (el.paused) void el.play();
      else el.pause();
    };
    const pause = (): void => audio.value?.pause();
    const seekTo = (
      seconds: number,
      opts: { play?: boolean } = {},
    ): boolean => {
      const el = audio.value;
      if (!el) return false;
      el.currentTime = seconds;
      setTime(seconds);
      if (opts.play ?? true) void el.play();
      return true;
    };
    const stopAndUnload = (): void => {
      const el = audio.value;
      if (!el) return;
      el.pause();
      el.removeAttribute("src");
      el.load();
      setPlaying(false);
      setTime(0);
    };
    expose({
      get currentTime() {
        return currentTime.value;
      },
      get duration() {
        return duration.value;
      },
      get playing() {
        return playing.value;
      },
      togglePlay,
      pause,
      seekTo,
      stopAndUnload,
    } satisfies SoneAudioPlayerExposed);

    const skip = (delta: number): void => {
      const el = audio.value;
      const dur = duration.value;
      if (!el || dur <= 0) return;
      userMove(el, Math.min(dur, Math.max(0, el.currentTime + delta)));
    };
    const cycleRate = (): void => {
      const steps = props.rates;
      if (steps.length === 0) return;
      const i = steps.indexOf(activeRate.value);
      const next = steps[(i + 1) % steps.length]!;
      rate.value = next;
      if (audio.value) audio.value.playbackRate = next;
    };
    const onLoaded = (): void => {
      const el = audio.value;
      if (!el) return;
      if (Number.isFinite(el.duration)) {
        duration.value = el.duration;
        emit("durationChange", el.duration);
      }
      el.playbackRate = activeRate.value;
    };
    const onEnded = (): void => {
      setPlaying(false);
      emit("playbackEnd");
      setTime(duration.value);
    };
    const seekFromEvent = (event: MouseEvent): void => {
      const el = audio.value;
      const dur = duration.value;
      if (!el || dur <= 0) return;
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width),
      );
      userMove(el, ratio * dur);
    };
    const onTrackKey = (event: KeyboardEvent): void => {
      const el = audio.value;
      const dur = duration.value;
      if (!el || dur <= 0) return;
      const step = props.keyStepSeconds;
      let next: number;
      switch (event.key) {
        case "ArrowLeft":
          next = Math.max(0, el.currentTime - step);
          break;
        case "ArrowRight":
          next = Math.min(dur, el.currentTime + step);
          break;
        case "Home":
          next = 0;
          break;
        case "End":
          next = dur;
          break;
        case " ":
        case "Enter":
          event.preventDefault();
          togglePlay();
          return;
        default:
          return;
      }
      event.preventDefault();
      userMove(el, next);
    };

    return () => {
      const m = messages.value;
      const url = props.src;
      return h(
        "sone-audio-player",
        {
          "data-slot": "audio-player",
          "data-state": playing.value ? "playing" : "paused",
        },
        url
          ? [
              h("audio", {
                ref: audio,
                src: url,
                preload: "metadata",
                onLoadedmetadata: onLoaded,
                onTimeupdate: () => {
                  if (audio.value) setTime(audio.value.currentTime);
                },
                onPlay: () => setPlaying(true),
                onPause: () => setPlaying(false),
                onEnded,
              }),
              h(
                SoneButton,
                {
                  size: "icon",
                  type: "button",
                  class: { play: true, "is-playing": playing.value },
                  "aria-label": playing.value ? m.audioPause : m.audioPlay,
                  onClick: togglePlay,
                },
                () =>
                  playing.value
                    ? h("svg", { ...svg, fill: "currentColor" }, [
                        h("rect", {
                          x: "14",
                          y: "4",
                          width: "4",
                          height: "16",
                          rx: "1",
                        }),
                        h("rect", {
                          x: "6",
                          y: "4",
                          width: "4",
                          height: "16",
                          rx: "1",
                        }),
                      ])
                    : h(
                        "svg",
                        { ...svg, fill: "currentColor" },
                        h("path", {
                          d: "M6 3.9v16.2a1 1 0 0 0 1.5.86l13.5-8.1a1 1 0 0 0 0-1.72L7.5 3.04A1 1 0 0 0 6 3.9Z",
                        }),
                      ),
              ),
              h(
                SoneButtonGroup,
                { class: "skip", "aria-label": m.audioSkip },
                () => [
                  h(
                    SoneButton,
                    {
                      variant: "outline",
                      size: "sm",
                      type: "button",
                      "aria-label": m.audioBack(props.skipSeconds),
                      onClick: () => skip(-props.skipSeconds),
                    },
                    () => [
                      h("svg", { "data-icon": "inline-start", ...strokeSvg }, [
                        h("path", {
                          d: "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",
                        }),
                        h("path", { d: "M3 3v5h5" }),
                      ]),
                      m.audioSkipAmount(props.skipSeconds),
                    ],
                  ),
                  h(
                    SoneButton,
                    {
                      variant: "outline",
                      size: "sm",
                      type: "button",
                      "aria-label": m.audioForward(props.skipSeconds),
                      onClick: () => skip(props.skipSeconds),
                    },
                    () => [
                      m.audioSkipAmount(props.skipSeconds),
                      h("svg", { "data-icon": "inline-end", ...strokeSvg }, [
                        h("path", {
                          d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8",
                        }),
                        h("path", { d: "M21 3v5h-5" }),
                      ]),
                    ],
                  ),
                ],
              ),
              h(
                "span",
                { class: "time", "data-slot": "audio-player-time" },
                clockTime(currentTime.value),
              ),
              h(
                "div",
                {
                  class: "track",
                  "data-slot": "audio-player-progress",
                  role: "slider",
                  tabindex: "0",
                  "aria-label": m.audioSeek,
                  "aria-valuemin": 0,
                  "aria-valuemax": Math.round(duration.value),
                  "aria-valuenow": Math.round(currentTime.value),
                  "aria-valuetext": m.audioPosition(
                    clockTime(currentTime.value),
                    clockTime(duration.value),
                  ),
                  style: { "--track-fill": `${progressPct.value}%` },
                  onClick: seekFromEvent,
                  onKeydown: onTrackKey,
                },
                h("span", { class: "track-thumb", "aria-hidden": "true" }),
              ),
              h(
                "span",
                {
                  class: "time time-total",
                  "data-slot": "audio-player-duration",
                },
                clockTime(duration.value),
              ),
              h(
                SoneButton,
                {
                  variant: "ghost",
                  size: "sm",
                  type: "button",
                  class: "rate",
                  "aria-label": m.audioSpeed,
                  onClick: cycleRate,
                },
                () => `${activeRate.value}×`,
              ),
            ]
          : undefined,
      );
    };
  },
});
