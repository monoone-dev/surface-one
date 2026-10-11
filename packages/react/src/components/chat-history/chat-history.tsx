"use client";

import {
  createElement,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";

import { useSoneMessages, type SoneMessages } from "../../context/messages";
import {
  SoneAlert,
  SoneAlertAction,
  SoneAlertDescription,
} from "../alert/alert";
import { SoneButton } from "../button/button";
import { SoneIcon } from "../icon/icon";
import {
  SoneItem,
  SoneItemActions,
  SoneItemContent,
  SoneItemDescription,
  SoneItemTitle,
} from "../item/item";
import { SoneSpinner } from "../spinner/spinner";

/** One conversation in the history. */
export interface SoneChatHistoryThread {
  readonly id: string;
  readonly title: string;
  /** When it last changed: an ISO 8601 string, epoch milliseconds or a `Date`. */
  readonly updatedAt: string | number | Date;
  /** A ready-made label for `updatedAt`; by default the date and time in `dateLocale`. */
  readonly updatedLabel?: string;
}

/** `list`: a flat list with the date under each title. `sidebar`: compact rows grouped by age. */
export type SoneChatHistoryVariant = "list" | "sidebar";

interface HistoryRow {
  readonly thread: SoneChatHistoryThread;
  readonly updatedLabel: string;
}

interface HistoryGroup {
  readonly label: string | null;
  readonly rows: readonly HistoryRow[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function groupLabel(
  updatedAt: SoneChatHistoryThread["updatedAt"],
  now: Date,
  m: SoneMessages,
): string {
  const time = new Date(updatedAt).getTime();
  if (Number.isNaN(time)) return m.chatHistoryOlder;
  const days = Math.floor(
    (startOfDay(now) - startOfDay(new Date(time))) / DAY_MS,
  );
  if (days <= 0) return m.chatHistoryToday;
  if (days === 1) return m.chatHistoryYesterday;
  if (days < 7) return m.chatHistoryPrevious7Days;
  if (days < 30) return m.chatHistoryPrevious30Days;
  return m.chatHistoryOlder;
}

const EmptyHeader = ({ children }: { children: ReactNode }) => (
  <div className="empty-header" data-slot="empty-header">
    {children}
  </div>
);

const EmptyDescription = ({ children }: { children: ReactNode }) => (
  <p className="empty" data-slot="empty-description">
    {children}
  </p>
);

export interface SoneChatHistoryProps extends HTMLAttributes<HTMLElement> {
  readonly threads?: readonly SoneChatHistoryThread[];
  /** The history is loading: a spinner well at first, a "Refreshing…" line over cached rows. */
  readonly loading?: boolean;
  /** Why loading failed: a well with Retry, or an alert above cached rows. */
  readonly error?: string | null;
  /** A non-blocking message above the list (a row action that failed). */
  readonly notice?: string | null;
  /** The open conversation: `aria-current` and the active fill. */
  readonly activeThreadId?: string | null;
  /** The conversation being opened: its row is disabled and busy, with a spinner. */
  readonly loadingThreadId?: string | null;
  readonly variant?: SoneChatHistoryVariant;
  /** Filters the rows by title (case-insensitive). */
  readonly query?: string;
  /** "Today" for the `sidebar` groups; `null` = the current time. */
  readonly now?: Date | null;
  /** The region's accessible name (default: the "Conversation history" message). */
  readonly label?: string | null;
  /** Default: the "No conversations yet" message. */
  readonly emptyTitle?: string | null;
  /** Default: the "Conversations you start will appear here." message. */
  readonly emptyDescription?: string | null;
  /** The id of the conversation to open. */
  readonly onSelected?: (id: string) => void;
  /** Retry the failed load. */
  readonly onRetryRequested?: () => void;
}

/**
 * `<sone-chat-history>` — the browser of saved assistant conversations: first load,
 * load error (with Retry), empty, the list, refreshing (cached rows stay — stale while
 * revalidate) and a non-blocking `notice`. Presentational: the owner loads the threads
 * and reacts to `onSelected` / `onRetryRequested`. `query` filters the titles;
 * `variant="sidebar"` groups compact rows by age (Today, Yesterday, …).
 */
export function SoneChatHistory({
  threads = [],
  loading = false,
  error = null,
  notice = null,
  activeThreadId = null,
  loadingThreadId = null,
  variant = "list",
  query = "",
  now = null,
  label = null,
  emptyTitle = null,
  emptyDescription = null,
  onSelected,
  onRetryRequested,
  ...rest
}: SoneChatHistoryProps) {
  const m = useSoneMessages();

  const rows = useMemo<readonly HistoryRow[]>(() => {
    const format = new Intl.DateTimeFormat(m.dateLocale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return threads.map((thread) => {
      const date = new Date(thread.updatedAt);
      return {
        thread,
        updatedLabel:
          thread.updatedLabel ??
          (Number.isNaN(date.getTime())
            ? String(thread.updatedAt)
            : format.format(date)),
      };
    });
  }, [threads, m.dateLocale]);

  const needle = query.trim().toLocaleLowerCase();
  const visibleRows = needle
    ? rows.filter((row) =>
        row.thread.title.toLocaleLowerCase().includes(needle),
      )
    : rows;

  let groups: readonly HistoryGroup[];
  if (variant !== "sidebar") {
    groups = visibleRows.length > 0 ? [{ label: null, rows: visibleRows }] : [];
  } else {
    const today = now ?? new Date();
    const byLabel = new Map<string, HistoryRow[]>();
    for (const row of visibleRows) {
      const group = groupLabel(row.thread.updatedAt, today, m);
      byLabel.set(group, [...(byLabel.get(group) ?? []), row]);
    }
    groups = [...byLabel].map(([group, grouped]) => ({
      label: group,
      rows: grouped,
    }));
  }

  const retry = (kind: "outline" | "ghost", size: "sm" | "xs") => (
    <SoneButton
      variant={kind}
      size={size}
      type="button"
      className="history-retry"
      onClick={() => onRetryRequested?.()}
    >
      {m.chatHistoryRetry}
    </SoneButton>
  );

  const row = (r: HistoryRow) => {
    const active = r.thread.id === activeThreadId;
    const opening = r.thread.id === loadingThreadId;
    return (
      <div key={r.thread.id} role="listitem" className="history-item">
        <SoneItem
          as="button"
          size="sm"
          type="button"
          className="history-row"
          data-active={active ? "true" : undefined}
          aria-current={active ? "true" : undefined}
          aria-busy={opening ? "true" : undefined}
          title={variant === "sidebar" ? r.updatedLabel : undefined}
          disabled={opening}
          onClick={() => onSelected?.(r.thread.id)}
        >
          <SoneItemContent as="span">
            <SoneItemTitle as="span" className="history-title">
              {r.thread.title}
            </SoneItemTitle>
            {variant === "list" ? (
              <SoneItemDescription as="span" className="history-updated">
                {r.updatedLabel}
              </SoneItemDescription>
            ) : null}
          </SoneItemContent>
          {opening ? (
            <SoneItemActions as="span">
              <SoneSpinner size={12} label={null} />
            </SoneItemActions>
          ) : null}
        </SoneItem>
      </div>
    );
  };

  const hasRows = rows.length > 0;
  let body: ReactNode;

  if (loading && !hasRows) {
    body = (
      <div
        className="empty-state history-state"
        data-slot="empty"
        role="status"
      >
        <EmptyHeader>
          <div
            className="empty-media"
            data-slot="empty-media"
            data-variant="default"
          >
            <SoneSpinner label={null} />
          </div>
          <EmptyDescription>{m.chatHistoryLoading}</EmptyDescription>
        </EmptyHeader>
      </div>
    );
  } else if (error && !hasRows) {
    body = (
      <div className="empty-state history-state" data-slot="empty" role="alert">
        <EmptyHeader>
          <EmptyDescription>{error}</EmptyDescription>
        </EmptyHeader>
        <div className="empty-content" data-slot="empty-content">
          {retry("outline", "sm")}
        </div>
      </div>
    );
  } else {
    const filtering = query.trim() !== "";
    const listChildren: ReactNode =
      groups.length > 0 ? (
        groups.flatMap((g) => [
          g.label ? (
            <div
              key={`group:${g.label}`}
              className="history-group-label"
              data-slot="chat-history-group-label"
              role="presentation"
            >
              {g.label}
            </div>
          ) : null,
          ...g.rows.map(row),
        ])
      ) : filtering ? (
        <p className="history-no-match" role="status">
          {m.chatHistoryNoMatch(query.trim())}
        </p>
      ) : (
        <div className="empty-state history-state" data-slot="empty">
          <EmptyHeader>
            <div
              className="empty-media"
              data-slot="empty-media"
              data-variant="icon"
            >
              <SoneIcon icon="history" />
            </div>
            <p className="empty-title" data-slot="empty-title">
              {emptyTitle ?? m.chatHistoryEmptyTitle}
            </p>
            <EmptyDescription>
              {emptyDescription ?? m.chatHistoryEmptyDescription}
            </EmptyDescription>
          </EmptyHeader>
        </div>
      );
    body = (
      <>
        {error ? (
          <SoneAlert variant="warning" className="history-notice" role="alert">
            <SoneAlertDescription>{error}</SoneAlertDescription>
            <SoneAlertAction>{retry("ghost", "xs")}</SoneAlertAction>
          </SoneAlert>
        ) : null}
        {notice ? (
          <SoneAlert variant="warning" className="history-notice" role="alert">
            <SoneAlertDescription>{notice}</SoneAlertDescription>
          </SoneAlert>
        ) : null}
        <div
          className="history-list stack"
          data-slot="chat-history-list"
          data-gap="1"
          data-variant={variant}
          role={visibleRows.length > 0 ? "list" : undefined}
        >
          {listChildren}
        </div>
        {loading && hasRows ? (
          <span className="history-refresh" role="status">
            <SoneSpinner size={12} label={null} />
            {m.chatHistoryRefreshing}
          </span>
        ) : null}
      </>
    );
  }

  return createElement(
    "sone-chat-history",
    { "data-slot": "chat-history", "data-variant": variant, ...rest },
    <section className="history" aria-label={label ?? m.chatHistoryLabel}>
      {body}
    </section>,
  );
}
