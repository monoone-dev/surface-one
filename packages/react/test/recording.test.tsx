import { fireEvent, render } from "@testing-library/react";
import type { ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SONE_DEFAULT_MESSAGES,
  SoneLevelMeter,
  SoneMicToggle,
  SoneProcessingStatus,
  SoneRecordButton,
  SoneRecordingIndicator,
  SoneStatusOrb,
  SurfaceOneProvider,
} from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

describe("recording twins", () => {
  it("renders the status orb, with a decorative spinner while processing", () => {
    expect(html(<SoneStatusOrb state="live" />)).toBe(
      '<sone-status-orb data-slot="status-orb" aria-hidden="true" data-state="live" data-size="default"></sone-status-orb>',
    );
    const busy = html(<SoneStatusOrb state="processing" size="sm" />);
    expect(busy).toContain(
      '<sone-status-orb data-slot="status-orb" aria-hidden="true" data-state="processing" data-size="sm"><sone-spinner data-slot="spinner">',
    );
    expect(busy).toContain('aria-hidden="true" style="width:12px;height:12px"');
  });

  it("renders the record button directive as a styled button", () => {
    expect(
      html(
        <SoneRecordButton type="button" state="processing" withLabel size="sm">
          Saving
        </SoneRecordButton>,
      ),
    ).toBe(
      '<button data-slot="record-button" data-state="processing" data-size="sm" data-with-label="" aria-busy="true" type="button" class="record-btn">Saving</button>',
    );
  });

  it("sways the level meter, or draws one real sample per bar", () => {
    expect(html(<SoneLevelMeter level={2} bars={2} />)).toBe(
      '<sone-level-meter data-slot="level-meter" aria-hidden="true" data-mode="sway" style="--level:1">' +
        '<span class="bar" style="--i:0"></span><span class="bar" style="--i:1"></span></sone-level-meter>',
    );
    const { container, rerender } = render(
      <SoneLevelMeter bars={3} history={[0.9, 0.2, -1, 0.5]} />,
    );
    const values = () =>
      Array.from(container.querySelectorAll<HTMLElement>(".bar")).map((b) =>
        b.style.getPropertyValue("--v"),
      );
    expect(container.firstElementChild!.getAttribute("data-mode")).toBe(
      "history",
    );
    expect(values()).toEqual(["0.2", "0", "0.5"]);
    rerender(<SoneLevelMeter bars={3} history={[0.4]} />);
    expect(values()).toEqual(["0", "0", "0.4"]);
  });

  it("toggles the mic with the pressed state, labels and onMuteToggle", () => {
    const onMuteToggle = vi.fn();
    const { container, rerender } = render(
      <SoneMicToggle onMuteToggle={onMuteToggle} />,
    );
    const host = container.firstElementChild!;
    expect(host.getAttribute("data-state")).toBe("live");
    const button = container.querySelector("button")!;
    expect(button.className).toBe("toggle mic");
    expect(button.getAttribute("data-variant")).toBe("outline");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("aria-label")).toBe("Mute microphone");
    expect(button.getAttribute("title")).toBe("Mute microphone");
    expect(button.querySelector(".mic-label")!.textContent).toBe("Mute");
    fireEvent.click(button);
    expect(onMuteToggle).toHaveBeenCalledTimes(1);
    rerender(<SoneMicToggle muted compact unmuteLabel="Unmute" />);
    expect(host.getAttribute("data-state")).toBe("muted");
    expect(button.className).toBe("toggle mic is-muted is-compact");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-label")).toBe("Unmute");
    expect(button.querySelector(".mic-label")).toBeNull();
    expect(button.querySelectorAll("path")).toHaveLength(3);
  });

  it("names the processing stage, translated, with a progress track", () => {
    const messages = {
      processingStage: (stage: string) =>
        stage === "summarizing"
          ? "Podsumowanie"
          : SONE_DEFAULT_MESSAGES.processingStage(stage),
    };
    const { container, rerender } = render(
      <SurfaceOneProvider messages={messages}>
        <SoneProcessingStatus stage="summarizing" progress={0.42} />
      </SurfaceOneProvider>,
    );
    const host = container.querySelector("sone-processing-status")!;
    expect(host.getAttribute("role")).toBe("status");
    expect(host.getAttribute("data-stage")).toBe("summarizing");
    const label = () =>
      container.querySelector('[data-slot="processing-status-label"]')!
        .textContent;
    expect(label()).toBe("Podsumowanie");
    const track = container.querySelector("sone-progress")!;
    expect(track.getAttribute("class")).toBe("processing-status-track");
    expect(track.getAttribute("aria-label")).toBe("Podsumowanie");
    expect(track.getAttribute("aria-valuenow")).toBe("42");
    rerender(<SoneProcessingStatus stage="uploading" message="  " />);
    expect(label()).toBe("Uploading");
    rerender(<SoneProcessingStatus stage="error" />);
    expect(
      container.querySelector("sone-status-orb")!.getAttribute("data-state"),
    ).toBe("error");
    expect(container.querySelector("sone-progress")).toBeNull();
  });

  it("renders the recording indicator: orb, live timer and label", () => {
    expect(
      html(
        <SoneRecordingIndicator
          seconds={754}
          label="Recording"
          state="paused"
          size="sm"
        />,
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
