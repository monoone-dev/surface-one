"use client";

import { createElement, type ElementType, type ReactElement } from "react";

import { useSoneMessages } from "../../context/messages";
import { cx, definePart, type PolymorphicProps } from "../../utils/part";
import { SoneIcon, type ShellIcon } from "../icon/icon";
import { SoneSpinner } from "../spinner/spinner";

export type EmptyMediaVariant = "default" | "icon";
export type EmptyStateTone = "default" | "locked" | "error" | "loading";

export interface SoneEmptyOwnProps {
  readonly icon?: ShellIcon | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly tone?: EmptyStateTone;
  readonly busy?: boolean;
}

/**
 * `<SoneEmpty>` — the empty state (`<sone-empty-state>` in Angular). Compose the parts,
 * or set `icon` / `title` / `description` / `tone` and the header is drawn for you;
 * the children follow it. `locked` defaults the icon to `lock`, `error` to
 * `alert-circle` (`role="alert"`), `loading` or `busy` shows a spinner
 * (`role="status"`). The effective tone is `data-tone`.
 */
export function SoneEmpty<E extends ElementType = "div">({
  as,
  icon = null,
  title = null,
  description = null,
  tone: toneProp = "default",
  busy = false,
  className,
  children,
  ...rest
}: PolymorphicProps<E, SoneEmptyOwnProps>): ReactElement {
  const messages = useSoneMessages();
  const tone: EmptyStateTone = busy ? "loading" : toneProp;
  const loading = tone === "loading";
  const mediaIcon: ShellIcon | null =
    icon ??
    (tone === "locked" ? "lock" : tone === "error" ? "alert-circle" : null);
  const header =
    loading || mediaIcon || title || description ? (
      <div className="empty-header" data-slot="empty-header">
        {loading ? (
          <div
            className="empty-media"
            data-slot="empty-media"
            data-variant="icon"
          >
            <SoneSpinner size={24} label={null} />
          </div>
        ) : mediaIcon ? (
          <div
            className="empty-media"
            data-slot="empty-media"
            data-variant="icon"
          >
            <SoneIcon icon={mediaIcon} />
          </div>
        ) : null}
        {loading && !title ? (
          <span className="sr-only">{messages.loading}</span>
        ) : null}
        {title ? (
          <p className="empty-title" data-slot="empty-title">
            {title}
          </p>
        ) : null}
        {description ? (
          <p className="empty" data-slot="empty-description">
            {description}
          </p>
        ) : null}
      </div>
    ) : null;
  return createElement(
    as ?? "div",
    {
      "data-slot": "empty",
      "data-tone": tone,
      role:
        tone === "error" ? "alert" : tone === "loading" ? "status" : undefined,
      ...rest,
      className: cx("empty-state", className),
    },
    header,
    children,
  );
}

export const SoneEmptyHeader = definePart({
  name: "SoneEmptyHeader",
  tag: "div",
  className: "empty-header",
  slot: "empty-header",
});

export const SoneEmptyMedia = definePart<
  "div",
  { variant?: EmptyMediaVariant }
>({
  name: "SoneEmptyMedia",
  tag: "div",
  className: "empty-media",
  slot: "empty-media",
  props: ["variant"],
  attrs: (p) => ({ "data-variant": p.variant ?? "default" }),
});

export const SoneEmptyTitle = definePart({
  name: "SoneEmptyTitle",
  tag: "h3",
  className: "empty-title",
  slot: "empty-title",
});

export const SoneEmptyDescription = definePart({
  name: "SoneEmptyDescription",
  tag: "p",
  className: "empty",
  slot: "empty-description",
});

export const SoneEmptyContent = definePart({
  name: "SoneEmptyContent",
  tag: "div",
  className: "empty-content",
  slot: "empty-content",
});
