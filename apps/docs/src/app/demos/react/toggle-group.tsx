import { useState } from "react";
import {
  SoneIcon,
  SoneTabsList,
  SoneTabsTrigger,
  SoneToggle,
  SoneToggleGroup,
  SoneToggleGroupItem,
} from "@surface-one/react";

export default function ToggleGroupDemo() {
  const [view, setView] = useState("List");
  const [pinned, setPinned] = useState(true);
  const [locked, setLocked] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [dest, setDest] = useState("Existing folder");
  const [kind, setKind] = useState("Folder");
  return (
    <div className="demo-stack">
      <div className="demo-row">
        <SoneToggleGroup variant="outline" role="group" aria-label="View">
          {["List", "Board", "Calendar"].map((v) => (
            <SoneToggleGroupItem key={v} type="button" pressed={view === v} onClick={() => setView(v)}>
              {v}
            </SoneToggleGroupItem>
          ))}
        </SoneToggleGroup>
        <SoneToggle variant="outline" type="button" pressed={pinned} onClick={() => setPinned(!pinned)}>
          <SoneIcon icon="star" inline="start" /> Pinned
        </SoneToggle>
        <SoneToggle type="button" aria-label="Lock editing" pressed={locked} onClick={() => setLocked(!locked)}>
          <SoneIcon icon="lock" />
        </SoneToggle>
      </div>
      <div style={{ display: "grid", gap: "var(--space-3)" }}>
        <SoneTabsList role="tablist" aria-label="Project">
          {["Overview", "Activity", "Settings"].map((t) => (
            <SoneTabsTrigger
              key={t}
              id={"demo-tab-" + t}
              role="tab"
              type="button"
              active={tab === t}
              onClick={() => setTab(t)}
            >
              {t}
            </SoneTabsTrigger>
          ))}
        </SoneTabsList>
        <div role="tabpanel" aria-labelledby={"demo-tab-" + tab} style={{ color: "var(--text-secondary)" }}>
          {tab} content goes here.
        </div>
      </div>
      <div style={{ display: "grid", gap: "var(--space-3)", maxWidth: "24rem" }}>
        <SoneToggleGroup variant="dashed" size="sm" spacing={2} stretch role="group" aria-label="Destination">
          {["Existing folder", "New folder"].map((d) => (
            <SoneToggleGroupItem key={d} type="button" pressed={dest === d} onClick={() => setDest(d)}>
              {d}
            </SoneToggleGroupItem>
          ))}
        </SoneToggleGroup>
        <SoneTabsList stretch aria-label="Kind">
          {["Folder", "Workspace"].map((k) => (
            <SoneTabsTrigger key={k} type="button" active={kind === k} onClick={() => setKind(k)}>
              {k}
            </SoneTabsTrigger>
          ))}
        </SoneTabsList>
      </div>
    </div>
  );
}
