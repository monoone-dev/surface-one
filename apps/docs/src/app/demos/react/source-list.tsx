import { useState } from "react";
import {
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemTitle,
  SoneMark,
  SoneSourceList,
  SoneSourceListTrigger,
} from "@surface-one/react";

interface Source {
  id: string;
  title: string;
  date: string;
}

const SOURCES: Source[] = [
  { id: "s1", title: "Harbour Lane kickoff", date: "Mar 3" },
  { id: "s2", title: "Pricing review", date: "Mar 5" },
  { id: "s3", title: "Team retro", date: "Mar 9" },
  { id: "s4", title: "Onboarding notes", date: "Mar 12" },
  { id: "s5", title: "Vendor call", date: "Mar 14" },
];

const byId = (source: Source): string => source.id;

export default function SourceListDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="demo-stack" style={{ maxWidth: "32rem" }}>
      <SoneSourceList
        variant="chip"
        label="Sources"
        items={SOURCES}
        trackBy={byId}
        limit={3}
        renderItem={(s) => (
          <SoneItem as="span" variant="outline" size="xs">{s.title} · {s.date}</SoneItem>
        )}
      />

      <SoneSourceList
        variant="row"
        size="sm"
        label="Sources"
        showCount
        items={SOURCES}
        trackBy={byId}
        limit={3}
        renderItem={(s) => (
          <SoneItem variant="muted" size="xs">
            <SoneItemContent>
              <SoneItemTitle as="span">{s.title}</SoneItemTitle>
              <SoneItemDescription as="span">{s.date}</SoneItemDescription>
            </SoneItemContent>
          </SoneItem>
        )}
      />

      <div>
        <SoneSourceListTrigger
          count={SOURCES.length}
          aria-expanded={open}
          aria-controls={open ? "answer-sources" : undefined}
          onClick={() => setOpen(!open)}
        >
          <SoneMark icon="meetings" tone="lagoon" size="sm" />
          <SoneMark icon="notes" tone="iris" size="sm" />
          <SoneMark icon="tasks" tone="amber" size="sm" />
        </SoneSourceListTrigger>
      </div>
      {open ? (
        <SoneSourceList
          id="answer-sources"
          variant="row"
          size="sm"
          ariaLabel="Sources"
          items={SOURCES}
          trackBy={byId}
          renderItem={(s) => (
            <SoneItem as="span" variant="muted" size="xs">
              {s.title} · {s.date}
            </SoneItem>
          )}
        />
      ) : null}
    </div>
  );
}
