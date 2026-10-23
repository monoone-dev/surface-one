"use client";

import {
  createElement,
  useMemo,
  useSyncExternalStore,
  type HTMLAttributes,
  type Ref,
  type ReactElement,
} from "react";

import { renderBlocks, type MarkdownLabels } from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { cx } from "../../utils/part";

export type SoneMarkdownSize = "default" | "sm";

export interface SoneMarkdownProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "dangerouslySetInnerHTML"
> {
  /** The markdown to show. Untrusted: raw HTML is escaped, images render only from inline `data:` URLs. */
  readonly source?: string | null;
  /** `sm` for denser surfaces such as side panels. */
  readonly size?: SoneMarkdownSize;
  /** Single newlines become line breaks (GitHub comments style). Default `true`. */
  readonly breaks?: boolean;
  readonly ref?: Ref<HTMLElement>;
}

const subscribe = (): (() => void) => () => undefined;

/** `true` once in the browser; `false` on the server and while hydrating. */
function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}

/**
 * `<sone-markdown>` — read-only markdown, rendered block by block and sanitized with
 * DOMPurify. Without a DOM there is no sanitizer, so the server renders the empty host
 * and the browser fills it in after hydration.
 */
export function SoneMarkdown({
  source,
  size = "default",
  breaks = true,
  className,
  ...rest
}: SoneMarkdownProps): ReactElement {
  const messages = useSoneMessages();
  const hydrated = useHydrated();
  const labels = useMemo<MarkdownLabels>(
    () => ({
      image: messages.markdownImage,
      imageBlocked: messages.markdownImageBlocked,
      task: messages.markdownTask,
    }),
    [
      messages.markdownImage,
      messages.markdownImageBlocked,
      messages.markdownTask,
    ],
  );
  // A fresh cache whenever the labels change: the cached HTML has them baked in.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- labels is the cache key, not an input
  const cache = useMemo(() => new Map<string, string>(), [labels]);
  const blocks = useMemo(
    () =>
      hydrated ? renderBlocks(source ?? "", { breaks, labels }, cache) : [],
    [hydrated, source, breaks, labels, cache],
  );
  return createElement(
    "sone-markdown",
    {
      "data-slot": "markdown",
      "data-size": size,
      ...rest,
      className: cx("markdown", className),
    },
    blocks.map((block) => (
      <div
        key={block.key}
        className="markdown-block"
        dangerouslySetInnerHTML={{ __html: block.html }}
      />
    )),
  );
}
