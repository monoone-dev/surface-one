// The rows and the age groups of the chat history — the Vue and React
// `SoneChatHistory` render what these return.
import type { SoneMessages } from "./messages";

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

export interface ChatHistoryRow {
  readonly thread: SoneChatHistoryThread;
  readonly updatedLabel: string;
}

export interface ChatHistoryGroup {
  readonly label: string | null;
  readonly rows: readonly ChatHistoryRow[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

/** "Today", "Yesterday", "Previous 7 days", "Previous 30 days" or "Older", by calendar day. */
export function chatHistoryGroupLabel(
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

/** Each thread with its date label: `updatedLabel`, else the date and time in `dateLocale`. */
export function chatHistoryRows(
  threads: readonly SoneChatHistoryThread[],
  dateLocale: string,
): ChatHistoryRow[] {
  const format = new Intl.DateTimeFormat(dateLocale, {
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
}

/** The rows whose title contains `query` (case-insensitive); all of them for a blank query. */
export function filterChatHistoryRows(
  rows: readonly ChatHistoryRow[],
  query: string,
): readonly ChatHistoryRow[] {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return rows;
  return rows.filter((row) =>
    row.thread.title.toLocaleLowerCase().includes(needle),
  );
}

/** `list`: one unlabelled group (none when empty). `sidebar`: the age groups, in row order. */
export function groupChatHistoryRows(
  rows: readonly ChatHistoryRow[],
  variant: SoneChatHistoryVariant,
  now: Date,
  m: SoneMessages,
): readonly ChatHistoryGroup[] {
  if (variant !== "sidebar") {
    return rows.length > 0 ? [{ label: null, rows }] : [];
  }
  const byLabel = new Map<string, ChatHistoryRow[]>();
  for (const row of rows) {
    const label = chatHistoryGroupLabel(row.thread.updatedAt, now, m);
    byLabel.set(label, [...(byLabel.get(label) ?? []), row]);
  }
  return [...byLabel].map(([label, grouped]) => ({ label, rows: grouped }));
}
