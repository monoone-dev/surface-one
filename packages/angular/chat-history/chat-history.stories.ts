import { type Meta, type StoryObj } from "@storybook/angular";

import {
  SoneChatHistoryComponent,
  type SoneChatHistoryThread,
} from "./chat-history.component";

/** A fixed "now", so the sidebar groups (Today, Yesterday, …) never drift. */
const NOW = new Date("2026-09-24T12:00:00Z");

const THREADS: SoneChatHistoryThread[] = [
  {
    id: "t1",
    title: "What did we decide about the Paper skin?",
    updatedAt: "2026-09-24T09:40:00Z",
  },
  {
    id: "t2",
    title: "Action items from the hiring debrief",
    updatedAt: "2026-09-23T14:05:00Z",
  },
  {
    id: "t3",
    title: "Summarise the licensing thread for legal",
    updatedAt: "2026-09-20T11:15:00Z",
  },
  {
    id: "t4",
    title:
      "A very long question that keeps going so the row has to truncate it with an ellipsis instead of wrapping",
    updatedAt: "2026-09-10T08:31:00Z",
  },
  {
    id: "t5",
    title: "Quarterly planning recap",
    updatedAt: "2026-07-02T16:20:00Z",
  },
];

const meta: Meta<SoneChatHistoryComponent> = {
  title: "Components/Chat/Chat History",
  component: SoneChatHistoryComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-chat-history>` — the browser of saved assistant conversations. Presentational: the " +
          "owner loads `threads` (`{ id, title, updatedAt, updatedLabel? }`) and reacts to " +
          "`(selected)` (the thread id) and `(retryRequested)`. States: first load, load error, empty, " +
          "the list, refreshing (cached rows stay — stale while revalidate) and a non-blocking `notice`. " +
          "`query` filters the titles; `variant`: `list` (the date under each title) | `sidebar` " +
          "(compact rows grouped Today / Yesterday / Previous 7 days / Previous 30 days / Older, the " +
          "date in the row's tooltip; `now` pins “today”). No card frame, so a narrow drawer stays " +
          "one flat pane.\n\n" +
          'Anatomy (spartan): each row is an **Item** (`[soneItem] size="sm"` → content → title + ' +
          "description); first load / error / empty are the **Empty** well; notices are an **Alert** " +
          '(`variant="warning"`); spinners are `<sone-spinner>`. The list is a shadcn **SidebarMenu** ' +
          '(`role="list"`): the open thread (`activeThreadId`) gets `aria-current` and the neutral ' +
          "`--shell-active-bg` fill; the opening one (`loadingThreadId`) is disabled + `aria-busy` " +
          "with a spinner.\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/item](https://spartan.ng/components/item), " +
          "[https://spartan.ng/components/sidebar](https://spartan.ng/components/sidebar)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/item](https://ui.shadcn.com/docs/components/item), " +
          "[https://ui.shadcn.com/docs/components/sidebar](https://ui.shadcn.com/docs/components/sidebar)",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: ["list", "sidebar"] },
    loading: { control: "boolean" },
    error: { control: "text" },
    notice: { control: "text" },
    query: { control: "text" },
    activeThreadId: {
      control: "inline-radio",
      options: [null, "t1", "t2", "t3", "t4", "t5"],
    },
    loadingThreadId: {
      control: "inline-radio",
      options: [null, "t1", "t2", "t3", "t4", "t5"],
    },
    selected: { action: "selected" },
    retryRequested: { action: "retryRequested" },
  },
  args: {
    threads: THREADS,
    variant: "list",
    loading: false,
    error: null,
    notice: null,
    query: "",
    activeThreadId: "t1",
    loadingThreadId: null,
    now: NOW,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; max-width: 360px; height: 420px">
        <sone-chat-history [threads]="threads" [variant]="variant" [loading]="loading" [error]="error"
          [notice]="notice" [query]="query" [now]="now" [activeThreadId]="activeThreadId"
          [loadingThreadId]="loadingThreadId" (selected)="selected($event)"
          (retryRequested)="retryRequested()" />
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneChatHistoryComponent>;

export const List: Story = {};
export const Sidebar: Story = { args: { variant: "sidebar" } };
export const Filtered: Story = { args: { variant: "sidebar", query: "plan" } };
export const NoMatch: Story = { args: { query: "budget" } };
export const FirstLoad: Story = { args: { threads: [], loading: true } };
export const Refreshing: Story = { args: { loading: true } };
export const Empty: Story = { args: { threads: [] } };
export const LoadError: Story = {
  args: {
    threads: [],
    error: "Couldn’t load conversations — the database is locked.",
  },
};
export const OpeningThread: Story = { args: { loadingThreadId: "t2" } };
export const WithNotice: Story = {
  args: { notice: "Couldn’t delete that conversation. It’s still here." },
};
export const ErrorWithCachedRows: Story = {
  args: { error: "Couldn’t refresh conversation history." },
};
