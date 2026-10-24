"use client";

import {
  createElement,
  useImperativeHandle,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
  type Ref,
} from "react";

import { clockTime } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";
import { SoneButton, SoneButtonGroup } from "../button/button";

/** What an audio player's `handleRef` exposes. */
export interface SoneAudioPlayerHandle {
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

export interface SoneAudioPlayerProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "onTimeUpdate" | "onDurationChange"
> {
  readonly src?: string | null;
  readonly skipSeconds?: number;
  readonly keyStepSeconds?: number;
  readonly rates?: readonly number[];
  /** The playhead moved (playback, a seek or a skip), in seconds. */
  readonly onTimeUpdate?: (seconds: number) => void;
  readonly onDurationChange?: (seconds: number) => void;
  readonly onPlayingChange?: (playing: boolean) => void;
  /** The listener moved the playhead (the track, its keys or a skip). */
  readonly onUserSeek?: (seconds: number) => void;
  readonly onPlaybackEnd?: () => void;
  /** `togglePlay()`, `pause()`, `seekTo()`, `stopAndUnload()` and the current state. */
  readonly handleRef?: Ref<SoneAudioPlayerHandle>;
  readonly ref?: Ref<HTMLElement>;
}

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/**
 * `<sone-audio-player>` — play / pause, skip back and forward, the elapsed and total
 * time, a seek track (`role="slider"`: arrows, Home / End, Space / Enter plays) and a
 * playback-speed button. Renders nothing until `src` is set.
 */
export function SoneAudioPlayer({
  src = null,
  skipSeconds = 15,
  keyStepSeconds = 5,
  rates = [1, 1.25, 1.5, 2],
  onTimeUpdate,
  onDurationChange,
  onPlayingChange,
  onUserSeek,
  onPlaybackEnd,
  handleRef,
  ...rest
}: SoneAudioPlayerProps): ReactElement {
  const m = useSoneMessages();
  const audio = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playing, setPlayingState] = useState(false);
  const [rate, setRate] = useState<number | null>(null);
  const durationRef = useRef(0);

  const activeRate = rate ?? rates[0] ?? 1;
  const progressPct =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const setTime = (seconds: number): void => {
    setCurrentTime(seconds);
    onTimeUpdate?.(seconds);
  };
  const setPlaying = (value: boolean): void => {
    setPlayingState(value);
    onPlayingChange?.(value);
  };
  const userMove = (el: HTMLAudioElement, seconds: number): void => {
    onUserSeek?.(seconds);
    el.currentTime = seconds;
    setTime(seconds);
  };

  const togglePlay = (): void => {
    const el = audio.current;
    if (!el) return;
    if (el.paused) void el.play();
    else el.pause();
  };

  useImperativeHandle(handleRef, () => ({
    currentTime,
    duration,
    playing,
    togglePlay,
    pause: () => audio.current?.pause(),
    seekTo: (seconds, opts = {}) => {
      const el = audio.current;
      if (!el) return false;
      el.currentTime = seconds;
      setTime(seconds);
      if (opts.play ?? true) void el.play();
      return true;
    },
    stopAndUnload: () => {
      const el = audio.current;
      if (!el) return;
      el.pause();
      el.removeAttribute("src");
      el.load();
      setPlaying(false);
      setTime(0);
    },
  }));

