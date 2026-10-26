import { fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  SoneAgentChatQuestion,
  SoneAgentChatThought,
} from "../src/components/agent-chat";
import {
  SoneChatAttachment,
  SoneChatComposer,
  SoneChatComposerInput,
} from "../src/components/chat";
import { SoneSourceListTrigger } from "../src/components/source-list";

const OPTIONS = [
  { label: "Ship the fix now", hint: "Clean up old accounts in a follow-up" },
  { label: "Add the cleanup", hint: "A migration trims existing emails" },
];
const AT = Date.UTC(2026, 9, 17, 9, 55, 0);

const question = (onAnswer = vi.fn()) => {
  const view = render(
    <SoneAgentChatQuestion
      who="Second opinion"
      hue={3}
      time={AT}
      question="Clean up old accounts in this change, or ship the fix now?"
      reason="Accounts created before today may hold emails with spaces."
      options={OPTIONS}
      onAnswer={onAnswer}
    />,
  );
  const field = view.container.querySelector<HTMLInputElement>(
    '[data-slot="agent-chat-question-input"]',
  )!;
  return { ...view, field, onAnswer };
};

describe("SoneAgentChatQuestion", () => {
  it("renders who asks, the question, the answers and the field (SSR)", () => {
    const html = renderToStaticMarkup(
      <SoneAgentChatQuestion
        who="Second opinion"
        question="Ship it?"
        reason="Why it asks."
        options={OPTIONS}
      />,
    );
    expect(html).toContain(
      '<sone-agent-chat-question data-slot="agent-chat-question" role="group"',
    );
    expect(html).toContain(
      'data-slot="agent-chat-question-avatar" aria-hidden="true">So<',
    );
    expect(html).toContain("Needs you");
    expect(html).toContain('data-variant="warning"');
    expect(html).toContain('aria-label="Answers"');
    expect(html).toContain('aria-label="Your answer"');
    expect(html).toContain('placeholder="Or write your own answer…"');
    expect(html).toContain('aria-label="Send answer"');
    expect(html).toContain("to answer");
    expect(html.match(/data-slot="agent-chat-question-option"/g)).toHaveLength(
      2,
    );
  });

  it("names the card by its question", () => {
    const { container } = question();
    const card = container.querySelector("sone-agent-chat-question")!;
    const id = card.getAttribute("aria-labelledby")!;
    expect(container.ownerDocument.getElementById(id)?.textContent).toBe(
      "Clean up old accounts in this change, or ship the fix now?",
    );
    expect(card.getAttribute("style")).toContain("--agent-hue: var(--chart-3)");
  });

  it("1 and 2 pick an answer while the field is empty", () => {
    const { field, onAnswer } = question();
    fireEvent.keyDown(field, { key: "2" });
    fireEvent.keyDown(field, { key: "1" });
    expect(onAnswer.mock.calls).toEqual([
      ["Add the cleanup"],
      ["Ship the fix now"],
    ]);
    fireEvent.keyDown(field, { key: "3" });
    fireEvent.keyDown(field, { key: "1", metaKey: true });
    expect(onAnswer).toHaveBeenCalledTimes(2);
  });

  it("a number is text once you write; Enter sends your own answer", () => {
    const { container, field, onAnswer } = question();
    const send = container.querySelector<HTMLButtonElement>(
      'button[type="submit"]',
    )!;
    expect(send.disabled).toBe(true);
    fireEvent.change(field, {
      target: { value: "  Ship it, then 2 more checks " },
    });
    expect(send.disabled).toBe(false);
    fireEvent.keyDown(field, { key: "2" });
    expect(onAnswer).not.toHaveBeenCalled();
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onAnswer.mock.calls).toEqual([["Ship it, then 2 more checks"]]);
    expect(field.value).toBe("");
    fireEvent.keyDown(field, { key: "Enter" });
    expect(onAnswer).toHaveBeenCalledTimes(1);
  });

  it("clicking a row answers with its label", () => {
    const { container, onAnswer } = question();
    fireEvent.click(
      container.querySelectorAll(
        '[data-slot="agent-chat-question-option"]',
      )[1]!,
    );
    expect(onAnswer.mock.calls).toEqual([["Add the cleanup"]]);
  });

  it("drops the key hints with hints={false}", () => {
    const html = renderToStaticMarkup(
      <SoneAgentChatQuestion question="Ship it?" hints={false} />,
    );
    expect(html).not.toContain("agent-chat-question-keys");
    expect(html).not.toContain("agent-chat-question-options");
  });
});

describe("SoneAgentChatThought", () => {
  it("says how long, and toggles its panel", () => {
    const onOpenChange = vi.fn();
    const { container } = render(
      <SoneAgentChatThought seconds={12} onOpenChange={onOpenChange}>
        Checked the old accounts first.
      </SoneAgentChatThought>,
    );
    const trigger = container.querySelector(
      '[data-slot="agent-chat-thought-trigger"]',
    )!;
    const panel = container.querySelector<HTMLElement>(
      '[data-slot="agent-chat-thought-panel"]',
    )!;
    expect(trigger.textContent).toContain("Thought for 12 seconds");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.getAttribute("aria-controls")).toBe(panel.id);
    expect(panel.hidden).toBe(true);
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(panel.hidden).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });

  it("says one second in the singular", () => {
    expect(
      renderToStaticMarkup(<SoneAgentChatThought seconds={1} />),
    ).toContain("Thought for 1 second<");
  });
});

describe("SoneSourceListTrigger", () => {
  it("is a button with stacked marks and a count", () => {
    const html = renderToStaticMarkup(
      <SoneSourceListTrigger count={6}>
        <img alt="" />
      </SoneSourceListTrigger>,
    );
    expect(html).toContain(
      '<button type="button" data-slot="source-list-trigger">',
    );
    expect(html).toContain(
      'data-slot="source-list-trigger-marks" aria-hidden="true"',
    );
    expect(html).toContain("6 sources");
  });
});

describe("SoneChatAttachment", () => {
  it("shows a title and url, and its remove button names it", () => {
    const onRemove = vi.fn();
    const { getByRole, container } = render(
      <SoneChatAttachment
        title="brief.pdf"
        url="drive.example.com/brief"
        removable
        onRemove={onRemove}
      />,
    );
    expect(
      container.querySelector('[data-slot="chat-attachment-url"]')?.textContent,
    ).toBe("drive.example.com/brief");
    fireEvent.click(getByRole("button", { name: "Remove brief.pdf" }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it("sits above the field inside the composer", () => {
    const { container } = render(
      <SoneChatComposer layout="block">
        <SoneChatAttachment title="brief.pdf" />
        <SoneChatComposerInput />
      </SoneChatComposer>,
    );
    const box = container.querySelector(
      '[data-slot="chat-composer-attachments"]',
    )!;
    expect(box.querySelector("sone-chat-attachment")).not.toBeNull();
    expect(box.nextElementSibling?.tagName).toBe("TEXTAREA");
  });
});
