import { act, fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneAgentChat,
  SoneAgentChatComposer,
  SoneAgentChatComposerInput,
  SoneAgentChatDivider,
  SoneAgentChatLog,
  SoneAgentChatMessage,
  SoneAgentChatStatus,
} from "../src/components/agent-chat";
import {
  SoneTerminal,
  SoneTerminalDivider,
  SoneTerminalLine,
  SoneTerminalLog,
  SoneTerminalPrompt,
  SoneTerminalPromptInput,
  SoneTerminalStatus,
} from "../src/components/terminal";
import { SoneMessagesProvider } from "../src/context/messages";

const AT = Date.UTC(2026, 9, 17, 12, 47, 0);

const frag = (html: string): HTMLElement => {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
};

afterEach(() => {
  vi.useRealTimers();
});

describe("SoneTerminal (server markup)", () => {
  const html = renderToStaticMarkup(
    <SoneTerminal>
      <SoneTerminalLog>
        <SoneTerminalDivider time={AT} tone="success">
          Run started
        </SoneTerminalDivider>
        <SoneTerminalLine from="user" to="Lead" time={AT}>
          Fix it.
        </SoneTerminalLine>
        <SoneTerminalLine
          kind="activity"
          speaker="Explore"
          hue={5}
          tone="danger"
          meta={<span>142 lines</span>}
          detail={<pre>out</pre>}
        >
          Read a file
        </SoneTerminalLine>
      </SoneTerminalLog>
      <SoneTerminalStatus state="working" speaker="Lead" since={AT} hue={3}>
        Reading
      </SoneTerminalStatus>
      <SoneTerminalPrompt>
        <SoneTerminalPromptInput />
      </SoneTerminalPrompt>
    </SoneTerminal>,
  );
  const root = frag(html);

  it("renders the Angular host tags and slots", () => {
    const host = root.firstElementChild!;
    expect(host.tagName).toBe("SONE-TERMINAL");
    expect(host.getAttribute("data-slot")).toBe("terminal");
    const viewport = root.querySelector('[data-slot="terminal-log-viewport"]')!;
    expect(viewport.getAttribute("role")).toBe("log");
    expect(viewport.getAttribute("aria-live")).toBe("polite");
    expect(viewport.getAttribute("tabindex")).toBe("0");
    expect(viewport.getAttribute("aria-label")).toBe("Terminal");
    expect(root.querySelector('[data-slot="terminal-log-jump"]')).toBeNull();
    const divider = root.querySelector("sone-terminal-divider")!;
    expect(divider.getAttribute("data-tone")).toBe("success");
    expect(
      divider.querySelectorAll('[data-slot="terminal-divider-rule"]'),
    ).toHaveLength(2);
    expect(divider.querySelector("time")!.getAttribute("datetime")).toBe(
      new Date(AT).toISOString(),
    );
  });

  it("marks the person's line: data-from, ❯, You, a spoken “to”", () => {
    const line = root.querySelectorAll("sone-terminal-line")[0]!;
    expect(line.getAttribute("data-slot")).toBe("terminal-line");
    expect(line.getAttribute("data-from")).toBe("user");
    expect(line.getAttribute("data-kind")).toBe("message");
    expect(line.hasAttribute("data-tone")).toBe(false);
    expect(
      line.querySelector('[data-slot="terminal-line-glyph"]')!.textContent,
    ).toBe("❯");
    expect(
      line.querySelector('[data-slot="terminal-line-speaker"]')!.textContent,
    ).toBe("You");
    const to = line.querySelector('[data-slot="terminal-line-to"]')!;
    expect(to.querySelector(".sr-only")!.textContent).toBe("to");
    expect(to.textContent).toBe("→to Lead");
    expect(
      line.querySelector('[data-slot="terminal-line-text"]')!.textContent,
    ).toBe("Fix it.");
    // meta and detail always render (the CSS hides them while empty)
    expect(
      line.querySelector('[data-slot="terminal-line-meta"]')!.innerHTML,
    ).toBe("");
    expect(
      line.querySelector('[data-slot="terminal-line-detail"]'),
    ).not.toBeNull();
  });

  it("renders an activity line with hue, tone, glyph, meta and detail", () => {
    const line = root.querySelectorAll<HTMLElement>("sone-terminal-line")[1]!;
    expect(line.getAttribute("data-kind")).toBe("activity");
    expect(line.getAttribute("data-tone")).toBe("danger");
    expect(line.style.getPropertyValue("--agent-hue")).toBe("var(--chart-5)");
    expect(
      line.querySelector('[data-slot="terminal-line-glyph"]')!.textContent,
    ).toBe("›");
    expect(
      line.querySelector('[data-slot="terminal-line-meta"]')!.textContent,
    ).toBe("142 lines");
    expect(
      line.querySelector('[data-slot="terminal-line-detail"] pre')!.textContent,
    ).toBe("out");
  });

  it("says the status sentence, with no running time on the server", () => {
    const status = root.querySelector<HTMLElement>("sone-terminal-status")!;
    expect(status.getAttribute("data-state")).toBe("working");
    expect(status.getAttribute("data-active")).toBe("");
    expect(status.getAttribute("data-busy")).toBe("");
    expect(status.style.getPropertyValue("--agent-hue")).toBe("var(--chart-3)");
    const text = status.querySelector('[data-slot="terminal-status-text"]')!;
    expect(text.getAttribute("role")).toBe("status");
    expect(text.textContent).toBe("Lead is working");
    expect(status.querySelector('[role="timer"]')).toBeNull();
    expect(
      status.querySelectorAll('[data-slot="terminal-status-indicator"] i'),
    ).toHaveLength(3);
    expect(
      status.querySelector('[data-slot="terminal-status-detail"]')!.textContent,
    ).toBe("Reading");
  });

  it("renders the prompt: a form, the ❯ glyph and a one-row named textarea", () => {
    const form = root.querySelector('[data-slot="terminal-prompt-form"]')!;
    expect(form.tagName).toBe("FORM");
    expect(
      form.querySelector('[data-slot="terminal-prompt-glyph"]')!.textContent,
    ).toBe("❯");
    const input = form.querySelector("textarea")!;
    expect(input.getAttribute("data-slot")).toBe("terminal-prompt-input");
    expect(input.getAttribute("rows")).toBe("1");
    expect(input.getAttribute("aria-label")).toBe("Message");
  });
});

