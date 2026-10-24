import { act, fireEvent, render } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SoneAudioPlayer,
  SoneDownloadProgress,
  SoneFloatingBar,
  SonePowerSlider,
  type SoneAudioPlayerHandle,
} from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const RUNGS = [
  { id: "battery", name: "Battery saver" },
  { id: "balanced", name: "Balanced" },
  { id: "sharp", name: "Sharp" },
];

describe("SoneAudioPlayer", () => {
  // jsdom has no media playback: play / pause flip `paused` and fire the events.
  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, "play").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      Object.defineProperty(this, "paused", {
        value: false,
        configurable: true,
      });
      this.dispatchEvent(new Event("play"));
      return Promise.resolve();
    });
    vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(function (
      this: HTMLMediaElement,
    ) {
      Object.defineProperty(this, "paused", {
        value: true,
        configurable: true,
      });
      this.dispatchEvent(new Event("pause"));
    });
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it("renders an empty host until there is a source", () => {
    expect(html(<SoneAudioPlayer />)).toBe(
      '<sone-audio-player data-slot="audio-player" data-state="paused"></sone-audio-player>',
    );
  });

  it("renders the controls with their names, the time and the seek slider", () => {
    const out = html(<SoneAudioPlayer src="a.wav" />);
    expect(out).toContain('<audio src="a.wav" preload="metadata"></audio>');
    expect(out).toContain(
      '<button data-slot="button" data-variant="default" data-size="icon" type="button" aria-label="Play" class="btn play">',
    );
    expect(out).toContain(
      '<div role="group" data-slot="button-group" data-orientation="horizontal" aria-label="Skip" class="btn-group skip">',
    );
    expect(out).toContain('aria-label="Back 15 seconds"');
    expect(out).toContain(
      'aria-label="Forward 15 seconds" class="btn">15s<svg data-icon="inline-end"',
    );
    expect(out).toContain(
      '<span class="time" data-slot="audio-player-time">0:00</span>' +
        '<div class="track" data-slot="audio-player-progress" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00 of 0:00" style="--track-fill:0%">' +
        '<span class="track-thumb" aria-hidden="true"></span></div>' +
        '<span class="time time-total" data-slot="audio-player-duration">0:00</span>',
    );
    expect(out).toContain(
      'aria-label="Playback speed" class="btn rate">1×</button>',
    );
  });

  it("plays, seeks with the keys, skips and cycles the speed", () => {
    const onDurationChange = vi.fn();
    const onPlayingChange = vi.fn();
    const onUserSeek = vi.fn();
    const handle = createRef<SoneAudioPlayerHandle>();
    const { container } = render(
      <SoneAudioPlayer
        src="a.wav"
        rates={[1, 2]}
        onDurationChange={onDurationChange}
        onPlayingChange={onPlayingChange}
        onUserSeek={onUserSeek}
        handleRef={handle}
      />,
    );
    const host = container.firstElementChild!;
    const audio = container.querySelector("audio")!;
    Object.defineProperty(audio, "duration", {
      value: 120,
      configurable: true,
    });
    fireEvent.loadedMetadata(audio);
    expect(onDurationChange).toHaveBeenCalledWith(120);
    expect(container.querySelector(".time-total")!.textContent).toBe("2:00");

    const play = container.querySelector<HTMLButtonElement>(".play")!;
    fireEvent.click(play);
    expect(host.getAttribute("data-state")).toBe("playing");
    expect(play.getAttribute("aria-label")).toBe("Pause");
    expect(play.classList.contains("is-playing")).toBe(true);
    expect(onPlayingChange).toHaveBeenCalledWith(true);

    const track = container.querySelector('[role="slider"]')!;
    fireEvent.keyDown(track, { key: "ArrowRight" });
    expect(onUserSeek).toHaveBeenCalledWith(5);
    expect(track.getAttribute("aria-valuenow")).toBe("5");
    expect(track.getAttribute("aria-valuetext")).toBe("0:05 of 2:00");
    fireEvent.keyDown(track, { key: "End" });
    expect(audio.currentTime).toBe(120);
    fireEvent.click(container.querySelectorAll(".skip button")[0]!);
    expect(audio.currentTime).toBe(105);
    fireEvent.keyDown(track, { key: " " });
    expect(host.getAttribute("data-state")).toBe("paused");

    const rate = container.querySelector(".rate")!;
    fireEvent.click(rate);
    expect(rate.textContent).toBe("2×");
    expect(audio.playbackRate).toBe(2);

    act(() => void handle.current!.seekTo(30, { play: false }));
    expect(container.querySelector(".time")!.textContent).toBe("0:30");
    act(() => handle.current!.stopAndUnload());
    expect(audio.hasAttribute("src")).toBe(false);
    expect(container.querySelector(".time")!.textContent).toBe("0:00");
  });
});

describe("SoneFloatingBar", () => {
  it("renders the chrome, the content and the close button", () => {
    const out = html(
      <SoneFloatingBar state="live" dragRegionAttr="data-tauri-drag-region">
        <span>Recording</span>
      </SoneFloatingBar>,
    );
    expect(out).toContain(
      '<sone-floating-bar data-slot="floating-bar" data-state="live">' +
        '<div class="floating-bar" data-slot="floating-bar-chrome" data-tauri-drag-region="deep">' +
        '<div class="floating-bar-content"><span>Recording</span></div>' +
        '<button data-slot="floating-bar-close" data-variant="ghost" data-size="icon-xs" type="button" aria-label="Hide" class="btn floating-bar-close">' +
        '<sone-icon data-slot="icon" data-icon="close">',
    );
  });

  it("calls onClosed, and hides the button when not closable", () => {
    const onClosed = vi.fn();
    const { container, rerender } = render(
      <SoneFloatingBar closeLabel="Close bar" onClosed={onClosed} />,
    );
    const button = container.querySelector("button")!;
    fireEvent.click(button);
    expect(onClosed).toHaveBeenCalledTimes(1);
    expect(button.getAttribute("aria-label")).toBe("Close bar");
    rerender(<SoneFloatingBar closable={false} />);
    expect(container.querySelector("button")).toBeNull();
  });
});

