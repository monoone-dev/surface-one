import { useState } from "react";
import { SoneChatHistory, SoneSearchField, type SoneChatHistoryThread } from "@surface-one/react";

const now = new Date(2026, 8, 24, 12, 0);
const at = (daysAgo: number, hour: number): Date =>
  new Date(2026, 8, 24 - daysAgo, hour, 15);

const threads: SoneChatHistoryThread[] = [
  { id: "t1", title: "What did we decide about pricing?", updatedAt: at(0, 9) },
  { id: "t2", title: "Action items from the design review", updatedAt: at(0, 8) },
  { id: "t3", title: "Summarise the hiring debrief", updatedAt: at(1, 16) },
  { id: "t4", title: "Draft the launch announcement", updatedAt: at(4, 11) },
  { id: "t5", title: "Who owns the onboarding checklist?", updatedAt: at(12, 14) },
  { id: "t6", title: "Quarterly planning recap", updatedAt: at(80, 10) },
];

export default function ChatHistoryDemo() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string | null>("t1");
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(16rem, 1fr))", gap: "var(--space-5)" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)", height: "24rem" }}>
        <SoneSearchField value={query} onValueChange={setQuery} size="sm" placeholder="Search chats" aria-label="Search chats" />
        <SoneChatHistory
          variant="sidebar"
          label="Chats"
          threads={threads}
          now={now}
          query={query}
          activeThreadId={active}
          onSelected={setActive}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", height: "24rem" }}>
        <SoneChatHistory
          label="Recent conversations"
          threads={threads}
          activeThreadId={active}
          loadingThreadId="t3"
          onSelected={setActive}
        />
      </div>
    </div>
  );
}
