"use client";

import {
  Fragment,
  createElement,
  useImperativeHandle,
  useState,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import { useSoneMessages } from "../../context/messages";
import { SoneBadge } from "../badge/badge";
import { SoneButton } from "../button/button";

export type SourceListVariant = "chip" | "row";
export type SourceListSize = "default" | "sm";

/** What a source list's `handleRef` exposes. */
export interface SoneSourceListHandle {
  /** Every item shows (past `limit`). */
  readonly expanded: boolean;
  /** Shows every item, or only the first `limit` again. */
  toggle(): void;
}

export interface SoneSourceListProps<T> extends Omit<
  HTMLAttributes<HTMLElement>,
  "children"
> {
  readonly items?: readonly T[];
  /** A stable key per item. */
  readonly trackBy: (item: T) => string;
  /** Draws one source (the `[soneSourceListItem]` template). */
  readonly renderItem: (item: T) => ReactNode;
  readonly variant?: SourceListVariant;
  readonly size?: SourceListSize;
  /** The heading over the sources; none when empty. */
  readonly label?: string;
  /** Before the label (`[soneSourceListIcon]`). */
  readonly icon?: ReactNode;
  readonly ariaLabel?: string | null;
  /** A count badge beside the label. */
  readonly showCount?: boolean;
  /** How many show before the toggle; `null` shows them all. */
  readonly limit?: number | null;
  readonly columns?: 1 | 2;
  /** A `<ul role="list">` (default: for rows) or a plain wrapper (default: for chips). */
  readonly list?: boolean | null;
  /** `expanded` and `toggle()`. */
  readonly handleRef?: Ref<SoneSourceListHandle>;
  readonly ref?: Ref<HTMLElement>;
}

/**
 * `<sone-source-list>` — the sources behind an answer, as wrapping chips or a list of rows,
 * with an optional label and count. Past `limit` the rest fold behind a "+N more" (chips) or
 * "Show all (N)" (rows) toggle.
 */
export function SoneSourceList<T>({
  items = [],
  trackBy,
  renderItem,
  variant = "row",
  size = "default",
  label = "",
  icon,
  ariaLabel = null,
  showCount = false,
  limit = null,
  columns = 1,
  list = null,
  handleRef,
  ...rest
}: SoneSourceListProps<T>): ReactElement {
  const m = useSoneMessages();
  const [expanded, setExpanded] = useState(false);
  const toggle = (): void => setExpanded((v) => !v);
  useImperativeHandle(handleRef, () => ({ expanded, toggle }), [expanded]);

  const isList = list ?? variant === "row";
  const hiddenCount = limit === null ? 0 : Math.max(0, items.length - limit);
  const visible = expanded || limit === null ? items : items.slice(0, limit);

  let toggleButton: ReactNode = null;
  if (hiddenCount > 0) {
    toggleButton =
      variant === "chip" ? (
        <SoneButton variant="link" size="sm" type="button" onClick={toggle}>
          {expanded ? m.sourceListShowLess : m.sourceListMore(hiddenCount)}
        </SoneButton>
      ) : (
        <SoneButton
          variant="link"
          size="xs"
          type="button"
          className="source-list-toggle"
          onClick={toggle}
          aria-expanded={expanded ? "true" : "false"}
        >
          {expanded ? m.sourceListShowFewer : m.sourceListShowAll(items.length)}
        </SoneButton>
      );
  }

  return createElement(
    "sone-source-list",
    {
      "data-slot": "source-list",
      "data-variant": variant,
      "data-size": size,
      "data-columns": columns,
      ...rest,
    },
    <div
      className="source-list"
      data-slot="source-list-body"
      aria-label={ariaLabel ?? undefined}
    >
      {label ? (
        <div className="source-list-head" data-slot="source-list-header">
          {icon}
          <span className="source-list-label" data-slot="source-list-label">
            {label}
          </span>
          {showCount ? (
            <SoneBadge variant="secondary">{`${items.length}`}</SoneBadge>
          ) : null}
        </div>
      ) : null}
      {isList ? (
        <ul
          className="source-list-items"
          data-slot="source-list-items"
          role="list"
        >
          {visible.map((item) => (
            <li
              key={trackBy(item)}
              className="source-list-item"
              data-slot="source-list-item"
            >
              {renderItem(item)}
            </li>
          ))}
        </ul>
      ) : (
        <div className="source-list-items" data-slot="source-list-items">
          {visible.map((item) => (
            <Fragment key={trackBy(item)}>{renderItem(item)}</Fragment>
          ))}
        </div>
      )}
      {toggleButton}
    </div>,
  );
}
