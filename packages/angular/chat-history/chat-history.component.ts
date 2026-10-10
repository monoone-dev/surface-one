import {
  ChangeDetectionStrategy,
  Component,
  LOCALE_ID,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from "@angular/core";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_EMPTY_PARTS } from "@surface-one/angular/empty-state";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_ITEM_PARTS } from "@surface-one/angular/item";
import { SoneSpinnerComponent } from "@surface-one/angular/spinner";

/** One conversation in the history. */
export interface SoneChatHistoryThread {
  readonly id: string;
  readonly title: string;
  /** When it last changed: an ISO 8601 string, epoch milliseconds or a `Date`. */
  readonly updatedAt: string | number | Date;
  /** A ready-made label for `updatedAt`; by default the date and time in the app's locale. */
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

function groupLabel(updatedAt: SoneChatHistoryThread["updatedAt"], now: Date) {
  const time = new Date(updatedAt).getTime();
  if (Number.isNaN(time)) return $localize`:Chat history group:Older`;
  const days = Math.floor(
    (startOfDay(now) - startOfDay(new Date(time))) / DAY_MS,
  );
  if (days <= 0) return $localize`:Chat history group:Today`;
  if (days === 1) return $localize`:Chat history group:Yesterday`;
  if (days < 7) return $localize`:Chat history group:Previous 7 days`;
  if (days < 30) return $localize`:Chat history group:Previous 30 days`;
  return $localize`:Chat history group:Older`;
}

/**
 * `<sone-chat-history>` — the browser of saved assistant conversations: first load,
 * load error (with Retry), empty, the list, refreshing (cached rows stay — stale while
 * revalidate) and a non-blocking `notice`. Presentational: the owner loads the threads
 * and reacts to `(selected)` / `(retryRequested)`. `query` filters the titles;
 * `variant="sidebar"` groups compact rows by age (Today, Yesterday, …).
 */
@Component({
  selector: "sone-chat-history",
  imports: [
    SoneButtonDirective,
    ...SONE_ITEM_PARTS,
    ...SONE_EMPTY_PARTS,
    ...SONE_ALERT_PARTS,
    SoneSpinnerComponent,
    SoneIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./chat-history.component.html",
  styleUrl: "./chat-history.component.scss",
  host: {
    "data-slot": "chat-history",
    "[attr.data-variant]": "variant()",
  },
})
export class SoneChatHistoryComponent {
  private readonly locale = inject(LOCALE_ID);

  readonly threads = input<readonly SoneChatHistoryThread[]>([]);
  /** The history is loading: a spinner well at first, a "Refreshing…" line over cached rows. */
  readonly loading = input(false, { transform: booleanAttribute });
  /** Why loading failed: a well with Retry, or an alert above cached rows. */
  readonly error = input<string | null>(null);
  /** A non-blocking message above the list (a row action that failed). */
  readonly notice = input<string | null>(null);
  /** The open conversation: `aria-current` and the active fill. */
  readonly activeThreadId = input<string | null>(null);
  /** The conversation being opened: its row is disabled and busy, with a spinner. */
  readonly loadingThreadId = input<string | null>(null);
  readonly variant = input<SoneChatHistoryVariant>("list");
  /** Filters the rows by title (case-insensitive). */
  readonly query = input("");
  /** "Today" for the `sidebar` groups; `null` = the current time. */
  readonly now = input<Date | null>(null);
  /** The region's accessible name. */
  readonly label = input($localize`Conversation history`);
  readonly emptyTitle = input($localize`No conversations yet`);
  readonly emptyDescription = input(
    $localize`Conversations you start will appear here.`,
  );

  /** The id of the conversation to open. */
  readonly selected = output<string>();
  /** Retry the failed load. */
  readonly retryRequested = output<void>();

  protected readonly rows = computed<readonly HistoryRow[]>(() => {
    const format = new Intl.DateTimeFormat(this.locale, {
      dateStyle: "medium",
      timeStyle: "short",
    });
    return this.threads().map((thread) => ({
      thread,
      updatedLabel: thread.updatedLabel ?? this.formatTimestamp(thread, format),
    }));
  });

  protected readonly visibleRows = computed<readonly HistoryRow[]>(() => {
    const needle = this.query().trim().toLocaleLowerCase();
    if (!needle) return this.rows();
    return this.rows().filter((row) =>
      row.thread.title.toLocaleLowerCase().includes(needle),
    );
  });

  protected readonly groups = computed<readonly HistoryGroup[]>(() => {
    const rows = this.visibleRows();
    if (this.variant() !== "sidebar") {
      return rows.length > 0 ? [{ label: null, rows }] : [];
    }
    const now = this.now() ?? new Date();
    const groups = new Map<string, HistoryRow[]>();
    for (const row of rows) {
      const label = groupLabel(row.thread.updatedAt, now);
      groups.set(label, [...(groups.get(label) ?? []), row]);
    }
    return [...groups].map(([label, grouped]) => ({ label, rows: grouped }));
  });

  protected readonly filtering = computed(() => this.query().trim() !== "");

  private formatTimestamp(
    thread: SoneChatHistoryThread,
    format: Intl.DateTimeFormat,
  ): string {
    const date = new Date(thread.updatedAt);
    return Number.isNaN(date.getTime())
      ? String(thread.updatedAt)
      : format.format(date);
  }
}
