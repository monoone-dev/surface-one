import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import {
  SoneLevelMeter,
  SoneMicToggle,
  SoneProcessingStatus,
  SoneRecordButton,
  SoneRecordingIndicator,
  SoneStatusOrb,
  SONE_DEFAULT_MESSAGES,
  SurfaceOne,
} from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

describe("recording twins", () => {
  it("renders the status orb, with a decorative spinner while processing", async () => {
    expect(await ssr(() => h(SoneStatusOrb, { state: "live" }))).toBe(
      '<sone-status-orb data-slot="status-orb" aria-hidden="true" data-state="live" data-size="default"></sone-status-orb>',
    );
    const busy = await ssr(() =>
      h(SoneStatusOrb, { state: "processing", size: "sm" }),
    );
    expect(busy).toContain(
      '<sone-status-orb data-slot="status-orb" aria-hidden="true" data-state="processing" data-size="sm"><sone-spinner data-slot="spinner">',
    );
    expect(busy).toContain(
      'aria-hidden="true" style="width:12px;height:12px;"',
    );
  });

  it("renders the record button directive as a styled button", async () => {
    expect(
      await ssr(() =>
        h(
          SoneRecordButton,
          { type: "button", state: "processing", withLabel: true, size: "sm" },
          () => "Saving",
        ),
      ),
    ).toBe(
      '<button class="record-btn" data-slot="record-button" data-state="processing" data-size="sm" data-with-label aria-busy="true" type="button">Saving</button>',
    );
  });

  it("sways the level meter, or draws one real sample per bar", async () => {
    const sway = await ssr(() => h(SoneLevelMeter, { level: 2, bars: 2 }));
    expect(sway).toBe(
      '<sone-level-meter data-slot="level-meter" aria-hidden="true" data-mode="sway" style="--level:1;">' +
        '<span class="bar" style="--i:0;"></span><span class="bar" style="--i:1;"></span></sone-level-meter>',
    );
    const w = mount(SoneLevelMeter, {
      props: { bars: 3, history: [0.9, 0.2, -1, 0.5] },
    });
    expect(w.attributes("data-mode")).toBe("history");
    expect(
      w
        .findAll<HTMLElement>(".bar")
        .map((b) => b.element.style.getPropertyValue("--v")),
    ).toEqual(["0.2", "0", "0.5"]);
    await w.setProps({ history: [0.4] });
    expect(
      w
        .findAll<HTMLElement>(".bar")
        .map((b) => b.element.style.getPropertyValue("--v")),
    ).toEqual(["0", "0", "0.4"]);
  });

  it("toggles the mic with the pressed state, labels and the muteToggle event", async () => {
    const w = mount(SoneMicToggle);
    expect(w.attributes()).toMatchObject({
      "data-slot": "mic-toggle",
      "data-state": "live",
    });
    const button = w.find("button");
    expect(button.classes()).toEqual(["toggle", "mic"]);
    expect(button.attributes()).toMatchObject({
      "data-slot": "toggle",
      "data-variant": "outline",
      "aria-pressed": "false",
      "aria-label": "Mute microphone",
      title: "Mute microphone",
    });
    expect(button.find(".mic-label").text()).toBe("Mute");
    await button.trigger("click");
    expect(w.emitted("muteToggle")).toHaveLength(1);
    await w.setProps({ muted: true, compact: true, unmuteLabel: "Unmute" });
    expect(w.attributes("data-state")).toBe("muted");
    expect(button.classes()).toEqual([
      "toggle",
      "mic",
      "is-muted",
      "is-compact",
    ]);
    expect(button.attributes("aria-pressed")).toBe("true");
    expect(button.attributes("aria-label")).toBe("Unmute");
    expect(button.find(".mic-label").exists()).toBe(false);
    expect(button.findAll("path")).toHaveLength(3);
  });

  it("names the processing stage, translated, with a progress track", async () => {
    const w = mount(SoneProcessingStatus, {
      props: { stage: "summarizing", progress: 0.42 },
      global: {
        plugins: [
          [
            SurfaceOne,
            {
              messages: {
                processingStage: (stage: string) =>
                  stage === "summarizing"
                    ? "Podsumowanie"
                    : SONE_DEFAULT_MESSAGES.processingStage(stage),
              },
            },
          ],
        ],
      },
    });
    expect(w.attributes()).toMatchObject({
      role: "status",
      "data-slot": "processing-status",
      "data-stage": "summarizing",
      "data-size": "default",
    });
    expect(w.find("sone-status-orb").attributes("data-state")).toBe(
      "processing",
    );
    expect(w.find('[data-slot="processing-status-label"]').text()).toBe(
      "Podsumowanie",
    );
    const track = w.find("sone-progress");
    expect(track.classes()).toContain("processing-status-track");
    expect(track.attributes()).toMatchObject({
      "aria-label": "Podsumowanie",
      "aria-valuenow": "42",
    });
    await w.setProps({ stage: "uploading", message: "  " });
    expect(w.find('[data-slot="processing-status-label"]').text()).toBe(
      "Uploading",
    );
    await w.setProps({ message: "Transcribing 3 of 7…" });
    expect(w.find('[data-slot="processing-status-label"]').text()).toBe(
      "Transcribing 3 of 7…",
    );
    await w.setProps({ stage: "error" });
    expect(w.find("sone-status-orb").attributes("data-state")).toBe("error");
    expect(w.find("sone-progress").exists()).toBe(false);
  });

  it("renders the recording indicator: orb, live timer and label", async () => {
    expect(
      await ssr(() =>
        h(SoneRecordingIndicator, {
          seconds: 754,
          label: "Recording",
          state: "paused",
          size: "sm",
        }),
      ),
    ).toBe(
      '<sone-recording-indicator data-slot="recording-indicator" data-state="paused" data-size="sm">' +
        '<sone-status-orb data-slot="status-orb" aria-hidden="true" data-state="paused" data-size="sm"></sone-status-orb>' +
        '<sone-elapsed-timer data-slot="elapsed-timer" data-size="sm" role="timer" aria-label="Recording time"><time datetime="PT12M34S">12:34</time></sone-elapsed-timer>' +
        '<span class="recording-indicator-label" data-slot="recording-indicator-label">Recording</span>' +
        "</sone-recording-indicator>",
    );
  });
});
