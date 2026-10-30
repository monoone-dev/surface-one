import { mount } from "@vue/test-utils";
import { createSSRApp, h, nextTick, type Component } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  SoneAgentChat,
  SoneAgentChatComposer,
  SoneAgentChatComposerInput,
  SoneAgentChatDivider,
  SoneAgentChatLog,
  SoneAgentChatMessage,
  SoneAgentChatStatus,
  SoneTerminal,
  SoneTerminalDivider,
  SoneTerminalLine,
  SoneTerminalLog,
  SoneTerminalPrompt,
  SoneTerminalPromptInput,
  SoneTerminalStatus,
} from "../src/index";

const ssr = (render: () => ReturnType<typeof h>) =>
  renderToString(createSSRApp({ render }));

const FAMILIES = [
  {
    name: "terminal",
    frame: SoneTerminal,
    log: SoneTerminalLog,
    entry: SoneTerminalLine,
    entryTag: "sone-terminal-line",
    divider: SoneTerminalDivider,
    status: SoneTerminalStatus,
    prompt: SoneTerminalPrompt,
    input: SoneTerminalPromptInput,
    p: "terminal",
    entrySlot: "terminal-line",
    statusSlot: "terminal-status",
    logLabel: "Terminal",
  },
  {
    name: "agent chat",
    frame: SoneAgentChat,
    log: SoneAgentChatLog,
    entry: SoneAgentChatMessage,
    entryTag: "sone-agent-chat-message",
    divider: SoneAgentChatDivider,
    status: SoneAgentChatStatus,
    prompt: SoneAgentChatComposer,
    input: SoneAgentChatComposerInput,
    p: "agent-chat",
    entrySlot: "agent-chat-message",
    statusSlot: "agent-chat-status",
    logLabel: "Conversation",
  },
] as const;

afterEach(() => {
  vi.useRealTimers();
});

