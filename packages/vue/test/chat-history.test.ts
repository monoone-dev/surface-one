import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import { SoneChatHistory, provideSoneMessages } from "../src/index";

const NOW = new Date(2026, 8, 24, 12, 0);
const at = (daysAgo: number) =>
  new Date(2026, 8, 24 - daysAgo, 9, 30).toISOString();

const THREADS = [
  { id: "t1", title: "Paper skin decision", updatedAt: at(0) },
  { id: "t2", title: "Hiring debrief", updatedAt: at(1) },
  { id: "t3", title: "Licensing thread", updatedAt: at(4) },
  { id: "t4", title: "Planning recap", updatedAt: at(12) },
  { id: "t5", title: "Old roadmap", updatedAt: at(90), updatedLabel: "July" },
];

const rows = (w: ReturnType<typeof mount>) => w.findAll(".history-row");

describe("SoneChatHistory", () => {
  it("renders the Angular markup: a named region, a list of item buttons", () => {
    const w = mount(SoneChatHistory, {
      props: { threads: THREADS, activeThreadId: "t2" },
    });
    expect(w.element.tagName).toBe("SONE-CHAT-HISTORY");
    expect(w.attributes("data-slot")).toBe("chat-history");
    expect(w.attributes("data-variant")).toBe("list");
    expect(w.get("section.history").attributes("aria-label")).toBe(
      "Conversation history",
    );
    const list = w.get(".history-list");
    expect(list.attributes("role")).toBe("list");
    expect(list.attributes("data-slot")).toBe("chat-history-list");
    expect(w.findAll('[role="listitem"]')).toHaveLength(5);
    const row = rows(w)[1]!;
    expect(row.element.tagName).toBe("BUTTON");
    expect(row.classes()).toContain("item");
    expect(row.attributes("data-slot")).toBe("item");
    expect(row.attributes("data-size")).toBe("sm");
    expect(row.attributes("aria-current")).toBe("true");
    expect(row.attributes("data-active")).toBe("true");
    expect(rows(w)[0]!.attributes("aria-current")).toBeUndefined();
    // list: the date under the title, no tooltip
    expect(rows(w)[4]!.get(".history-updated").text()).toBe("July");
    expect(rows(w)[4]!.attributes("title")).toBeUndefined();
  });

  it("emits selected with the thread id; the opening row is disabled and busy", async () => {
    const w = mount(SoneChatHistory, {
      props: { threads: THREADS, loadingThreadId: "t3" },
    });
    await rows(w)[0]!.trigger("click");
    expect(w.emitted("selected")).toEqual([["t1"]]);
    const opening = rows(w)[2]!;
    expect(opening.attributes("disabled")).toBeDefined();
    expect(opening.attributes("aria-busy")).toBe("true");
    expect(opening.find("sone-spinner").exists()).toBe(true);
  });

  it("sidebar: groups by age, the date in the tooltip", () => {
    const w = mount(SoneChatHistory, {
      props: { threads: THREADS, variant: "sidebar", now: NOW },
    });
    expect(w.findAll(".history-group-label").map((g) => g.text())).toEqual([
      "Today",
      "Yesterday",
      "Previous 7 days",
      "Previous 30 days",
      "Older",
    ]);
    expect(w.find(".history-updated").exists()).toBe(false);
    expect(rows(w)[4]!.attributes("title")).toBe("July");
  });

  it("query filters the titles and says when nothing matches", async () => {
    const w = mount(SoneChatHistory, {
      props: { threads: THREADS, query: "  PLAN " },
    });
    expect(rows(w).map((r) => r.get(".history-title").text())).toEqual([
      "Planning recap",
    ]);
    await w.setProps({ query: "budget" });
    expect(rows(w)).toHaveLength(0);
    expect(w.get(".history-list").attributes("role")).toBeUndefined();
    expect(w.get(".history-no-match").text()).toBe(
      "No conversations match “budget”.",
    );
  });

  it("first load, load error with retry, empty", async () => {
    const w = mount(SoneChatHistory, { props: { loading: true } });
    expect(w.get('[role="status"]').text()).toBe("Loading conversations…");
    await w.setProps({ loading: false, error: "Database locked." });
    const alert = w.get('[role="alert"]');
    expect(alert.text()).toContain("Database locked.");
    await alert.get("button").trigger("click");
    expect(w.emitted("retryRequested")).toHaveLength(1);
    await w.setProps({ error: null, emptyDescription: "Ask something." });
    expect(w.get(".empty-title").text()).toBe("No conversations yet");
    expect(w.get(".empty").text()).toBe("Ask something.");
  });

  it("cached rows stay while refreshing or after a failed refresh", async () => {
    const w = mount(SoneChatHistory, {
      props: { threads: THREADS, loading: true, notice: "Couldn’t delete." },
    });
    expect(rows(w)).toHaveLength(5);
    expect(w.get(".history-refresh").text()).toBe("Refreshing…");
    expect(w.get(".history-notice").text()).toBe("Couldn’t delete.");
    await w.setProps({ loading: false, error: "Couldn’t refresh." });
    expect(rows(w)).toHaveLength(5);
    await w.get(".alert-action button").trigger("click");
    expect(w.emitted("retryRequested")).toHaveLength(1);
  });

  it("takes its strings from the messages", async () => {
    const app = createSSRApp({
      render: () =>
        h(SoneChatHistory, { threads: THREADS, variant: "sidebar", now: NOW }),
    });
    provideSoneMessages(app, {
      chatHistoryLabel: "Historia rozmów",
      chatHistoryToday: "Dziś",
    });
    const html = await renderToString(app);
    expect(html).toContain('aria-label="Historia rozmów"');
    expect(html).toContain("Dziś");
  });
});
