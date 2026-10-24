"use client";

import {
  createElement,
  type ComponentPropsWithRef,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { cx, definePart } from "../../utils/part";
import { SoneIcon } from "../icon/icon";

/**
 * `nav[soneBreadcrumb]` — the trail of links to the current page. Named
 * "Breadcrumb" (the messages catalogue) unless you pass `aria-label`.
 */
export function SoneBreadcrumb({
  "aria-label": label,
  ...rest
}: ComponentPropsWithRef<"nav">): ReactElement {
  const messages = useSoneMessages();
  return (
    <nav
      data-slot="breadcrumb"
      aria-label={label ?? messages.breadcrumbLabel}
      {...rest}
    />
  );
}

/** `ol[soneBreadcrumbList]` — the ordered list of crumbs. */
export const SoneBreadcrumbList = definePart({
  name: "SoneBreadcrumbList",
  tag: "ol",
  className: "breadcrumb-list",
  slot: "breadcrumb-list",
});

/** `li[soneBreadcrumbItem]` — one crumb: a link, the page or an ellipsis. */
export const SoneBreadcrumbItem = definePart({
  name: "SoneBreadcrumbItem",
  tag: "li",
  className: "breadcrumb-item",
  slot: "breadcrumb-item",
});

/** `a[soneBreadcrumbLink]` — a crumb that links to its page; `as` renders a Next.js `Link`. */
export const SoneBreadcrumbLink = definePart({
  name: "SoneBreadcrumbLink",
  tag: "a",
  className: "breadcrumb-link",
  slot: "breadcrumb-link",
});

/** `span[soneBreadcrumbPage]` — the current page: not a link, `aria-current="page"`. */
export const SoneBreadcrumbPage = definePart({
  name: "SoneBreadcrumbPage",
  tag: "span",
  className: "breadcrumb-page",
  slot: "breadcrumb-page",
  static: {
    role: "link",
    "aria-disabled": "true",
    "aria-current": "page",
  },
});

/** `li[soneBreadcrumbSeparator]` — the chevron between crumbs; `children` replace it. */
export function SoneBreadcrumbSeparator({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<"li">): ReactElement {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      {...rest}
      className={cx("breadcrumb-separator", className)}
    >
      {children ?? <SoneIcon icon="chevron-right" />}
    </li>
  );
}

export interface SoneBreadcrumbEllipsisProps extends HTMLAttributes<HTMLElement> {
  /** What screen readers hear in place of the collapsed crumbs. */
  readonly srOnlyText?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-breadcrumb-ellipsis>` — stands in for collapsed crumbs; says "More" to screen readers. */
export function SoneBreadcrumbEllipsis({
  srOnlyText = null,
  className,
  ...rest
}: SoneBreadcrumbEllipsisProps): ReactElement {
  const messages = useSoneMessages();
  return createElement(
    "sone-breadcrumb-ellipsis",
    {
      "data-slot": "breadcrumb-ellipsis",
      ...rest,
      className: cx("breadcrumb-ellipsis", className),
    },
    <SoneIcon icon="ellipsis" />,
    <span className="sr-only">{srOnlyText ?? messages.breadcrumbMore}</span>,
  );
}
