import { act, fireEvent, render } from "@testing-library/react";
import { createRef, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  SoneLiveTranscript,
  SoneTranscript,
  foldTranscriptTurns,
  type LiveTranscriptLine,
  type SoneLiveTranscriptHandle,
  type SoneTranscriptHandle,
  type TranscriptSegment,
} from "../src/index";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

const seg = (
  id: number,
  speakerKey: string | null,
  startS: number,
  text: string,
): TranscriptSegment => ({
  id,
  speakerKey,
  speaker: speakerKey === null ? null : `${speakerKey} Park`,
  tone: speakerKey === "ada" ? "me" : "others",
  startS,
  endS: startS + 5,
  text,
});

const TURNS = foldTranscriptTurns([
  seg(0, "ada", 0, "Hello there."),
  seg(1, "ada", 5, "Next item."),
  seg(2, "leo", 10, "Friday works."),
]);

describe("SoneTranscript", () => {
  // jsdom does not scroll.
  beforeAll(() => {
    Element.prototype.scrollIntoView = () => {};
    Element.prototype.scrollTo = () => {};
  });

  it("renders turns as messages with an avatar, a seekable time and fragments", () => {
    expect(
      html(<SoneTranscript turns={TURNS.slice(0, 1)} currentTime={6} />),
    ).toBe(
      '<sone-transcript data-slot="transcript"><div class="transcript-card panel-card">' +
        '<ul data-slot="message-group" class="turns">' +
        '<li data-slot="message" data-align="start" data-turn="t0" class="turn is-active">' +
        '<sone-avatar data-slot="message-avatar" data-size="sm" data-tone="me" aria-hidden="true" class="avatar turn-avatar">' +
        '<span data-slot="avatar-fallback" class="avatar-fallback">AP</span></sone-avatar>' +
        '<div data-slot="message-content"><div data-slot="message-header" class="turn-head">' +
        '<span class="turn-speaker">ada Park</span><span aria-hidden="true">·</span>' +
        '<button type="button" class="turn-time">0:00</button></div>' +
        '<div data-slot="bubble" data-variant="tinted" data-align="start">' +
        '<p data-slot="bubble-content" class="turn-text">' +
        '<button type="button" class="frag">Hello there.</button>' +
        '<button type="button" class="frag is-active">Next item.</button>' +
        "</p></div></div></li></ul></div></sone-transcript>",
    );
  });

  it("seeks, filters and shows the empty states", () => {
    const onSeek = vi.fn();
    const { container, rerender } = render(
      <SoneTranscript turns={TURNS} onSeek={onSeek} />,
    );
    fireEvent.click(container.querySelector(".turn-time")!);
    fireEvent.click(container.querySelectorAll(".frag")[2]!);
    expect(onSeek.mock.calls).toEqual([[0], [10]]);
    rerender(<SoneTranscript turns={TURNS} query="FRIDAY" />);
    expect(container.querySelectorAll(".turn")).toHaveLength(1);
    const empty = () =>
      container.querySelector('[data-slot="empty-description"]')!.textContent;
    rerender(<SoneTranscript turns={TURNS} query="nothing" />);
    expect(empty()).toBe("No turns match “nothing”.");
    rerender(<SoneTranscript turns={[]} />);
    expect(empty()).toBe("No transcript.");
    rerender(<SoneTranscript turns={TURNS} seekable={false} />);
    expect(
      container.querySelector<HTMLButtonElement>(".turn-time")!.disabled,
    ).toBe(true);
  });

  it("renders a window around the flashed turn, then all of them", () => {
    const onFlashEnd = vi.fn();
    const handle = createRef<SoneTranscriptHandle>();
    const { container } = render(
      <SoneTranscript
        turns={TURNS}
        renderCap={1}
        flashId={2}
        flashSeq={3}
        onFlashEnd={onFlashEnd}
        handleRef={handle}
      />,
    );
    const turns = () =>
      Array.from(container.querySelectorAll(".turn")).map((t) =>
        t.getAttribute("data-turn"),
      );
    expect(turns()).toEqual(["t2"]);
    const frag = container.querySelector(".is-flash")!;
    expect(frag.getAttribute("data-flash")).toBe("2#3");
    // jsdom has no CSS animations, so React listens for the prefixed name.
    fireEvent(frag, new Event("webkitAnimationEnd", { bubbles: true }));
    expect(onFlashEnd).toHaveBeenCalledWith(2);
    const more = container.querySelector(".show-all")!;
    expect(more.textContent).toBe("Show all 2 turns+1");
    fireEvent.click(more);
    expect(turns()).toHaveLength(2);
    expect(container.querySelector(".show-all")).toBeNull();
    expect(handle.current!.expanded).toBe(true);
    act(() => handle.current!.collapse());
    expect(turns()).toHaveLength(1);
  });
});

