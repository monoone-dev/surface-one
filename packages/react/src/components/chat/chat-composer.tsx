"use client";

import {
  createContext,
  createElement,
  isValidElement,
  useContext,
  type ChangeEvent,
  type FormEvent,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
} from "react";

import { flattenChildren } from "@surface-one/core/react/children";

import { useSoneMessages } from "../../context/messages";
import { definePart } from "../../utils/part";
import { SoneButton } from "../button/button";
import { SoneInputGroup, SoneInputGroupAddon } from "../input/input-group";
import { SoneSpinner } from "../spinner/spinner";

export type ChatComposerLayout = "inline" | "block";

const ChatComposerContext = createContext<(() => void) | null>(null);

/** `[soneChatComposerTools]` — buttons and selects at the start of a `block` composer's footer. */
export const SoneChatComposerTools = definePart({
  name: "SoneChatComposerTools",
  tag: "div",
  slot: "chat-composer-tool",
});

export interface SoneChatComposerSubmitProps extends HTMLAttributes<HTMLElement> {
  /** A message is being sent: a spinner, named "Sending". */
  readonly pending?: boolean;
  readonly disabled?: boolean;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-chat-composer-submit>` — the send button: an arrow, or a spinner while `pending`. */
export function SoneChatComposerSubmit({
  pending = false,
  disabled = false,
  ...rest
}: SoneChatComposerSubmitProps): ReactElement {
  const m = useSoneMessages();
  return createElement(
    "sone-chat-composer-submit",
    { "data-slot": "chat-composer-submit", ...rest },
    <SoneButton
      size="icon-sm"
      type="submit"
      disabled={disabled}
      aria-label={pending ? m.chatSending : m.chatSend}
    >
      {pending ? (
        <SoneSpinner size={16} label={null} />
      ) : (
        <svg
          data-slot="chat-send-arrow"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path d="M4 12L20 4l-4 16-4-7-8-1z" fill="currentColor" />
        </svg>
      )}
    </SoneButton>,
  );
}

export interface SoneChatComposerProps extends HTMLAttributes<HTMLElement> {
  /** The send button at the end of the field (`inline`) or in a footer under it (`block`). */
  readonly layout?: ChatComposerLayout;
  /** The person sent: Enter in the field, or the send button. */
  readonly onSubmitted?: () => void;
  readonly ref?: Ref<HTMLElement>;
}

const isPart = (node: ReactNode, part: unknown): boolean =>
  isValidElement(node) && node.type === part;

/**
 * `<sone-chat-composer>` — the message box: a form input group around a
 * `SoneChatComposerInput`, with the `SoneChatComposerSubmit` at its end (`inline`) or in a
 * footer under it beside the `SoneChatComposerTools` (`block`).
 */
export function SoneChatComposer({
  layout = "inline",
  onSubmitted,
  children,
  ...rest
}: SoneChatComposerProps): ReactElement {
  const nodes = flattenChildren(children);
  const submit = nodes.filter((n) => isPart(n, SoneChatComposerSubmit));
  const tools = nodes.filter((n) => isPart(n, SoneChatComposerTools));
  const field = nodes.filter(
    (n) =>
      !isPart(n, SoneChatComposerSubmit) && !isPart(n, SoneChatComposerTools),
  );
  const send = (): void => onSubmitted?.();
  const onSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    send();
  };
  return createElement(
    "sone-chat-composer",
    { "data-slot": "chat-composer", "data-layout": layout, ...rest },
    <ChatComposerContext.Provider value={send}>
      <SoneInputGroup as="form" onSubmit={onSubmit}>
        {field}
        {layout === "block" ? (
          <SoneInputGroupAddon align="block-end" data-chat-composer-footer="">
            <div data-slot="chat-composer-tools">{tools}</div>
            {submit}
          </SoneInputGroupAddon>
        ) : (
          <SoneInputGroupAddon as="span" align="inline-end">
            {submit}
          </SoneInputGroupAddon>
        )}
      </SoneInputGroup>
    </ChatComposerContext.Provider>,
  );
}

export interface SoneChatComposerInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Every edit, with the field's text. */
  readonly onDraftInput?: (value: string) => void;
  readonly ref?: Ref<HTMLTextAreaElement>;
}

/**
 * The composer's `<textarea>` (`textarea[soneChatComposerInput]`): Enter sends,
 * Shift+Enter breaks the line.
 */
export function SoneChatComposerInput({
  onDraftInput,
  onChange,
  onKeyDown,
  ...rest
}: SoneChatComposerInputProps): ReactElement {
  const submit = useContext(ChatComposerContext);
  return (
    <textarea
      data-slot="input-group-control"
      {...rest}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event);
        onDraftInput?.(event.target.value);
      }}
      onKeyDown={(event: KeyboardEvent<HTMLTextAreaElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key !== "Enter" || event.shiftKey) return;
        event.preventDefault();
        if (submit) submit();
        else event.currentTarget.form?.requestSubmit();
      }}
    />
  );
}
