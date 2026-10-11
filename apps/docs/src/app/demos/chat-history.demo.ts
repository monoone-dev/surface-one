import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import {
  SoneChatHistoryComponent,
  type SoneChatHistoryThread,
} from "@surface-one/angular/chat-history";
import { SoneSearchFieldComponent } from "@surface-one/angular/search-field";

// Local-time dates, so the server render and the browser agree on the groups.
const NOW = new Date(2026, 8, 24, 12, 0);
const at = (daysAgo: number, hour: number): Date =>
  new Date(2026, 8, 24 - daysAgo, hour, 15);

const THREADS: SoneChatHistoryThread[] = [
  { id: "t1", title: "What did we decide about pricing?", updatedAt: at(0, 9) },
  {
    id: "t2",
    title: "Action items from the design review",
    updatedAt: at(0, 8),
  },
  { id: "t3", title: "Summarise the hiring debrief", updatedAt: at(1, 16) },
  { id: "t4", title: "Draft the launch announcement", updatedAt: at(4, 11) },
  {
    id: "t5",
    title: "Who owns the onboarding checklist?",
    updatedAt: at(12, 14),
  },
  { id: "t6", title: "Quarterly planning recap", updatedAt: at(80, 10) },
];

const TEMPLATE = `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--space-5)">
  <div style="display: flex; flex-direction: column; gap: var(--space-2); height: 24rem">
    <sone-search-field [(value)]="query" size="sm" placeholder="Search chats" ariaLabel="Search chats" />
    <sone-chat-history
      variant="sidebar"
      label="Chats"
      [threads]="threads"
      [now]="now"
      [query]="query()"
      [activeThreadId]="active()"
      (selected)="active.set($event)"
    />
  </div>
  <div style="display: flex; flex-direction: column; height: 24rem">
    <sone-chat-history
      label="Recent conversations"
      [threads]="threads"
      [activeThreadId]="active()"
      loadingThreadId="t3"
      (selected)="active.set($event)"
    />
  </div>
</div>`;

export const code = TEMPLATE;

@Component({
  selector: "docs-chat-history-demo",
  imports: [SoneChatHistoryComponent, SoneSearchFieldComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class ChatHistoryDemo {
  readonly threads = THREADS;
  readonly now = NOW;
  readonly query = signal("");
  readonly active = signal<string | null>("t1");
}
