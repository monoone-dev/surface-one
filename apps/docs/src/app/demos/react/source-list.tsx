import {
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemTitle,
  SoneSourceList,
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
    </div>
  );
}