for (const f of FAMILIES) {
  describe(`agent ${f.name} (SSR)`, () => {
    it("renders the frame, the log and a person's line with the Angular markup", async () => {
      const html = await ssr(() =>
        h(f.frame as Component, null, () =>
          h(f.log as Component, null, () => [
            h(f.divider as Component, { time: 0 }, () => "Run started"),
            h(
              f.entry as Component,
              { from: "user", to: "Lead", hue: 3 },
              {
                default: () => "Fix the tests",
                meta: () => h("span", "2.1s"),
              },
            ),
          ]),
        ),
      );
      expect(html).toContain(`<sone-${f.p} data-slot="${f.p}">`);
      expect(html).toContain(`<sone-${f.p}-log data-slot="${f.p}-log">`);
      expect(html).toContain(
        `data-slot="${f.p}-log-viewport" role="log" aria-live="polite" tabindex="0" aria-label="${f.logLabel}"`,
      );
      expect(html).toContain(`data-slot="${f.p}-divider-rule"`);
      // following the newest line: no Jump button
      expect(html).not.toContain(`${f.p}-log-jump`);

      const line = new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(f.entryTag)!;
      expect(line.getAttribute("data-slot")).toBe(f.entrySlot);
      expect(line.getAttribute("data-from")).toBe("user");
      expect(line.getAttribute("data-kind")).toBe("message");
      expect(line.hasAttribute("data-tone")).toBe(false);
      expect(line.getAttribute("style")).toContain(
        "--agent-hue:var(--chart-3)",
      );
      expect(
        line.querySelector(`[data-slot="${f.entrySlot}-speaker"]`)!.textContent,
      ).toBe("You");
      const to = line.querySelector(`[data-slot="${f.entrySlot}-to"]`)!;
      expect(to.innerHTML).toBe(
        '<span aria-hidden="true">→</span><span class="sr-only">to</span> Lead',
      );
      expect(
        line.querySelector(`[data-slot="${f.entrySlot}-meta"]`)!.textContent,
      ).toBe("2.1s");
      expect(
        line.querySelector(`[data-slot="${f.entrySlot}-detail"]`),
      ).not.toBeNull();
      // the terminal marks the person's line with ❯; the chat only marks activity
      const glyph = line.querySelector(`[data-slot="${f.entrySlot}-glyph"]`);
      if (f.p === "terminal") expect(glyph!.textContent).toBe("❯");
      else expect(glyph).toBeNull();
    });

    it("says what the agent does, with no running time on the server", async () => {
      const html = await ssr(() =>
        h(f.status as Component, {
          state: "working",
          speaker: "Lead",
          since: Date.now() - 5000,
        }),
      );
      const el = new DOMParser()
        .parseFromString(html, "text/html")
        .querySelector(`sone-${f.statusSlot}`)!;
      expect(el.getAttribute("data-state")).toBe("working");
      expect(el.getAttribute("data-active")).toBe("");
      expect(el.getAttribute("data-busy")).toBe("");
      const text = el.querySelector('[role="status"]')!;
      expect(text.getAttribute("data-slot")).toBe(`${f.statusSlot}-text`);
      expect(text.textContent).toBe("Lead is working");
      expect(el.querySelector('[role="timer"]')).toBeNull();
      expect(
        el.querySelectorAll(`[data-slot="${f.statusSlot}-indicator"] i`),
      ).toHaveLength(3);
    });

    it("renders the prompt form around its labelled textarea", async () => {
      const html = await ssr(() =>
        h(f.prompt as Component, null, () => h(f.input as Component)),
      );
      expect(html).toContain("<form");
      expect(html).toContain(
        `data-slot="${f.p === "terminal" ? "terminal-prompt-input" : "agent-chat-composer-input"}" rows="1" aria-label="Message"`,
      );
    });
  });

  describe(`agent ${f.name} (behaviour)`, () => {
    const prompt = () => {
      const submitted = vi.fn();
      const w = mount(
        {
          render: () =>
            h(f.prompt as Component, { onSubmitted: submitted }, () =>
              h(f.input as Component),
            ),
        },
        { attachTo: document.body },
      );
      return { w, submitted };
    };

    it("Enter sends", async () => {
      const { w, submitted } = prompt();
      await w.get("textarea").trigger("keydown", { key: "Enter" });
      expect(submitted).toHaveBeenCalledTimes(1);
      w.unmount();
    });

    it("Shift+Enter breaks the line instead", async () => {
      const { w, submitted } = prompt();
      await w
        .get("textarea")
        .trigger("keydown", { key: "Enter", shiftKey: true });
      expect(submitted).not.toHaveBeenCalled();
      w.unmount();
    });

    it("supports v-model on the field", async () => {
      const w = mount(f.input as Component, {
        props: { modelValue: "hi", ariaLabel: "Ask" },
      });
      expect((w.element as HTMLTextAreaElement).value).toBe("hi");
      expect(w.attributes("aria-label")).toBe("Ask");
      await w.setValue("hello");
      expect(w.emitted("update:modelValue")!.at(-1)).toEqual(["hello"]);
    });

    it("ticks the running time in the browser", async () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 9, 17, 12, 0, 0));
      const w = mount(f.status as Component, {
        props: { state: "working", speaker: "Lead", since: Date.now() - 5000 },
      });
      await nextTick();
      const time = () => w.find('[role="timer"]');
      expect(time().exists()).toBe(true);
      expect(time().attributes("datetime")).toBe("PT5S");
      expect(time().attributes("aria-label")).toBe("Time in this state");
      vi.advanceTimersByTime(2000);
      await nextTick();
      expect(time().attributes("datetime")).toBe("PT7S");
      await w.setProps({ state: "done" });
      expect(time().exists()).toBe(false);
      w.unmount();
    });

    it("exposes scrollToEnd on the log", () => {
      const w = mount(f.log as Component);
      expect(
        typeof (w.vm as unknown as { scrollToEnd: unknown }).scrollToEnd,
      ).toBe("function");
      w.unmount();
    });
  });
}

describe("avatar and note", () => {
  it("chat: the avatar slot replaces the initials and a note follows the time", async () => {
    const html = await ssr(() =>
      h(
        SoneAgentChatMessage,
        {
          speaker: "Claude Code",
          time: Date.UTC(2026, 9, 17, 12, 47),
          note: "opus · high",
        },
        {
          default: () => "Done.",
          avatar: () => h("svg", { "data-mark": "claude" }),
        },
      ),
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    const avatar = host.querySelector(
      '[data-slot="agent-chat-message-avatar"]',
    )!;
    expect(avatar.querySelector('[data-mark="claude"]')).not.toBeNull();
    expect(avatar.textContent).toBe("");
    const note = host.querySelector('[data-slot="agent-chat-message-note"]')!;
    expect(note.textContent).toBe("opus · high");
    expect(note.previousElementSibling!.getAttribute("data-slot")).toBe(
      "agent-chat-message-time",
    );
  });

  it("terminal: a note sits in front of the text", async () => {
    const html = await ssr(() =>
      h(
        SoneTerminalLine,
        { speaker: "Codex", note: "gpt-5.5 · medium" },
        () => "Done.",
      ),
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    const note = host.querySelector('[data-slot="terminal-line-note"]')!;
    expect(note.textContent).toBe("gpt-5.5 · medium");
    expect(note.nextElementSibling!.getAttribute("data-slot")).toBe(
      "terminal-line-text",
    );
  });
});
