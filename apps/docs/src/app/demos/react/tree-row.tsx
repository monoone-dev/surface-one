import { useState } from "react";
import { SoneSidebar, SoneTreeRow, type TreeRowIcon } from "@surface-one/react";

interface TreeLine {
  id: string;
  label: string;
  icon: TreeRowIcon;
  depth: number;
  parent: string | null;
  count: number | null;
  expandable: boolean;
}

// The tree stays FLAT: one list of depth-tagged lines, nesting is indentation.
const lines: TreeLine[] = [
  { id: "product", label: "Product", icon: "folder", depth: 0, parent: null, count: 4, expandable: true },
  { id: "roadmap", label: "Roadmap review", icon: "meeting", depth: 1, parent: "product", count: null, expandable: false },
  { id: "launch", label: "Launch checklist", icon: "task", depth: 1, parent: "product", count: null, expandable: false },
  { id: "pricing", label: "Pricing notes", icon: "note", depth: 1, parent: "product", count: null, expandable: false },
  { id: "metrics", label: "Metrics board", icon: "dashboard", depth: 1, parent: "product", count: null, expandable: false },
  { id: "one-on-ones", label: "1:1s", icon: "locked", depth: 0, parent: null, count: 2, expandable: false },
];

export default function TreeRowDemo() {
  const [expanded, setExpanded] = useState(() => new Set(["product"]));
  const [selectedId, setSelectedId] = useState("roadmap");
  const toggle = (id: string) =>
    setExpanded((open) => {
      const next = new Set(open);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <SoneSidebar style={{ width: "18rem" }}>
      {lines
        .filter((line) => line.parent === null || expanded.has(line.parent))
        .map((line) => (
          <SoneTreeRow
            key={line.id}
            label={line.label}
            icon={line.icon}
            depth={line.depth}
            count={line.count}
            expandable={line.expandable}
            expanded={expanded.has(line.id)}
            selected={selectedId === line.id}
            onActivate={() => setSelectedId(line.id)}
            onToggleExpand={() => toggle(line.id)}
          />
        ))}
    </SoneSidebar>
  );
}