describe("SoneAgentChat (server markup)", () => {
  const html = renderToStaticMarkup(
    <SoneAgentChat>
      <SoneAgentChatLog>
        <SoneAgentChatDivider>Run started</SoneAgentChatDivider>
        <SoneAgentChatMessage from="user" to="Lead" time={AT}>
          Fix it.
        </SoneAgentChatMessage>
        <SoneAgentChatMessage speaker="Code reviewer" hue={2}>
          Looks good.
        </SoneAgentChatMessage>
        <SoneAgentChatMessage kind="activity" speaker="Lead" glyph="$">
          npm test
        </SoneAgentChatMessage>
      </SoneAgentChatLog>
      <SoneAgentChatStatus state="working" speaker="Lead" since={AT} />
      <SoneAgentChatComposer>
        <SoneAgentChatComposerInput />
      </SoneAgentChatComposer>
    </SoneAgentChat>,
  );
  const root = frag(html);

  it("renders messages with avatar, header and bubble", () => {
    expect(root.firstElementChild!.getAttribute("data-slot")).toBe(
      "agent-chat",
    );
    expect(
      root
        .querySelector('[data-slot="agent-chat-log-viewport"]')!
        .getAttribute("aria-label"),
    ).toBe("Conversation");
    const [user, agent, activity] = root.querySelectorAll(
      "sone-agent-chat-message",
    );
    expect(user!.getAttribute("data-from")).toBe("user");
    expect(
      user!.querySelector('[data-slot="agent-chat-message-avatar"]')!
        .textContent,
    ).toBe("Yo");
    expect(
      user!.querySelector('[data-slot="agent-chat-message-speaker"]')!
        .textContent,
    ).toBe("You");
    expect(user!.querySelector(".sr-only")!.textContent).toBe("to");
    // the person's message has no glyph in the chat view; activity keeps its own
    expect(
      user!.querySelector('[data-slot="agent-chat-message-glyph"]'),
    ).toBeNull();
    expect(
      agent!.querySelector('[data-slot="agent-chat-message-avatar"]')!
        .textContent,
    ).toBe("Cr");
    expect(
      agent!.querySelector('[data-slot="agent-chat-message-time"]'),
    ).toBeNull();
    expect(
      activity!.querySelector('[data-slot="agent-chat-message-glyph"]')!
        .textContent,
    ).toBe("$");
  });

  it("says the status sentence under an avatar, with no time on the server", () => {
    const status = root.querySelector("sone-agent-chat-status")!;
    expect(
      status.querySelector('[data-slot="agent-chat-status-avatar"]')!
        .textContent,
    ).toBe("Le");
    expect(
      status.querySelector('[data-slot="agent-chat-status-text"]')!.textContent,
    ).toBe("Lead is working");
    expect(status.querySelector('[role="timer"]')).toBeNull();
    expect(
      root.querySelector('textarea[data-slot="agent-chat-composer-input"]'),
    ).not.toBeNull();
  });

  it("shows the done and error icons", () => {
    const done = frag(
      renderToStaticMarkup(<SoneAgentChatStatus state="done" />),
    );
    expect(done.querySelector("sone-icon")!.getAttribute("data-icon")).toBe(
      "check",
    );
    expect(
      done.querySelector('[data-slot="agent-chat-status-avatar"]'),
    ).toBeNull();
    expect(done.textContent).toContain("Done");
    const error = frag(
      renderToStaticMarkup(
        <SoneAgentChatStatus state="error" speaker="Lead" />,
      ),
    );
    expect(error.querySelector("sone-icon")!.getAttribute("data-icon")).toBe(
      "circle-x",
    );
    expect(error.textContent).toContain("Lead stopped with an error");
  });

  it("takes translated messages", () => {
    const html = renderToStaticMarkup(
      <SoneMessagesProvider messages={{ agentYou: "Ty", agentTo: "do" }}>
        <SoneAgentChatMessage from="user" to="Lead">
          Hej
        </SoneAgentChatMessage>
      </SoneMessagesProvider>,
    );
    expect(html).toContain(">Ty<");
    expect(html).toContain('<span class="sr-only">do</span>');
  });
});

