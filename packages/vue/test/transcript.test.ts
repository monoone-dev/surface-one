import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { beforeAll, describe, expect, it } from "vitest";

import {
  SoneLiveTranscript,
  SoneTranscript,
  foldTranscriptTurns,
  type LiveTranscriptLine,
  type SoneLiveTranscriptExposed,
  type SoneTranscriptExposed,
  type TranscriptSegment,
} from "../src/index";

const ssr = async (render: () => unknown): Promise<string> =>
  (await renderToString(createSSRApp({ render }))).replace(
    /<!--\[-->|<!--\]-->|<!---->/g,
    "",
  );

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

  it("renders turns as messages with an avatar, a seekable time and fragments", async () => {
    const out = await ssr(() =>
      h(SoneTranscript, { turns: TURNS.slice(0, 1), currentTime: 6 }),
    );
    expect(out).toBe(
      '<sone-transcript data-slot="transcript"><div class="transcript-card panel-card">' +
        '<ul data-slot="message-group" class="turns">' +
        '<li data-slot="message" data-align="start" class="turn is-active" data-turn="t0">' +
        '<sone-avatar class="avatar turn-avatar" data-slot="message-avatar" data-size="sm" data-tone="me" aria-hidden="true">' +
        '<span class="avatar-fallback" data-slot="avatar-fallback">AP</span></sone-avatar>' +
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

  it("seeks, filters and shows the empty states", async () => {
    const w = mount(SoneTranscript, { props: { turns: TURNS } });
    await w.find(".turn-time").trigger("click");
    await w.findAll(".frag")[2]!.trigger("click");
    expect(w.emitted("seek")).toEqual([[0], [10]]);
    await w.setProps({ query: "FRIDAY" });
    expect(w.findAll(".turn")).toHaveLength(1);
    await w.setProps({ query: "nothing" });
    expect(w.find('[data-slot="empty-description"]').text()).toBe(
      "No turns match “nothing”.",
    );
    await w.setProps({ turns: [] });
    expect(w.find('[data-slot="empty-description"]').text()).toBe(
      "No transcript.",
    );
    await w.setProps({ turns: TURNS, query: "", seekable: false });
    expect(w.find(".turn-time").attributes("disabled")).toBeDefined();
  });

  it("renders a window around the flashed turn, then all of them", async () => {
    const w = mount(SoneTranscript, {
      props: { turns: TURNS, renderCap: 1, flashId: 2, flashSeq: 3 },
    });
    expect(w.findAll(".turn").map((t) => t.attributes("data-turn"))).toEqual([
      "t2",
    ]);
    const frag = w.find(".is-flash");
    expect(frag.attributes("data-flash")).toBe("2#3");
    await frag.trigger("animationend");
    expect(w.emitted("flashEnd")).toEqual([[2]]);
    const more = w.find(".show-all");
    expect(more.text()).toBe("Show all 2 turns+1");
    await more.trigger("click");
    expect(w.findAll(".turn")).toHaveLength(2);
    expect(w.find(".show-all").exists()).toBe(false);
    const exposed = w.vm as unknown as SoneTranscriptExposed;
    expect(exposed.expanded).toBe(true);
    exposed.collapse();
    await w.vm.$nextTick();
    expect(w.findAll(".turn")).toHaveLength(1);
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
  it("renders the log with final and partial lines", async () => {
    const out = await ssr(() =>
      h(SoneLiveTranscript, { lines: LINES, translationLang: "pl" }),
    );
    expect(out).toContain(
      '<sone-live-transcript data-slot="live-transcript" data-state="following">' +
        '<div class="transcript" role="log" aria-live="off" tabindex="0" aria-label="Live transcript history">' +
        '<article data-slot="message" data-align="start" class="bubble-row is-flagged">' +
        '<sone-avatar class="avatar line-avatar" data-slot="message-avatar" data-size="sm" data-tone="others" aria-hidden="true">' +
        '<span class="avatar-fallback" data-slot="avatar-fallback">LR</span></sone-avatar>' +
        '<div data-slot="message-content"><div data-slot="message-header" class="bubble-meta">' +
        '<span class="speaker">Leo Ruiz</span><span aria-hidden="true">·</span>' +
        '<time datetime="PT4S" title="PT4S">0:04</time></div>' +
        '<div data-slot="bubble" data-variant="muted" data-align="start">' +
        '<p data-slot="bubble-content" class="bubble">Can we ship?</p>' +
        '<p class="translation" lang="pl">Czy możemy wydać?</p></div>' +
        '<div data-slot="message-footer"><span class="badge question-label" data-slot="badge" data-variant="warning">Possible question</span></div>' +
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

  it("shows older lines, jumps to the latest and reports the bottom", async () => {
    const w = mount(SoneLiveTranscript, {
      props: { lines: [], canShowOlder: true, following: false },
      slots: { default: () => h("p", { class: "empty" }, "Nothing yet") },
    });
    expect(w.attributes("data-state")).toBe("scrolled");
    expect(w.find(".empty").text()).toBe("Nothing yet");
    await w.find(".older-btn").trigger("click");
    expect(w.emitted("showOlder")).toHaveLength(1);
    const jump = w.find(".jump-btn");
    expect(jump.text()).toBe("Live transcript · Jump to latest");
    await jump.trigger("click");
    expect(w.emitted("jumpToLatest")).toHaveLength(1);
    const log = w.find('[role="log"]').element as HTMLElement;
    Object.defineProperty(log, "scrollHeight", { value: 500 });
    Object.defineProperty(log, "clientHeight", { value: 100 });
    log.scrollTop = 380;
    await w.find('[role="log"]').trigger("scroll");
    log.scrollTop = 100;
    await w.find('[role="log"]').trigger("scroll");
    expect(w.emitted("atBottomChange")).toEqual([[true], [false]]);
    (w.vm as unknown as SoneLiveTranscriptExposed).scrollToEnd();
    expect(log.scrollTop).toBe(500);
  });
});
