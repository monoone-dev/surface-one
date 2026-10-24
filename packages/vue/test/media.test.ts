import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  SoneAudioPlayer,
  SoneDownloadProgress,
  SoneFloatingBar,
  SonePowerSlider,
  type SoneAudioPlayerExposed,
} from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

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

  it("renders an empty host until there is a source", async () => {
    expect(await ssr(() => h(SoneAudioPlayer))).toBe(
      '<sone-audio-player data-slot="audio-player" data-state="paused"></sone-audio-player>',
    );
  });

  it("renders the controls with their names, the time and the seek slider", async () => {
    const out = await ssr(() => h(SoneAudioPlayer, { src: "a.wav" }));
    expect(out).toContain('<audio src="a.wav" preload="metadata"></audio>');
    expect(out).toContain(
      '<button class="btn play" data-slot="button" data-variant="default" data-size="icon" type="button" aria-label="Play">',
    );
    expect(out).toContain(
      '<div class="btn-group skip" role="group" data-slot="button-group" data-orientation="horizontal" aria-label="Skip">',
    );
    expect(out).toContain('aria-label="Back 15 seconds">');
    expect(out).toContain(
      'aria-label="Forward 15 seconds">15s<svg data-icon="inline-end"',
    );
    expect(out).toContain(
      '<span class="time" data-slot="audio-player-time">0:00</span>' +
        '<div class="track" data-slot="audio-player-progress" role="slider" tabindex="0" aria-label="Seek" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00 of 0:00" style="--track-fill:0%;">' +
        '<span class="track-thumb" aria-hidden="true"></span></div>' +
        '<span class="time time-total" data-slot="audio-player-duration">0:00</span>',
    );
    expect(out).toContain('aria-label="Playback speed">1×</button>');
  });

  it("plays, seeks with the keys, skips and cycles the speed", async () => {
    const w = mount(SoneAudioPlayer, {
      props: { src: "a.wav", rates: [1, 2] },
    });
    const audio = w.find("audio").element as HTMLAudioElement;
    Object.defineProperty(audio, "duration", {
      value: 120,
      configurable: true,
    });
    await w.find("audio").trigger("loadedmetadata");
    expect(w.emitted("durationChange")).toEqual([[120]]);
    expect(w.find(".time-total").text()).toBe("2:00");

    await w.find(".play").trigger("click");
    expect(w.attributes("data-state")).toBe("playing");
    expect(w.find(".play").attributes("aria-label")).toBe("Pause");
    expect(w.find(".play").classes()).toContain("is-playing");
    expect(w.emitted("playingChange")).toEqual([[true]]);

    const track = w.find('[role="slider"]');
    await track.trigger("keydown", { key: "ArrowRight" });
    expect(w.emitted("userSeek")).toEqual([[5]]);
    expect(track.attributes("aria-valuenow")).toBe("5");
    expect(track.attributes("aria-valuetext")).toBe("0:05 of 2:00");
    await track.trigger("keydown", { key: "End" });
    expect(audio.currentTime).toBe(120);
    await w.findAll(".skip button")[0]!.trigger("click");
    expect(audio.currentTime).toBe(105);
    await track.trigger("keydown", { key: " " });
    expect(w.attributes("data-state")).toBe("paused");

    await w.find(".rate").trigger("click");
    expect(w.find(".rate").text()).toBe("2×");
    expect(audio.playbackRate).toBe(2);

    const exposed = w.vm as unknown as SoneAudioPlayerExposed;
    expect(exposed.seekTo(30, { play: false })).toBe(true);
    await w.vm.$nextTick();
    expect(w.find(".time").text()).toBe("0:30");
    exposed.stopAndUnload();
    await w.vm.$nextTick();
    expect(audio.hasAttribute("src")).toBe(false);
    expect(w.find(".time").text()).toBe("0:00");
  });
});

describe("SoneFloatingBar", () => {
  it("renders the chrome, the content and the close button", async () => {
    const out = await ssr(() =>
      h(
        SoneFloatingBar,
        { state: "live", dragRegionAttr: "data-tauri-drag-region" },
        () => h("span", "Recording"),
      ),
    );
    expect(out).toContain(
      '<sone-floating-bar data-slot="floating-bar" data-state="live">' +
        '<div class="floating-bar" data-slot="floating-bar-chrome" data-tauri-drag-region="deep">' +
        '<div class="floating-bar-content"><span>Recording</span></div>' +
        '<button class="btn floating-bar-close" data-slot="floating-bar-close" data-variant="ghost" data-size="icon-xs" type="button" aria-label="Hide">' +
        '<sone-icon data-slot="icon" data-icon="close">',
    );
    expect(out).toMatch(/<\/sone-icon><\/button><\/div><\/sone-floating-bar>$/);
  });

  it("emits closed, and hides the button when not closable", async () => {
    const w = mount(SoneFloatingBar, { props: { closeLabel: "Close bar" } });
    await w.find("button").trigger("click");
    expect(w.emitted("closed")).toHaveLength(1);
    expect(w.find("button").attributes("aria-label")).toBe("Close bar");
    await w.setProps({ closable: false });
    expect(w.find("button").exists()).toBe(false);
  });
});

