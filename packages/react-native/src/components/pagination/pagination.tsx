import { type ReactElement } from "react";
import { View, type ViewProps } from "react-native";

import {
  clampPage,
  paginationPageCount,
  paginationRange,
} from "@surface-one/core/pagination";

import { useSoneMessages } from "../../context/messages";
import { useSoneTheme } from "../../theme/context";
import { currentProps } from "../../utils/a11y";
import { useControllable } from "../../utils/controllable";
import {
  SoneButton,
  type ButtonSize,
  type SoneButtonProps,
} from "../button/button";
import { SoneIcon } from "../icon/icon";

/**
 * `nav[sonePaginationNav]` — the shadcn/ui Pagination root, for pages you lay out
 * yourself (`SonePagination` draws them from a page count). Named "Pagination" (the
 * messages catalogue) unless you pass `aria-label`.
 */
export function SonePaginationNav({
  "aria-label": label,
  style,
  ...rest
}: ViewProps): ReactElement {
  const messages = useSoneMessages();
  return (
    <View
      role="navigation"
      aria-label={label ?? messages.paginationLabel}
      {...rest}
      style={[
        { flexDirection: "row", justifyContent: "center", width: "100%" },
        style,
      ]}
    />
  );
}

/** `ul[sonePaginationContent]` — the row of page links. */
export function SonePaginationContent({
  style,
  ...rest
}: ViewProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  return (
    <View
      role="list"
      {...rest}
      style={[
        {
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          gap: t.space1,
        },
        style,
      ]}
    />
  );
}

/** `li[sonePaginationItem]` — one link, previous / next or an ellipsis. */
export function SonePaginationItem(props: ViewProps): ReactElement {
  return <View role="listitem" {...props} />;
}

export interface SonePaginationLinkProps extends Omit<
  SoneButtonProps,
  "variant" | "size"
> {
  /** The current page: outlined, `aria-current="page"` on the web, selected natively. */
  readonly isActive?: boolean;
  readonly size?: ButtonSize;
}

/** `a[sonePaginationLink]` — a page: a ghost icon button, outlined when `isActive`. */
export function SonePaginationLink({
  isActive = false,
  size = "icon",
  ...rest
}: SonePaginationLinkProps): ReactElement {
  return (
    <SoneButton
      role="link"
      {...currentProps(isActive, "page")}
      {...rest}
      variant={isActive ? "outline" : "ghost"}
      size={size}
    />
  );
}

export interface SonePaginationEdgeProps extends Omit<
  SoneButtonProps,
  "variant" | "size"
> {
  /** The visible text (`children` replace it). */
  readonly label?: string | null;
}

function edge(kind: "previous" | "next") {
  const Edge = ({
    label = null,
    children,
    ...rest
  }: SonePaginationEdgeProps): ReactElement => {
    const m = useSoneMessages();
    const previous = kind === "previous";
    const text =
      children ?? label ?? (previous ? m.paginationPrevious : m.paginationNext);
    return (
      <SoneButton
        role="link"
        aria-label={
          previous ? m.paginationPreviousLabel : m.paginationNextLabel
        }
        {...rest}
        variant="ghost"
        size="default"
      >
        {previous ? <SoneIcon name="chevron-left" /> : null}
        {text}
        {previous ? null : <SoneIcon name="chevron-right" />}
      </SoneButton>
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

export interface SonePaginationEllipsisProps extends ViewProps {
  /** What screen readers hear in place of the hidden pages. */
  readonly srOnlyText?: string | null;
}

/** `<sone-pagination-ellipsis>` — stands in for hidden pages; says “More pages” to screen readers. */
export function SonePaginationEllipsis({
  srOnlyText = null,
  style,
  ...rest
}: SonePaginationEllipsisProps): ReactElement {
  const { tokens: t } = useSoneTheme();
  const messages = useSoneMessages();
  return (
    <View
      role="img"
      aria-label={srOnlyText ?? messages.paginationMore}
      {...rest}
      style={[
        {
          width: t.controlHMd,
          height: t.controlHMd,
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <SoneIcon name="ellipsis" size={t.controlIcon} color={t.textSecondary} />
    </View>
  );
}

export interface SonePaginationProps extends ViewProps {
  /** The current page (1-based), controlled with `onPageChange`. */
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
}

/**
 * `<sone-pagination>` — page buttons drawn from a page count: Previous, the first and
 * last pages, `siblings` pages around the current one with ellipses for the gaps, and
 * Next. `page` / `defaultPage` / `onPageChange`.
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
  ...rest
}: SonePaginationProps): ReactElement {
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
  return (
    <SonePaginationNav {...rest}>
      <SonePaginationContent>
        <SonePaginationItem>
          <SonePaginationPrevious
            role="button"
            label={previousLabel}
            disabled={disabled || now <= 1}
            onPress={() => go(now - 1)}
          />
        </SonePaginationItem>
        {range.map((entry) => (
          <SonePaginationItem key={entry}>
            {typeof entry === "number" ? (
              <SonePaginationLink
                role="button"
                isActive={entry === now}
                disabled={disabled}
                onPress={() => go(entry)}
              >
                {String(entry)}
              </SonePaginationLink>
            ) : (
              <SonePaginationEllipsis />
            )}
          </SonePaginationItem>
        ))}
        <SonePaginationItem>
          <SonePaginationNext
            role="button"
            label={nextLabel}
            disabled={disabled || now >= count}
            onPress={() => go(now + 1)}
          />
        </SonePaginationItem>
      </SonePaginationContent>
    </SonePaginationNav>
  );
}