describe("SoneDownloadProgress", () => {
  it("renders the bar and the caption in a status region", () => {
    const out = html(
      <SoneDownloadProgress frac={0.42} ariaLabel="Model download" />,
    );
    expect(out).toMatch(
      /^<sone-download-progress data-slot="download-progress" data-state="loading" data-size="sm"><div class="body" data-slot="download-progress-body" role="status"><sone-progress role="progressbar"/,
    );
    expect(out).toContain('aria-label="Model download"');
    expect(out).toContain(
      '<span class="caption" data-slot="download-progress-label">Downloading… 42%</span></div></sone-download-progress>',
    );
  });

  it("spins while unknown, joins the label and offers to cancel", () => {
    const onCancel = vi.fn();
    const { container, rerender } = render(
      <SoneDownloadProgress
        frac={null}
        label="Preparing…"
        cancellable
        onCancelRequested={onCancel}
      />,
    );
    const host = container.firstElementChild!;
    const caption = () => container.querySelector(".caption")!;
    expect(host.getAttribute("data-state")).toBe("indeterminate");
    expect(caption().querySelector("sone-spinner")).not.toBeNull();
    expect(caption().textContent).toBe("Preparing…");
    fireEvent.click(container.querySelector("button")!);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(container.querySelector("button")!.textContent).toBe(
      "Cancel download",
    );
    rerender(
      <SoneDownloadProgress frac={0.63} separator=" · " label="Example-3B" />,
    );
    expect(caption().textContent).toBe("Example-3B · 63%");
    expect(caption().querySelector("sone-spinner")).toBeNull();
    rerender(<SoneDownloadProgress frac={0} label="" />);
    expect(caption().textContent).toBe("0%");
    rerender(<SoneDownloadProgress frac={1} />);
    expect(host.getAttribute("data-state")).toBe("complete");
  });
});

describe("SonePowerSlider", () => {
  it("renders the track, the notches, the range and the labels", () => {
    expect(
      html(
        <SonePowerSlider rungs={RUNGS} value="balanced" ariaLabel="Power" />,
      ),
    ).toBe(
      '<sone-power-slider data-slot="power-slider" data-orientation="horizontal"><div class="ps-wrap">' +
        '<div class="ps-track" data-slot="power-slider-track" aria-hidden="true">' +
        '<span class="ps-fill" data-slot="power-slider-range" style="--ps-frac:0.5"></span>' +
        '<span class="ps-notch is-reached" style="--ps-frac:0"></span>' +
        '<span class="ps-notch is-reached" style="--ps-frac:0.5"></span>' +
        '<span class="ps-notch" style="--ps-frac:1"></span></div>' +
        '<input class="sone-range ps-input" data-slot="power-slider-thumb" type="range" min="0" step="1" max="2" aria-label="Power" aria-valuetext="Balanced" value="1">' +
        '<div class="ps-labels" data-slot="power-slider-labels" aria-hidden="true">' +
        '<span class="ps-label">Battery saver</span><span class="ps-label is-active">Balanced</span><span class="ps-label">Sharp</span>' +
        "</div></div></sone-power-slider>",
    );
  });

  it("previews while dragging and commits once on change or Page Up / Down", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <SonePowerSlider
        rungs={RUNGS}
        defaultValue="battery"
        onValueChange={onValueChange}
      />,
    );
    const input = container.querySelector("input")!;
    fireEvent.input(input, { target: { value: "2" } });
    expect(input.getAttribute("aria-valuetext")).toBe("Sharp");
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "2" } });
    expect(onValueChange).toHaveBeenLastCalledWith("sharp");
    fireEvent.keyDown(input, { key: "PageDown" });
    expect(onValueChange).toHaveBeenLastCalledWith("balanced");
    expect(input.getAttribute("aria-valuetext")).toBe("Balanced");
    rerender(<SonePowerSlider rungs={RUNGS} value="unknown" />);
    expect(container.querySelectorAll(".is-reached")).toHaveLength(0);
    expect(container.querySelectorAll(".is-active")).toHaveLength(0);
  });

  it("drops a preview when disabled mid-drag", () => {
    const onValueChange = vi.fn();
    const { container, rerender } = render(
      <SonePowerSlider
        rungs={RUNGS}
        value="battery"
        onValueChange={onValueChange}
      />,
    );
    const input = container.querySelector("input")!;
    fireEvent.input(input, { target: { value: "2" } });
    rerender(
      <SonePowerSlider
        rungs={RUNGS}
        value="battery"
        onValueChange={onValueChange}
        disabled
      />,
    );
    expect(input.value).toBe("0");
    expect(container.firstElementChild!.getAttribute("data-disabled")).toBe("");
    expect(container.querySelector(".ps-wrap")!.classList).toContain(
      "is-disabled",
    );
    fireEvent.keyDown(input, { key: "PageUp" });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