const LINES: LiveTranscriptLine[] = [
  {
    id: "l1",
    speaker: "Leo Ruiz",
    tone: "others",
    timeLabel: "0:04",
    datetime: "PT4S",
    final: true,
    flag: "Possible question",
    text: "Can we ship?",
    translation: "Czy możemy wydać?",
  },
  {
    id: "l2",
    speaker: "Ada Park",
    tone: "me",
    timeLabel: "0:09",
    final: false,
    text: "I think",
  },
];

describe("SoneLiveTranscript", () => {
  it("renders the log with final and partial lines", () => {
    const out = html(<SoneLiveTranscript lines={LINES} translationLang="pl" />);
    expect(out).toContain(
      '<sone-live-transcript data-slot="live-transcript" data-state="following">' +
        '<div class="transcript" role="log" aria-live="off" tabindex="0" aria-label="Live transcript history">' +
        '<article data-slot="message" data-align="start" class="bubble-row is-flagged">' +
        '<sone-avatar data-slot="message-avatar" data-size="sm" data-tone="others" aria-hidden="true" class="avatar line-avatar">' +
        '<span data-slot="avatar-fallback" class="avatar-fallback">LR</span></sone-avatar>' +
        '<div data-slot="message-content"><div data-slot="message-header" class="bubble-meta">' +
        '<span class="speaker">Leo Ruiz</span><span aria-hidden="true">·</span>' +
        '<time datetime="PT4S" title="PT4S">0:04</time></div>' +
        '<div data-slot="bubble" data-variant="muted" data-align="start">' +
        '<p data-slot="bubble-content" class="bubble">Can we ship?</p>' +
        '<p class="translation" lang="pl">Czy możemy wydać?</p></div>' +
        '<div data-slot="message-footer"><span data-slot="badge" data-variant="warning" class="badge question-label">Possible question</span></div>' +
        "</div></article>",
    );
    expect(out).toContain(
      '<article data-slot="message" data-align="end" class="bubble-row is-me is-partial">',
    );
    expect(out).toContain(
      '<time>0:09</time><span aria-hidden="true">·</span><span>Listening…</span></div>' +
        '<div data-slot="marker" data-variant="default" class="bubble">' +
        '<span data-slot="marker-content" class="shimmer">I think</span></div>',
    );
    expect(out).not.toContain("jump-btn");
  });

  it("shows older lines, jumps to the latest and reports the bottom", () => {
    const onShowOlder = vi.fn();
    const onJumpToLatest = vi.fn();
    const onAtBottomChange = vi.fn();
    const handle = createRef<SoneLiveTranscriptHandle>();
    const { container } = render(
      <SoneLiveTranscript
        canShowOlder
        following={false}
        onShowOlder={onShowOlder}
        onJumpToLatest={onJumpToLatest}
        onAtBottomChange={onAtBottomChange}
        handleRef={handle}
      >
        <p className="empty">Nothing yet</p>
      </SoneLiveTranscript>,
    );
    expect(container.firstElementChild!.getAttribute("data-state")).toBe(
      "scrolled",
    );
    expect(container.querySelector(".empty")!.textContent).toBe("Nothing yet");
    fireEvent.click(container.querySelector(".older-btn")!);
    expect(onShowOlder).toHaveBeenCalledTimes(1);
    const jump = container.querySelector(".jump-btn")!;
    expect(jump.textContent).toBe("Live transcript · Jump to latest");
    fireEvent.click(jump);
    expect(onJumpToLatest).toHaveBeenCalledTimes(1);
    const log = container.querySelector<HTMLElement>('[role="log"]')!;
    Object.defineProperty(log, "scrollHeight", { value: 500 });
    Object.defineProperty(log, "clientHeight", { value: 100 });
    log.scrollTop = 380;
    fireEvent.scroll(log);
    log.scrollTop = 100;
    fireEvent.scroll(log);
    expect(onAtBottomChange.mock.calls).toEqual([[true], [false]]);
    handle.current!.scrollToEnd();
    expect(log.scrollTop).toBe(500);
  });
});