  const skip = (delta: number): void => {
    const el = audio.current;
    const dur = durationRef.current;
    if (!el || dur <= 0) return;
    userMove(el, Math.min(dur, Math.max(0, el.currentTime + delta)));
  };
  const cycleRate = (): void => {
    if (rates.length === 0) return;
    const i = rates.indexOf(activeRate);
    const next = rates[(i + 1) % rates.length]!;
    setRate(next);
    if (audio.current) audio.current.playbackRate = next;
  };
  const seekFromEvent = (event: MouseEvent<HTMLElement>): void => {
    const el = audio.current;
    const dur = durationRef.current;
    if (!el || dur <= 0) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    );
    userMove(el, ratio * dur);
  };
  const onTrackKey = (event: KeyboardEvent<HTMLElement>): void => {
    const el = audio.current;
    const dur = durationRef.current;
    if (!el || dur <= 0) return;
    let next: number;
    switch (event.key) {
      case "ArrowLeft":
        next = Math.max(0, el.currentTime - keyStepSeconds);
        break;
      case "ArrowRight":
        next = Math.min(dur, el.currentTime + keyStepSeconds);
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

  return createElement(
    "sone-audio-player",
    {
      "data-slot": "audio-player",
      "data-state": playing ? "playing" : "paused",
      ...rest,
    },
    src ? (
      <>
        <audio
          ref={audio}
          src={src}
          preload="metadata"
          onLoadedMetadata={() => {
            const el = audio.current;
            if (!el) return;
            if (Number.isFinite(el.duration)) {
              durationRef.current = el.duration;
              setDuration(el.duration);
              onDurationChange?.(el.duration);
            }
            el.playbackRate = activeRate;
          }}
          onTimeUpdate={() => {
            if (audio.current) setTime(audio.current.currentTime);
          }}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false);
            onPlaybackEnd?.();
            setTime(durationRef.current);
          }}
        />
        <SoneButton
          size="icon"
          type="button"
          className={cx("play", playing && "is-playing")}
          onClick={togglePlay}
          aria-label={playing ? m.audioPause : m.audioPlay}
        >
          {playing ? (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="14" y="4" width="4" height="16" rx="1" />
              <rect x="6" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 3.9v16.2a1 1 0 0 0 1.5.86l13.5-8.1a1 1 0 0 0 0-1.72L7.5 3.04A1 1 0 0 0 6 3.9Z" />
            </svg>
          )}
        </SoneButton>
        <SoneButtonGroup className="skip" aria-label={m.audioSkip}>
          <SoneButton
            variant="outline"
            size="sm"
            type="button"
            aria-label={m.audioBack(skipSeconds)}
            onClick={() => skip(-skipSeconds)}
          >
            <svg
              data-icon="inline-start"
              viewBox="0 0 24 24"
              {...stroke}
              aria-hidden="true"
              focusable="false"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            {m.audioSkipAmount(skipSeconds)}
          </SoneButton>
          <SoneButton
            variant="outline"
            size="sm"
            type="button"
            aria-label={m.audioForward(skipSeconds)}
            onClick={() => skip(skipSeconds)}
          >
            {m.audioSkipAmount(skipSeconds)}
            <svg
              data-icon="inline-end"
              viewBox="0 0 24 24"
              {...stroke}
              aria-hidden="true"
              focusable="false"
            >
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </SoneButton>
        </SoneButtonGroup>
        <span className="time" data-slot="audio-player-time">
          {clockTime(currentTime)}
        </span>
        <div
          className="track"
          data-slot="audio-player-progress"
          role="slider"
          tabIndex={0}
          aria-label={m.audioSeek}
          aria-valuemin={0}
          aria-valuemax={Math.round(duration)}
          aria-valuenow={Math.round(currentTime)}
          aria-valuetext={m.audioPosition(
            clockTime(currentTime),
            clockTime(duration),
          )}
          style={{ "--track-fill": `${progressPct}%` } as CSSProperties}
          onClick={seekFromEvent}
          onKeyDown={onTrackKey}
        >
          <span className="track-thumb" aria-hidden="true" />
        </div>
        <span className="time time-total" data-slot="audio-player-duration">
          {clockTime(duration)}
        </span>
        <SoneButton
          variant="ghost"
          size="sm"
          type="button"
          className="rate"
          aria-label={m.audioSpeed}
          onClick={cycleRate}
        >
          {`${activeRate}×`}
        </SoneButton>
      </>
    ) : null,
  );
}
