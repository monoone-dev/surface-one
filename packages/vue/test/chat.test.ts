import { mount } from "@vue/test-utils";
import { createSSRApp, h, ref } from "vue";
import { renderToString } from "vue/server-renderer";
import { afterEach, describe, expect, it } from "vitest";

import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBubble,
  SoneBubbleContent,
  SoneBubbleGroup,
  SoneChatComposer,
  SoneChatComposerInput,
  SoneChatComposerSubmit,
  SoneChatComposerTools,
  SoneChatMessage,
  SoneChatMessageContent,
  SoneChatPane,
  SoneChatThread,
  SoneSuggestionChips,
  SoneTypingIndicator,
  SoneMarker,
  SoneMarkerContent,
  SoneMarkerIcon,
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageFooter,
  SoneMessageGroup,
  SoneMessageHeader,
} from "../src/index";

afterEach(() => {
  document.body.innerHTML = "";
});

const ssr = (render: () => unknown): Promise<string> =>
  renderToString(createSSRApp({ render }));

describe("SoneMessage, SoneBubble and SoneMarker", () => {
  it("render the Angular message parts", async () => {
    const out = await ssr(() =>
      h(SoneMessageGroup, null, () =>
        h(SoneMessage, { align: "end" }, () => [
          h(SoneMessageAvatar, { as: SoneAvatar, size: "sm" }, () =>
            h(SoneAvatarFallback, null, () => "LR"),
          ),
          h(SoneMessageContent, null, () => [
            h(SoneMessageHeader, null, () => "Leo"),
            h(SoneMessageFooter, null, () => "Read"),
          ]),
        ]),
      ),
    );
    expect(out).toBe(
      '<div data-slot="message-group"><div data-slot="message" data-align="end">' +
        '<sone-avatar class="avatar" data-slot="message-avatar" data-size="sm">' +
        '<span class="avatar-fallback" data-slot="avatar-fallback">LR</span><!----></sone-avatar>' +
        '<div data-slot="message-content"><div data-slot="message-header">Leo</div>' +
        '<div data-slot="message-footer">Read</div></div></div></div>',
    );
  });

  it("render the bubble variants and alignment", async () => {
    expect(
      await ssr(() =>
        h(SoneBubbleGroup, null, () => [
          h(SoneBubble, null, () => h(SoneBubbleContent, null, () => "Hi")),
          h(SoneBubble, { variant: "tinted", align: "end" }),
        ]),
      ),
    ).toBe(
      '<div data-slot="bubble-group">' +
        '<div data-slot="bubble" data-variant="default" data-align="start">' +
        '<div data-slot="bubble-content">Hi</div></div>' +
        '<div data-slot="bubble" data-variant="tinted" data-align="end"></div></div>',
    );
  });

  it("render the marker with a decorative icon", async () => {
    expect(
      await ssr(() =>
        h(SoneMarker, { variant: "separator" }, () => [
          h(SoneMarkerIcon, null, () => "✓"),
          h(SoneMarkerContent, null, () => "Compacted"),
        ]),
      ),
    ).toBe(
      '<div data-slot="marker" data-variant="separator">' +
        '<span data-slot="marker-icon" aria-hidden="true">✓</span>' +
        '<span data-slot="marker-content">Compacted</span></div>',
    );
  });
});

