import { fireEvent, render } from "@testing-library/react";
import { createRef, useState, type ReactNode } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { SoneAvatar, SoneAvatarFallback } from "../src/components/avatar";
import {
  SoneBubble,
  SoneBubbleContent,
  SoneBubbleGroup,
} from "../src/components/bubble";
import {
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
  type SoneChatThreadHandle,
} from "../src/components/chat";
import {
  SoneMarker,
  SoneMarkerContent,
  SoneMarkerIcon,
} from "../src/components/marker";
import {
  SoneMessage,
  SoneMessageAvatar,
  SoneMessageContent,
  SoneMessageFooter,
  SoneMessageGroup,
  SoneMessageHeader,
} from "../src/components/message";

const html = (node: ReactNode): string => {
  const el = document.createElement("div");
  el.innerHTML = renderToString(node);
  return el.innerHTML;
};

describe("SoneMessage, SoneBubble and SoneMarker", () => {
  it("render the Angular message parts", () => {
    expect(
      html(
        <SoneMessageGroup>
          <SoneMessage align="end">
            <SoneMessageAvatar as={SoneAvatar} size="sm">
              <SoneAvatarFallback>LR</SoneAvatarFallback>
            </SoneMessageAvatar>
            <SoneMessageContent>
              <SoneMessageHeader>Leo</SoneMessageHeader>
              <SoneMessageFooter>Read</SoneMessageFooter>
            </SoneMessageContent>
          </SoneMessage>
        </SoneMessageGroup>,
      ),
    ).toBe(
      '<div data-slot="message-group"><div data-slot="message" data-align="end">' +
        '<sone-avatar data-slot="message-avatar" data-size="sm" class="avatar">' +
        '<span data-slot="avatar-fallback" class="avatar-fallback">LR</span></sone-avatar>' +
        '<div data-slot="message-content"><div data-slot="message-header">Leo</div>' +
        '<div data-slot="message-footer">Read</div></div></div></div>',
    );
  });

  it("render the bubble variants and alignment", () => {
    expect(
      html(
        <SoneBubbleGroup>
          <SoneBubble>
            <SoneBubbleContent>Hi</SoneBubbleContent>
          </SoneBubble>
          <SoneBubble variant="tinted" align="end" />
        </SoneBubbleGroup>,
      ),
    ).toBe(
      '<div data-slot="bubble-group">' +
        '<div data-slot="bubble" data-variant="default" data-align="start">' +
        '<div data-slot="bubble-content">Hi</div></div>' +
        '<div data-slot="bubble" data-variant="tinted" data-align="end"></div></div>',
    );
  });

  it("render the marker with a decorative icon", () => {
    expect(
      html(
        <SoneMarker variant="separator">
          <SoneMarkerIcon>✓</SoneMarkerIcon>
          <SoneMarkerContent>Compacted</SoneMarkerContent>
        </SoneMarker>,
      ),
    ).toBe(
      '<div data-slot="marker" data-variant="separator">' +
        '<span data-slot="marker-icon" aria-hidden="true">✓</span>' +
        '<span data-slot="marker-content">Compacted</span></div>',
    );
  });
});

