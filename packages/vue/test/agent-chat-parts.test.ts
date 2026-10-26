import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { describe, expect, it } from "vitest";

import {
  SoneAgentChatQuestion,
  SoneAgentChatThought,
  SoneChatAttachment,
  SoneChatComposer,
  SoneChatComposerInput,
  SoneSourceListTrigger,
} from "../src/index";

const ssr = (render: () => ReturnType<typeof h>) =>
  renderToString(createSSRApp({ render }));

const OPTIONS = [
  { label: "Ship the fix now", hint: "Clean up old accounts in a follow-up" },
  { label: "Add the cleanup", hint: "A migration trims existing emails" },
];
const AT = Date.UTC(2026, 9, 17, 9, 55, 0);

const question = () =>
  mount(SoneAgentChatQuestion, {
    props: {
      who: "Second opinion",
      hue: 3,
      time: AT,
      question: "Clean up old accounts in this change, or ship the fix now?",
      reason: "Accounts created before today may hold emails with spaces.",
      options: OPTIONS,
    },
    attachTo: document.body,
  });

describe("SoneAgentChatQuestion", () => {
  it("renders who asks, the question, the answers and the field (SSR)", async () => {
    const html = await ssr(() =>
      h(SoneAgentChatQuestion, {
        who: "Second opinion",
        question: "Ship it?",
        reason: "Why it asks.",
        options: OPTIONS,
      }),
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
    expect(html).toContain("commands");
    expect(html).toContain("anywhere");
    expect(html.match(/data-slot="agent-chat-question-option"/g)).toHaveLength(
      2,
    );
  });

  it("names the card by its question", () => {
    const w = question();
    const id = w.attributes("aria-labelledby")!;
    expect(w.get(`#${id}`).text()).toBe(
      "Clean up old accounts in this change, or ship the fix now?",
    );
    expect(w.attributes("style")).toContain("--agent-hue: var(--chart-3)");
    w.unmount();
  });

  it("1 and 2 pick an answer while the field is empty", async () => {
    const w = question();
    const field = w.get('[data-slot="agent-chat-question-input"]');
    await field.trigger("keydown", { key: "2" });
    await field.trigger("keydown", { key: "1" });
    expect(w.emitted("answer")).toEqual([
      ["Add the cleanup"],
      ["Ship the fix now"],
    ]);
    await field.trigger("keydown", { key: "3" });
    await field.trigger("keydown", { key: "1", metaKey: true });
    expect(w.emitted("answer")).toHaveLength(2);
    w.unmount();
  });

  it("a number is text once you write; Enter sends your own answer", async () => {
    const w = question();
    const field = w.get('[data-slot="agent-chat-question-input"]');
    const send = w.get('button[type="submit"]');
    expect(send.attributes("disabled")).toBeDefined();
    await field.setValue("  Ship it, then 2 more checks ");
    expect(send.attributes("disabled")).toBeUndefined();
    await field.trigger("keydown", { key: "2" });
    expect(w.emitted("answer")).toBeUndefined();
    await field.trigger("keydown", { key: "Enter" });
    expect(w.emitted("answer")).toEqual([["Ship it, then 2 more checks"]]);
    expect((field.element as HTMLInputElement).value).toBe("");
    await field.trigger("keydown", { key: "Enter" });
    expect(w.emitted("answer")).toHaveLength(1);
    w.unmount();
  });

  it("clicking a row answers with its label", async () => {
    const w = question();
    await w
      .findAll('[data-slot="agent-chat-question-option"]')[1]!
      .trigger("click");
    expect(w.emitted("answer")).toEqual([["Add the cleanup"]]);
    w.unmount();
  });

  it("drops the key hints with hints=false", () => {
    const w = mount(SoneAgentChatQuestion, {
      props: { question: "Ship it?", hints: false },
    });
    expect(w.find('[data-slot="agent-chat-question-keys"]').exists()).toBe(
      false,
    );
    expect(w.find('[data-slot="agent-chat-question-options"]').exists()).toBe(
      false,
    );
  });
});

describe("SoneAgentChatThought", () => {
  it("says how long, and toggles its panel (v-model:open)", async () => {
    const w = mount(SoneAgentChatThought, {
      props: { seconds: 12 },
      slots: { default: () => "Checked the old accounts first." },
    });
    const trigger = w.get('[data-slot="agent-chat-thought-trigger"]');
    const panel = w.get('[data-slot="agent-chat-thought-panel"]');
    expect(trigger.text()).toContain("Thought for 12 seconds");
    expect(trigger.attributes("aria-expanded")).toBe("false");
    expect(trigger.attributes("aria-controls")).toBe(panel.attributes("id"));
    expect(panel.attributes("hidden")).toBeDefined();
    await trigger.trigger("click");
    expect(trigger.attributes("aria-expanded")).toBe("true");
    expect(panel.attributes("hidden")).toBeUndefined();
    expect(w.attributes("data-open")).toBe("");
    expect(w.emitted("update:open")).toEqual([[true]]);
  });

  it("says one second in the singular", () => {
    const w = mount(SoneAgentChatThought, { props: { seconds: 1 } });
    expect(w.text()).toContain("Thought for 1 second");
  });
});

describe("SoneSourceListTrigger", () => {
  it("is a button with stacked marks and a count", async () => {
    const html = await ssr(() =>
      h(SoneSourceListTrigger, { count: 6 }, () => [h("img", { alt: "" })]),
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
  it("shows a title and url, and its remove button names it", async () => {
    const w = mount(SoneChatAttachment, {
      props: {
        title: "brief.pdf",
        url: "drive.example.com/brief",
        removable: true,
      },
    });
    expect(w.get('[data-slot="chat-attachment-title"]').text()).toBe(
      "brief.pdf",
    );
    expect(w.get('[data-slot="chat-attachment-url"]').text()).toBe(
      "drive.example.com/brief",
    );
    const remove = w.get('[data-slot="chat-attachment-remove"]');
    expect(remove.attributes("aria-label")).toBe("Remove brief.pdf");
    await remove.trigger("click");
    expect(w.emitted("remove")).toHaveLength(1);
  });

  it("sits above the field inside the composer", () => {
    const w = mount(SoneChatComposer, {
      props: { layout: "block" },
      slots: {
        default: () => [
          h(SoneChatAttachment, { title: "brief.pdf" }),
          h(SoneChatComposerInput),
        ],
      },
    });
    const box = w.get('[data-slot="chat-composer-attachments"]');
    expect(box.find("sone-chat-attachment").exists()).toBe(true);
    expect(box.element.nextElementSibling?.tagName).toBe("TEXTAREA");
  });
});