describe("the chat parts", () => {
  it("render a pane as a card unless bare, and the thread as a polite log", async () => {
    expect(await ssr(() => h(SoneChatPane))).toBe(
      '<div class="card" data-slot="chat-pane"></div>',
    );
    expect(await ssr(() => h(SoneChatPane, { bare: true }))).toBe(
      '<div data-slot="chat-pane" data-bare></div>',
    );
    expect(await ssr(() => h(SoneChatThread))).toBe(
      '<sone-chat-thread data-slot="chat-thread" role="log" aria-live="polite" aria-label="Conversation"></sone-chat-thread>',
    );
  });

  it("draw the person's text in an end bubble and the assistant's in a ghost one", async () => {
    expect(
      await ssr(() =>
        h(SoneChatMessage, { from: "user" }, () =>
          h(SoneChatMessageContent, null, () => "Hi"),
        ),
      ),
    ).toBe(
      '<sone-chat-message class="is-user" data-slot="message" data-align="end" data-from="user">' +
        '<div data-slot="message-content">' +
        '<div data-slot="bubble" data-variant="default" data-align="end">' +
        '<div data-slot="bubble-content" aria-label="You said">Hi</div></div>' +
        "</div></sone-chat-message>",
    );
    const assistant = await ssr(() =>
      h(SoneChatMessage, { from: "assistant" }, () => [
        h(SoneChatMessageContent, null, () => "Hello"),
        h("p", "Sources"),
      ]),
    );
    expect(assistant).toContain(
      '<div data-slot="bubble" data-variant="ghost" data-align="start">' +
        '<div data-slot="bubble-content" aria-label="Assistant said">Hello</div></div><p>Sources</p>',
    );
    // No text: no bubble, only the other content (a typing indicator).
    expect(
      await ssr(() =>
        h(SoneChatMessage, { from: "assistant", variant: "muted" }, () =>
          h(SoneTypingIndicator),
        ),
      ),
    ).toBe(
      '<sone-chat-message class="is-assistant" data-slot="message" data-align="start" data-from="assistant">' +
        '<div data-slot="message-content"><!---->' +
        '<sone-typing-indicator data-slot="marker" data-variant="default" aria-label="Thinking">' +
        '<span data-slot="marker-icon" aria-hidden="true"><sone-spinner data-slot="spinner">' +
        '<svg class="spinner-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:16px;height:16px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>' +
        '</sone-spinner></span><span class="shimmer" data-slot="marker-content">Thinking…</span>' +
        "</sone-typing-indicator></div></sone-chat-message>",
    );
  });

  it("emit picked from the suggestion chips", async () => {
    const w = mount(SoneSuggestionChips, {
      props: { suggestions: ["One", "Two"] },
    });
    expect(w.attributes()).toMatchObject({
      "data-slot": "suggestions",
      role: "group",
      "aria-label": "Suggested questions",
    });
    const buttons = w.findAll("button");
    expect(buttons[1]!.attributes()).toMatchObject({
      class: "btn",
      "data-variant": "outline",
      "data-size": "sm",
      type: "button",
      style: "--i: 1;",
    });
    await buttons[1]!.trigger("click");
    expect(w.emitted("picked")).toEqual([["Two"]]);
    await w.setProps({ disabled: true });
    expect(buttons[0]!.attributes("disabled")).toBe("");
  });

  it("lay the composer out inline or in a block with its tools", async () => {
    const inline = await ssr(() =>
      h(SoneChatComposer, null, () => [
        h(SoneChatComposerSubmit),
        h(SoneChatComposerInput, { rows: "1" }),
      ]),
    );
    expect(inline).toBe(
      '<sone-chat-composer data-slot="chat-composer" data-layout="inline">' +
        '<form data-slot="input-group"><textarea data-slot="input-group-control" rows="1"></textarea>' +
        '<span role="group" data-slot="input-group-addon" data-align="inline-end">' +
        '<sone-chat-composer-submit data-slot="chat-composer-submit">' +
        '<button class="btn" data-slot="button" data-variant="default" data-size="icon-sm" type="submit" aria-label="Send">' +
        '<svg data-slot="chat-send-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M4 12L20 4l-4 16-4-7-8-1z" fill="currentColor"></path></svg></button>' +
        "</sone-chat-composer-submit></span></form></sone-chat-composer>",
    );
    const block = await ssr(() =>
      h(SoneChatComposer, { layout: "block" }, () => [
        h(SoneChatComposerInput),
        h(SoneChatComposerTools, null, () => "tools"),
        h(SoneChatComposerSubmit, { pending: true, disabled: true }),
      ]),
    );
    expect(block).toContain(
      '<div role="group" data-slot="input-group-addon" data-align="block-end" data-chat-composer-footer>' +
        '<div data-slot="chat-composer-tools"><div data-slot="chat-composer-tool">tools</div></div>',
    );
    expect(block).toContain('type="submit" disabled aria-label="Sending"');
  });

  it("submit on Enter (not Shift+Enter) and on the send button, v-model the draft", async () => {
    const draft = ref("");
    const sent: string[] = [];
    const w = mount(
      {
        render: () =>
          h(
            SoneChatComposer,
            { onSubmitted: () => sent.push(draft.value) },
            () => [
              h(SoneChatComposerInput, {
                modelValue: draft.value,
                "onUpdate:modelValue": (v: string) => (draft.value = v),
              }),
              h(SoneChatComposerSubmit),
            ],
          ),
      },
      { attachTo: document.body },
    );
    const field = w.find("textarea");
    await field.setValue("Hello");
    expect(draft.value).toBe("Hello");
    expect(
      w.findComponent(SoneChatComposerInput).emitted("draftInput"),
    ).toEqual([["Hello"]]);
    await field.trigger("keydown", { key: "Enter", shiftKey: true });
    expect(sent).toEqual([]);
    await field.trigger("keydown", { key: "Enter" });
    await w.find("form").trigger("submit");
    expect(sent).toEqual(["Hello", "Hello"]);
    w.unmount();
  });

  it("scroll the thread to its end", () => {
    const w = mount(SoneChatThread, { attachTo: document.body });
    const el = w.element as HTMLElement;
    Object.defineProperty(el, "scrollHeight", { value: 480 });
    (w.vm as unknown as { scrollToEnd(): void }).scrollToEnd();
    expect(el.scrollTop).toBe(480);
    w.unmount();
  });
});
