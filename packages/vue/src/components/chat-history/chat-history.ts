import { computed, defineComponent, h, type PropType, type VNode } from "vue";

import {
  chatHistoryRows,
  filterChatHistoryRows,
  groupChatHistoryRows,
  type ChatHistoryRow as HistoryRow,
  type SoneChatHistoryThread,
  type SoneChatHistoryVariant,
} from "@surface-one/core";

export type {
  SoneChatHistoryThread,
  SoneChatHistoryVariant,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
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

const empty = (attrs: Record<string, unknown>, children: VNode[]): VNode =>
  h(
    "div",
    { class: "empty-state history-state", "data-slot": "empty", ...attrs },
    children,
  );

const emptyHeader = (children: (VNode | null)[]): VNode =>
  h("div", { class: "empty-header", "data-slot": "empty-header" }, children);

const emptyDescription = (text: string): VNode =>
  h("p", { class: "empty", "data-slot": "empty-description" }, text);

/**
 * `<sone-chat-history>` — the browser of saved assistant conversations: first load,
 * load error (with Retry), empty, the list, refreshing (cached rows stay — stale while
 * revalidate) and a non-blocking `notice`. Presentational: the owner loads the threads
 * and reacts to `selected` / `retryRequested`. `query` filters the titles;
 * `variant="sidebar"` groups compact rows by age (Today, Yesterday, …).
 */
export const SoneChatHistory = defineComponent({
  name: "SoneChatHistory",
  props: {
    threads: {
      type: Array as PropType<readonly SoneChatHistoryThread[]>,
      default: () => [],
    },
    /** The history is loading: a spinner well at first, a "Refreshing…" line over cached rows. */
    loading: { type: Boolean, default: false },
    /** Why loading failed: a well with Retry, or an alert above cached rows. */
    error: { type: String as PropType<string | null>, default: null },
    /** A non-blocking message above the list (a row action that failed). */
    notice: { type: String as PropType<string | null>, default: null },
    /** The open conversation: `aria-current` and the active fill. */
    activeThreadId: { type: String as PropType<string | null>, default: null },
    /** The conversation being opened: its row is disabled and busy, with a spinner. */
    loadingThreadId: {
      type: String as PropType<string | null>,
      default: null,
    },
    variant: {
      type: String as PropType<SoneChatHistoryVariant>,
      default: "list",
    },
    /** Filters the rows by title (case-insensitive). */
    query: { type: String, default: "" },
    /** "Today" for the `sidebar` groups; `null` = the current time. */
    now: { type: Date as PropType<Date | null>, default: null },
    /** The region's accessible name (default: the "Conversation history" message). */
    label: { type: String as PropType<string | null>, default: null },
    /** Default: the "No conversations yet" message. */
    emptyTitle: { type: String as PropType<string | null>, default: null },
    /** Default: the "Conversations you start will appear here." message. */
    emptyDescription: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  emits: {
    /** The id of the conversation to open. */
    selected: (id: string) => typeof id === "string",
    /** Retry the failed load. */
    retryRequested: () => true,
  },
  setup(props, { emit }) {
    const messages = useSoneMessages();

    const rows = computed(() =>
      chatHistoryRows(props.threads, messages.value.dateLocale),
    );
    const visibleRows = computed(() =>
      filterChatHistoryRows(rows.value, props.query),
    );
    const groups = computed(() =>
      groupChatHistoryRows(
        visibleRows.value,
        props.variant,
        props.now ?? new Date(),
        messages.value,
      ),
    );

    const retry = (variant: "outline" | "ghost", size: "sm" | "xs"): VNode =>
      h(
        SoneButton,
        {
          variant,
          size,
          type: "button",
          class: "history-retry",
          onClick: () => emit("retryRequested"),
        },
        () => messages.value.chatHistoryRetry,
      );

    const row = (r: HistoryRow): VNode => {
      const active = r.thread.id === props.activeThreadId;
      const opening = r.thread.id === props.loadingThreadId;
      return h("div", { role: "listitem", class: "history-item" }, [
        h(
          SoneItem,
          {
            as: "button",
            size: "sm",
            type: "button",
            class: "history-row",
            "data-active": active ? "true" : undefined,
            "aria-current": active ? "true" : undefined,
            "aria-busy": opening ? "true" : undefined,
            title: props.variant === "sidebar" ? r.updatedLabel : undefined,
            disabled: opening,
            onClick: () => emit("selected", r.thread.id),
          },
          () => [
            h(SoneItemContent, { as: "span" }, () => [
              h(
                SoneItemTitle,
                { as: "span", class: "history-title" },
                () => r.thread.title,
              ),
              props.variant === "list"
                ? h(
                    SoneItemDescription,
                    { as: "span", class: "history-updated" },
                    () => r.updatedLabel,
                  )
                : null,
            ]),
            opening
              ? h(SoneItemActions, { as: "span" }, () =>
                  h(SoneSpinner, { size: 12, label: null }),
                )
              : null,
          ],
        ),
      ]);
    };

    return () => {
      const m = messages.value;
      const hasRows = rows.value.length > 0;
      let body: (VNode | null)[];

      if (props.loading && !hasRows) {
        body = [
          empty({ role: "status" }, [
            emptyHeader([
              h(
                "div",
                {
                  class: "empty-media",
                  "data-slot": "empty-media",
                  "data-variant": "default",
                },
                h(SoneSpinner, { label: null }),
              ),
              emptyDescription(m.chatHistoryLoading),
            ]),
          ]),
        ];
      } else if (props.error && !hasRows) {
        body = [
          empty({ role: "alert" }, [
            emptyHeader([emptyDescription(props.error)]),
            h(
              "div",
              { class: "empty-content", "data-slot": "empty-content" },
              retry("outline", "sm"),
            ),
          ]),
        ];
      } else {
        const list = groups.value;
        const filtering = props.query.trim() !== "";
        const listChildren: (VNode | null)[] =
          list.length > 0
            ? list.flatMap((g) => [
                g.label
                  ? h(
                      "div",
                      {
                        class: "history-group-label",
                        "data-slot": "chat-history-group-label",
                        role: "presentation",
                      },
                      g.label,
                    )
                  : null,
                ...g.rows.map(row),
              ])
            : [
                filtering
                  ? h(
                      "p",
                      { class: "history-no-match", role: "status" },
                      m.chatHistoryNoMatch(props.query.trim()),
                    )
                  : empty({}, [
                      emptyHeader([
                        h(
                          "div",
                          {
                            class: "empty-media",
                            "data-slot": "empty-media",
                            "data-variant": "icon",
                          },
                          h(SoneIcon, { icon: "history" }),
                        ),
                        h(
                          "p",
                          { class: "empty-title", "data-slot": "empty-title" },
                          props.emptyTitle ?? m.chatHistoryEmptyTitle,
                        ),
                        emptyDescription(
                          props.emptyDescription ??
                            m.chatHistoryEmptyDescription,
                        ),
                      ]),
                    ]),
              ];
        body = [
          props.error
            ? h(
                SoneAlert,
                { variant: "warning", class: "history-notice", role: "alert" },
                () => [
                  h(SoneAlertDescription, null, () => props.error),
                  h(SoneAlertAction, null, () => retry("ghost", "xs")),
                ],
              )
            : null,
          props.notice
            ? h(
                SoneAlert,
                { variant: "warning", class: "history-notice", role: "alert" },
                () => [h(SoneAlertDescription, null, () => props.notice)],
              )
            : null,
          h(
            "div",
            {
              class: "history-list stack",
              "data-slot": "chat-history-list",
              "data-gap": "1",
              "data-variant": props.variant,
              role: visibleRows.value.length > 0 ? "list" : undefined,
            },
            listChildren,
          ),
          props.loading && hasRows
            ? h("span", { class: "history-refresh", role: "status" }, [
                h(SoneSpinner, { size: 12, label: null }),
                m.chatHistoryRefreshing,
              ])
            : null,
        ];
      }

      return h(
        "sone-chat-history",
        { "data-slot": "chat-history", "data-variant": props.variant },
        h(
          "section",
          { class: "history", "aria-label": props.label ?? m.chatHistoryLabel },
          body,
        ),
      );
    };
  },
});
