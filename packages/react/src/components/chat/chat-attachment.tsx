"use client";

import {
  createElement,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { SoneIcon } from "../icon/icon";

export interface SoneChatAttachmentProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> {
  /** What it is: a page title, a file name. */
  readonly title?: string;
  /** Where it is (or its size), under the title. */
  readonly url?: string | null;
  /** Shows the remove button. */
  readonly removable?: boolean;
  /** The remove button was pressed. */
  readonly onRemove?: () => void;
  /** The mark: a favicon, a file icon, a `SoneMark`. */
  readonly children?: ReactNode;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-chat-attachment>` — a linked or uploaded item in the composer: a grey card with a mark
 * (`children`), the `title` and its `url`, and — when `removable` — a small round remove button
 * (“Remove {title}”) that calls `onRemove`. Put it inside `SoneChatComposer`.
 */
export function SoneChatAttachment({
  title = "",
  url = null,
  removable = false,
  onRemove,
  children,
  ...rest
}: SoneChatAttachmentProps): ReactElement {
  const m = useSoneMessages();
  return createElement(
    "sone-chat-attachment",
    { "data-slot": "chat-attachment", ...rest },
    <span data-slot="chat-attachment-mark">{children}</span>,
    <span data-slot="chat-attachment-text">
      <span data-slot="chat-attachment-title">{title}</span>
      {url ? <span data-slot="chat-attachment-url">{url}</span> : null}
    </span>,
    removable ? (
      <button
        type="button"
        data-slot="chat-attachment-remove"
        aria-label={m.chatAttachmentRemove(title)}
        onClick={() => onRemove?.()}
      >
        <SoneIcon icon="close" />
      </button>
    ) : null,
  );
}