describe("SoneDownloadProgress", () => {
  it("renders the bar and the caption in a status region", async () => {
    const out = await ssr(() =>
      h(SoneDownloadProgress, {
        frac: 0.42,
        ariaLabel: "Model download",
      }),
    );
    expect(out).toMatch(
      /^<sone-download-progress data-slot="download-progress" data-state="loading" data-size="sm"><div class="body" data-slot="download-progress-body" role="status"><sone-progress role="progressbar"/,
    );
    expect(out).toContain('aria-label="Model download"');
    expect(out).toContain(
      '<span class="caption" data-slot="download-progress-label">Downloading… 42%</span></div></sone-download-progress>',
    );
  });

  it("spins while unknown, joins the label and offers to cancel", async () => {
    const w = mount(SoneDownloadProgress, {
      props: { frac: null, label: "Preparing…", cancellable: true },
    });
    expect(w.attributes("data-state")).toBe("indeterminate");
    expect(w.find(".caption sone-spinner").exists()).toBe(true);
    expect(w.find(".caption").text()).toBe("Preparing…");
    await w.find("button").trigger("click");
    expect(w.emitted("cancelRequested")).toHaveLength(1);
    expect(w.find("button").text()).toBe("Cancel download");
    await w.setProps({ frac: 0.63, separator: " · ", label: "Example-3B" });
    expect(w.find(".caption").text()).toBe("Example-3B · 63%");
    expect(w.find(".caption sone-spinner").exists()).toBe(false);
    await w.setProps({ frac: 0, label: "" });
    expect(w.find(".caption").text()).toBe("0%");
    await w.setProps({ frac: 1 });
    expect(w.attributes("data-state")).toBe("complete");
  });
});

describe("SonePowerSlider", () => {
  it("renders the track, the notches, the range and the labels", async () => {
    const out = await ssr(() =>
      h(SonePowerSlider, {
        rungs: RUNGS,
        modelValue: "balanced",
        ariaLabel: "Power",
      }),
    );
    expect(out).toBe(
      '<sone-power-slider data-slot="power-slider" data-orientation="horizontal"><div class="ps-wrap">' +
        '<div class="ps-track" data-slot="power-slider-track" aria-hidden="true">' +
        '<span class="ps-fill" data-slot="power-slider-range" style="--ps-frac:0.5;"></span>' +
        '<span class="ps-notch is-reached" style="--ps-frac:0;"></span>' +
        '<span class="ps-notch is-reached" style="--ps-frac:0.5;"></span>' +
        '<span class="ps-notch" style="--ps-frac:1;"></span></div>' +
        '<input class="sone-range ps-input" data-slot="power-slider-thumb" type="range" min="0" step="1" max="2" value="1" aria-label="Power" aria-valuetext="Balanced">' +
        '<div class="ps-labels" data-slot="power-slider-labels" aria-hidden="true">' +
        '<span class="ps-label">Battery saver</span><span class="ps-label is-active">Balanced</span><span class="ps-label">Sharp</span>' +
        "</div></div></sone-power-slider>",
    );
  });

  it("previews while dragging and commits once on change or Page Up / Down", async () => {
    const w = mount(SonePowerSlider, {
      props: { rungs: RUNGS, modelValue: "battery" },
    });
    const input = w.find("input");
    (input.element as HTMLInputElement).value = "2";
    await input.trigger("input");
    expect(input.attributes("aria-valuetext")).toBe("Sharp");
    expect(w.emitted("update:modelValue")).toBeUndefined();
    await input.trigger("change");
    expect(w.emitted("update:modelValue")).toEqual([["sharp"]]);
    await input.trigger("keydown", { key: "PageDown" });
    expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["balanced"]);
    await w.setProps({ modelValue: "unknown" });
    expect(w.findAll(".is-reached")).toHaveLength(0);
    expect(w.findAll(".is-active")).toHaveLength(0);
  });

  it("drops a preview when disabled mid-drag", async () => {
    const w = mount(SonePowerSlider, {
      props: { rungs: RUNGS, modelValue: "battery" },
    });
    const input = w.find("input");
    const el = input.element as HTMLInputElement;
    el.value = "2";
    await input.trigger("input");
    await w.setProps({ disabled: true });
    expect(el.value).toBe("0");
    expect(w.attributes("data-disabled")).toBe("");
    expect(w.find(".ps-wrap").classes()).toContain("is-disabled");
    await input.trigger("keydown", { key: "PageUp" });
    expect(w.emitted("update:modelValue")).toBeUndefined();
  });
});
