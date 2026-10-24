"use client";

import {
  createElement,
  type ComponentPropsWithRef,
  type ElementType,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  clampPage,
  paginationPageCount,
  paginationRange,
} from "@surface-one/core";

import { useSoneMessages } from "../../context/messages";
import { useControllable } from "../../utils/controllable";
import { cx, definePart, flag, type PolymorphicProps } from "../../utils/part";
import type { ButtonSize } from "../button/button";
import { SoneIcon } from "../icon/icon";

/**
 * `nav[sonePaginationNav]` — the shadcn/ui Pagination root, for pages you lay out
 * yourself (`SonePagination` draws them from a page count). Named "Pagination" (the
 * messages catalogue) unless you pass `aria-label`.
 */
export function SonePaginationNav({
  "aria-label": label,
  className,
  ...rest
}: ComponentPropsWithRef<"nav">): ReactElement {
  const messages = useSoneMessages();
  return (
    <nav
      data-slot="pagination"
      aria-label={label ?? messages.paginationLabel}
      {...rest}
      className={cx("pagination", className)}
    />
  );
}

/** `ul[sonePaginationContent]` — the row of page links. */
export const SonePaginationContent = definePart({
  name: "SonePaginationContent",
  tag: "ul",
  className: "pagination-content",
  slot: "pagination-content",
});

/** `li[sonePaginationItem]` — one link, previous / next or an ellipsis. */
export const SonePaginationItem = definePart({
  name: "SonePaginationItem",
  tag: "li",
  className: "pagination-item",
  slot: "pagination-item",
});

export interface SonePaginationLinkOwnProps {
  /** The current page: outlined, `aria-current="page"`. */
  readonly isActive?: boolean;
  readonly size?: ButtonSize;
}

/**
 * `a[sonePaginationLink]` — a page: a ghost icon button, outlined with
 * `aria-current="page"` when `isActive`. `as` renders a Next.js `Link` or a button.
 */
export const SonePaginationLink = definePart<"a", SonePaginationLinkOwnProps>({
  name: "SonePaginationLink",
  tag: "a",
  className: "btn pagination-link",
  slot: "pagination-link",
  props: ["isActive", "size"],
  attrs: ({ isActive = false, size = "icon" }) => ({
    "data-variant": isActive ? "outline" : "ghost",
    "data-size": size,
    "data-active": flag(isActive),
    "aria-current": isActive ? "page" : undefined,
  }),
});

export interface SonePaginationEdgeOwnProps {
  /** The visible text (`children` replace it). */
  readonly label?: string | null;
}

function edge(kind: "previous" | "next") {
  const Edge = <E extends ElementType = "a">({
    as,
    label = null,
    children,
    className,
    ...rest
  }: PolymorphicProps<E, SonePaginationEdgeOwnProps>): ReactElement => {
    const m = useSoneMessages();
    const previous = kind === "previous";
    const text = (
      <span className="pagination-label">
        {(children as ReactNode) ??
          label ??
          (previous ? m.paginationPrevious : m.paginationNext)}
      </span>
    );
    const icon = (
      <SoneIcon icon={previous ? "chevron-left" : "chevron-right"} />
    );
    return createElement(
      as ?? "a",
      {
        "data-slot": `pagination-${kind}`,
        "data-variant": "ghost",
        "data-size": "default",
        "aria-label": previous
          ? m.paginationPreviousLabel
          : m.paginationNextLabel,
        ...rest,
        className: cx(
          `btn pagination-link pagination-${kind}`,
          className as string | undefined,
        ),
      },
      previous ? icon : text,
      previous ? text : icon,
    );
  };
  Edge.displayName =
    kind === "previous" ? "SonePaginationPrevious" : "SonePaginationNext";
  return Edge;
}

/** `a[sonePaginationPrevious]` — goes back a page: a chevron and “Previous”. */
export const SonePaginationPrevious = edge("previous");

/** `a[sonePaginationNext]` — goes on a page: “Next” and a chevron. */
export const SonePaginationNext = edge("next");

