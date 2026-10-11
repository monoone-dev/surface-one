import { fireEvent, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { SoneChatHistory } from "../src/components/chat-history";
import { SoneMessagesProvider } from "../src/context/messages";

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

const rows = (root: ParentNode = document) => [
  ...root.querySelectorAll<HTMLElement>(".history-row"),
];

describe("SoneChatHistory", () => {
  it("renders the Angular markup: a named region, a list of item buttons", () => {
    const { container } = render(
      <SoneChatHistory threads={THREADS} activeThreadId="t2" />,
    );
    const host = container.firstElementChild!;
    expect(host.tagName).toBe("SONE-CHAT-HISTORY");
    expect(host.getAttribute("data-slot")).toBe("chat-history");
    expect(host.getAttribute("data-variant")).toBe("list");
    expect(
      host.querySelector("section.history")!.getAttribute("aria-label"),
    ).toBe("Conversation history");
    const list = host.querySelector(".history-list")!;
    expect(list.getAttribute("role")).toBe("list");
    expect(list.getAttribute("data-slot")).toBe("chat-history-list");
    expect(host.querySelectorAll('[role="listitem"]')).toHaveLength(5);
    const row = rows()[1]!;
    expect(row.tagName).toBe("BUTTON");
    expect(row.classList).toContain("item");
    expect(row.getAttribute("data-slot")).toBe("item");
    expect(row.getAttribute("data-size")).toBe("sm");
    expect(row.getAttribute("aria-current")).toBe("true");
    expect(row.getAttribute("data-active")).toBe("true");
    expect(rows()[0]!.getAttribute("aria-current")).toBeNull();
    // list: the date under the title, no tooltip
    expect(rows()[4]!.querySelector(".history-updated")!.textContent).toBe(
      "July",
    );
    expect(rows()[4]!.getAttribute("title")).toBeNull();
  });

  it("calls onSelected with the thread id; the opening row is disabled and busy", () => {
    const onSelected = vi.fn();
    render(
      <SoneChatHistory
        threads={THREADS}
        loadingThreadId="t3"
        onSelected={onSelected}
      />,
    );
    fireEvent.click(rows()[0]!);
    expect(onSelected.mock.calls).toEqual([["t1"]]);
    const opening = rows()[2]!;
    expect(opening.hasAttribute("disabled")).toBe(true);
    expect(opening.getAttribute("aria-busy")).toBe("true");
    expect(opening.querySelector("sone-spinner")).toBeTruthy();
  });

  it("sidebar: groups by age, the date in the tooltip", () => {
    render(<SoneChatHistory threads={THREADS} variant="sidebar" now={NOW} />);
    expect(
      [...document.querySelectorAll(".history-group-label")].map(
        (g) => g.textContent,
      ),
    ).toEqual([
      "Today",
      "Yesterday",
      "Previous 7 days",
      "Previous 30 days",
      "Older",
    ]);
    expect(document.querySelector(".history-updated")).toBeNull();
    expect(rows()[4]!.getAttribute("title")).toBe("July");
  });

  it("query filters the titles and says when nothing matches", () => {
    const { rerender } = render(
      <SoneChatHistory threads={THREADS} query="  PLAN " />,
    );
    expect(
      rows().map((r) => r.querySelector(".history-title")!.textContent),
    ).toEqual(["Planning recap"]);
    rerender(<SoneChatHistory threads={THREADS} query="budget" />);
    expect(rows()).toHaveLength(0);
    expect(
      document.querySelector(".history-list")!.getAttribute("role"),
    ).toBeNull();
    expect(document.querySelector(".history-no-match")!.textContent).toBe(
      "No conversations match “budget”.",
    );
  });

  it("first load, load error with retry, empty", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <SoneChatHistory loading onRetryRequested={onRetry} />,
    );
    expect(document.querySelector('[role="status"]')!.textContent).toBe(
      "Loading conversations…",
    );
    rerender(
      <SoneChatHistory error="Database locked." onRetryRequested={onRetry} />,
    );
    const alert = document.querySelector('[role="alert"]')!;
    expect(alert.textContent).toContain("Database locked.");
    fireEvent.click(alert.querySelector("button")!);
    expect(onRetry).toHaveBeenCalledTimes(1);
    rerender(
      <SoneChatHistory
        emptyDescription="Ask something."
        onRetryRequested={onRetry}
      />,
    );
    expect(document.querySelector(".empty-title")!.textContent).toBe(
      "No conversations yet",
    );
    expect(document.querySelector(".empty")!.textContent).toBe(
      "Ask something.",
    );
  });

  it("cached rows stay while refreshing or after a failed refresh", () => {
    const onRetry = vi.fn();
    const { rerender } = render(
      <SoneChatHistory threads={THREADS} loading notice="Couldn’t delete." />,
    );
    expect(rows()).toHaveLength(5);
    expect(document.querySelector(".history-refresh")!.textContent).toBe(
      "Refreshing…",
    );
    expect(document.querySelector(".history-notice")!.textContent).toBe(
      "Couldn’t delete.",
    );
    rerender(
      <SoneChatHistory
        threads={THREADS}
        error="Couldn’t refresh."
        onRetryRequested={onRetry}
      />,
    );
    expect(rows()).toHaveLength(5);
    fireEvent.click(document.querySelector(".alert-action button")!);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders on the server and takes its strings from the messages", () => {
    const html = renderToString(
      <SoneMessagesProvider
        messages={{
          chatHistoryLabel: "Historia rozmów",
          chatHistoryToday: "Dziś",
        }}
      >
        <SoneChatHistory threads={THREADS} variant="sidebar" now={NOW} />
      </SoneMessagesProvider>,
    );
    expect(html).toContain(
      '<sone-chat-history data-slot="chat-history" data-variant="sidebar">',
    );
    expect(html).toContain('aria-label="Historia rozmów"');
    expect(html).toContain('data-slot="chat-history-list"');
    expect(html).toContain("Dziś");
  });
});