describe("prompt behaviour", () => {
  for (const [name, Prompt, Input] of [
    ["SoneTerminalPrompt", SoneTerminalPrompt, SoneTerminalPromptInput],
    [
      "SoneAgentChatComposer",
      SoneAgentChatComposer,
      SoneAgentChatComposerInput,
    ],
  ] as const) {
    it(`${name}: Enter submits, Shift+Enter breaks the line`, () => {
      const onSubmitted = vi.fn();
      const onKeyDown = vi.fn();
      const { container } = render(
        <Prompt onSubmitted={onSubmitted}>
          <Input onKeyDown={onKeyDown} />
        </Prompt>,
      );
      const field = container.querySelector("textarea")!;
      fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
      expect(onSubmitted).not.toHaveBeenCalled();
      fireEvent.keyDown(field, { key: "Enter" });
      expect(onSubmitted).toHaveBeenCalledTimes(1);
      expect(onKeyDown).toHaveBeenCalledTimes(2);
      fireEvent.keyDown(field, { key: "a" });
      expect(onSubmitted).toHaveBeenCalledTimes(1);
    });
  }
});

describe("status behaviour", () => {
  for (const [name, Status, slot] of [
    ["SoneTerminalStatus", SoneTerminalStatus, "terminal-status-time"],
    ["SoneAgentChatStatus", SoneAgentChatStatus, "agent-chat-status-time"],
  ] as const) {
    it(`${name}: ticks a running time while active`, () => {
      vi.useFakeTimers();
      const since = Date.now();
      const { container, rerender } = render(
        <Status state="working" speaker="Lead" since={since} />,
      );
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      const time = container.querySelector(`[data-slot="${slot}"]`)!;
      expect(time.getAttribute("role")).toBe("timer");
      expect(time.getAttribute("aria-label")).toBe("Time in this state");
      expect(time.getAttribute("datetime")).toBe("PT3S");
      expect(time.textContent).toBe("3s");
      rerender(<Status state="done" speaker="Lead" since={since} />);
      expect(container.querySelector(`[data-slot="${slot}"]`)).toBeNull();
    });
  }
});

describe("log behaviour", () => {
  it("shows Jump to newest once the reader scrolls up", () => {
    const { container } = render(
      <SoneTerminalLog label="Run log">
        <p>one</p>
      </SoneTerminalLog>,
    );
    const viewport = container.querySelector<HTMLElement>(
      '[data-slot="terminal-log-viewport"]',
    )!;
    expect(viewport.getAttribute("aria-label")).toBe("Run log");
    Object.defineProperty(viewport, "scrollHeight", { value: 1000 });
    Object.defineProperty(viewport, "clientHeight", { value: 200 });
    viewport.scrollTop = 100;
    act(() => {
      fireEvent.scroll(viewport);
    });
    const jump = container.querySelector<HTMLElement>(
      '[data-slot="terminal-log-jump"]',
    )!;
    expect(jump.tagName).toBe("BUTTON");
    expect(jump.classList).toContain("btn");
    expect(jump.getAttribute("data-variant")).toBe("secondary");
    expect(jump.querySelector("sone-icon")!.getAttribute("data-icon")).toBe(
      "arrow-down",
    );
    expect(jump.textContent!.trim()).toBe("Jump to newest");
    viewport.scrollTo = vi.fn();
    act(() => {
      fireEvent.click(jump);
    });
    expect(
      container.querySelector('[data-slot="terminal-log-jump"]'),
    ).toBeNull();
  });
});