export interface SonePaginationEllipsisProps extends HTMLAttributes<HTMLElement> {
  /** What screen readers hear in place of the hidden pages. */
  readonly srOnlyText?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/** `<sone-pagination-ellipsis>` — stands in for hidden pages; says “More pages” to screen readers. */
export function SonePaginationEllipsis({
  srOnlyText = null,
  className,
  ...rest
}: SonePaginationEllipsisProps): ReactElement {
  const messages = useSoneMessages();
  return createElement(
    "sone-pagination-ellipsis",
    {
      "data-slot": "pagination-ellipsis",
      ...rest,
      className: cx("pagination-ellipsis", className),
    },
    <SoneIcon icon="ellipsis" />,
    <span className="sr-only">{srOnlyText ?? messages.paginationMore}</span>,
  );
}

export interface SonePaginationProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "onChange"
> {
  /** The current page (1-based), controlled with `onPageChange` (the Vue `v-model:page`). */
  readonly page?: number;
  readonly defaultPage?: number;
  readonly onPageChange?: (page: number) => void;
  /** How many items there are; with `pageSize` it gives the page count. */
  readonly total?: number;
  readonly pageSize?: number;
  /** The page count, when you know it (wins over `total` / `pageSize`). */
  readonly pageCount?: number | null;
  /** Pages shown on each side of the current one. */
  readonly siblings?: number;
  /** Pages always shown at each end. */
  readonly boundaries?: number;
  readonly disabled?: boolean;
  readonly previousLabel?: string | null;
  readonly nextLabel?: string | null;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-pagination>` — page buttons drawn from a page count: Previous, the first and
 * last pages, `siblings` pages around the current one with ellipses for the gaps, and
 * Next. `page` / `defaultPage` / `onPageChange`; the count is `pageCount`, or `total`
 * items at `pageSize` a page.
 */
export function SonePagination({
  page: pageProp,
  defaultPage = 1,
  onPageChange,
  total = 0,
  pageSize = 10,
  pageCount = null,
  siblings = 1,
  boundaries = 1,
  disabled = false,
  previousLabel = null,
  nextLabel = null,
  "aria-label": label,
  ...rest
}: SonePaginationProps): ReactElement {
  const m = useSoneMessages();
  const [page, setPage] = useControllable(pageProp, defaultPage, onPageChange);
  const count = pageCount ?? paginationPageCount(total, pageSize);
  const now = clampPage(page, count);
  const go = (to: number): void => {
    const next = clampPage(to, count);
    if (!disabled && next !== now) setPage(next);
  };
  const range = paginationRange({
    page: now,
    pageCount: count,
    siblings,
    boundaries,
  });
  return createElement(
    "sone-pagination",
    rest,
    <nav
      className="pagination"
      data-slot="pagination"
      aria-label={label ?? m.paginationLabel}
    >
      <ul className="pagination-content" data-slot="pagination-content">
        <li className="pagination-item" data-slot="pagination-item">
          <button
            type="button"
            className="btn pagination-link pagination-previous"
            data-slot="pagination-previous"
            data-variant="ghost"
            data-size="default"
            aria-label={m.paginationPreviousLabel}
            disabled={disabled || now <= 1}
            onClick={() => go(now - 1)}
          >
            <SoneIcon icon="chevron-left" />
            <span className="pagination-label">
              {previousLabel ?? m.paginationPrevious}
            </span>
          </button>
        </li>
        {range.map((entry) => (
          <li
            key={entry}
            className="pagination-item"
            data-slot="pagination-item"
          >
            {typeof entry === "number" ? (
              <button
                type="button"
                className="btn pagination-link"
                data-slot="pagination-link"
                data-size="icon"
                data-variant={entry === now ? "outline" : "ghost"}
                data-active={flag(entry === now)}
                aria-current={entry === now ? "page" : undefined}
                disabled={disabled}
                onClick={() => go(entry)}
              >
                {entry}
              </button>
            ) : (
              <SonePaginationEllipsis />
            )}
          </li>
        ))}
        <li className="pagination-item" data-slot="pagination-item">
          <button
            type="button"
            className="btn pagination-link pagination-next"
            data-slot="pagination-next"
            data-variant="ghost"
            data-size="default"
            aria-label={m.paginationNextLabel}
            disabled={disabled || now >= count}
            onClick={() => go(now + 1)}
          >
            <span className="pagination-label">
              {nextLabel ?? m.paginationNext}
            </span>
            <SoneIcon icon="chevron-right" />
          </button>
        </li>
      </ul>
    </nav>,
  );
}