describe("the chat parts", () => {
  it("render a pane as a card unless bare, and the thread as a polite log", () => {
    expect(html(<SoneChatPane />)).toBe(
      '<div data-slot="chat-pane" class="card"></div>',
    );
    expect(html(<SoneChatPane bare />)).toBe(
      '<div data-slot="chat-pane" data-bare=""></div>',
    );
    expect(html(<SoneChatThread />)).toBe(
      '<sone-chat-thread data-slot="chat-thread" role="log" aria-live="polite" tabindex="0" aria-label="Conversation"></sone-chat-thread>',
    );
  });

  it("draw the person's text in an end bubble and the assistant's in a ghost one", () => {
    expect(
      html(
        <SoneChatMessage from="user">
          <SoneChatMessageContent>Hi</SoneChatMessageContent>
        </SoneChatMessage>,
      ),
    ).toBe(
      '<sone-chat-message data-slot="message" data-align="end" data-from="user" class="is-user">' +
        '<div data-slot="message-content">' +
        '<div data-slot="bubble" data-variant="default" data-align="end">' +
        '<div data-slot="bubble-content" aria-label="You said">Hi</div></div>' +
        "</div></sone-chat-message>",
    );
    expect(
      html(
        <SoneChatMessage from="assistant">
          <SoneChatMessageContent>Hello</SoneChatMessageContent>
          <p>Sources</p>
        </SoneChatMessage>,
      ),
    ).toContain(
      '<div data-slot="bubble" data-variant="ghost" data-align="start">' +
        '<div data-slot="bubble-content" aria-label="Assistant said">Hello</div></div><p>Sources</p>',
    );
    const typing = html(
      <SoneChatMessage from="assistant" variant="muted">
        <SoneTypingIndicator />
      </SoneChatMessage>,
    );
    expect(typing).not.toContain('data-slot="bubble"');
    expect(typing).toContain(
      '<sone-typing-indicator data-slot="marker" data-variant="default" aria-label="Thinking">' +
        '<span data-slot="marker-icon" aria-hidden="true"><sone-spinner data-slot="spinner">',
    );
    expect(typing).toContain(
      '<span class="shimmer" data-slot="marker-content">Thinking…</span>',
    );
  });

  it("call onPicked from the suggestion chips", () => {
    const picked: string[] = [];
    const { container, rerender } = render(
      <SoneSuggestionChips
        suggestions={["One", "Two"]}
        onPicked={(s) => picked.push(s)}
      />,
    );
    const host = container.firstElementChild!;
    expect(host.getAttribute("aria-label")).toBe("Suggested questions");
    const buttons = container.querySelectorAll("button");
    expect(buttons[1]!.getAttribute("style")).toBe("--i: 1;");
    expect(buttons[1]!.dataset["variant"]).toBe("outline");
    fireEvent.click(buttons[1]!);
    expect(picked).toEqual(["Two"]);
    rerender(<SoneSuggestionChips suggestions={["One", "Two"]} disabled />);
    expect(container.querySelector("button")!.disabled).toBe(true);
  });

  it("lay the composer out inline or in a block with its tools", () => {
    expect(
      html(
        <SoneChatComposer>
          <SoneChatComposerSubmit />
          <SoneChatComposerInput rows={1} />
        </SoneChatComposer>,
      ),
    ).toBe(
      '<sone-chat-composer data-slot="chat-composer" data-layout="inline">' +
        '<form data-slot="input-group"><div data-slot="chat-composer-attachments"></div><textarea data-slot="input-group-control" rows="1"></textarea>' +
        '<span role="group" data-slot="input-group-addon" data-align="inline-end">' +
        '<sone-chat-composer-submit data-slot="chat-composer-submit">' +
        '<button data-slot="button" data-variant="default" data-size="icon-sm" type="submit" aria-label="Send" class="btn">' +
        '<svg data-slot="chat-send-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">' +
        '<path d="M4 12L20 4l-4 16-4-7-8-1z" fill="currentColor"></path></svg></button>' +
        "</sone-chat-composer-submit></span></form></sone-chat-composer>",
    );
    const block = html(
      <SoneChatComposer layout="block">
        <SoneChatComposerInput />
        <SoneChatComposerTools>tools</SoneChatComposerTools>
        <SoneChatComposerSubmit pending disabled />
      </SoneChatComposer>,
    );
    expect(block).toContain(
      '<div role="group" data-slot="input-group-addon" data-align="block-end" data-chat-composer-footer="">' +
        '<div data-slot="chat-composer-tools"><div data-slot="chat-composer-tool">tools</div></div>',
    );
    expect(block).toContain('type="submit" disabled="" aria-label="Sending"');
  });

  it("submit on Enter (not Shift+Enter) and on the send button, report the draft", () => {
    const sent: string[] = [];
    function Composer() {
      const [draft, setDraft] = useState("");
      return (
        <SoneChatComposer onSubmitted={() => sent.push(draft)}>
          <SoneChatComposerInput value={draft} onDraftInput={setDraft} />
          <SoneChatComposerSubmit />
        </SoneChatComposer>
      );
    }
    const { container } = render(<Composer />);
    const field = container.querySelector("textarea")!;
    fireEvent.change(field, { target: { value: "Hello" } });
    fireEvent.keyDown(field, { key: "Enter", shiftKey: true });
    expect(sent).toEqual([]);
    fireEvent.keyDown(field, { key: "Enter" });
    fireEvent.submit(container.querySelector("form")!);
    expect(sent).toEqual(["Hello", "Hello"]);
  });

  it("scroll the thread to its end", () => {
    const handle = createRef<SoneChatThreadHandle>();
    const { container } = render(<SoneChatThread handleRef={handle} />);
    const el = container.firstElementChild as HTMLElement;
    Object.defineProperty(el, "scrollHeight", { value: 480 });
    handle.current!.scrollToEnd();
    expect(el.scrollTop).toBe(480);
  });
});
