import { useState } from "react";
import { SoneSidebar, SoneTree, SoneTreeRow, type TreeRowIcon } from "@surface-one/react";

interface TreeLine {
  id: string;
  label: string;
  icon: TreeRowIcon;
  depth: number;
  parent: string | null;
  expandable: boolean;
}

// FLAT lines tagged with depth; the tree reads order from the DOM and level from depth.
const lines: TreeLine[] = [
  { id: "product", label: "Product", icon: "folder", depth: 0, parent: null, expandable: true },
  { id: "design", label: "Design", icon: "folder", depth: 1, parent: "product", expandable: true },
  { id: "specs", label: "Specs review", icon: "meeting", depth: 2, parent: "design", expandable: false },
  { id: "tokens", label: "Token audit", icon: "note", depth: 2, parent: "design", expandable: false },
  { id: "roadmap", label: "Roadmap review", icon: "meeting", depth: 1, parent: "product", expandable: false },
  { id: "launch", label: "Launch checklist", icon: "task", depth: 1, parent: "product", expandable: false },
  { id: "research", label: "Research", icon: "space", depth: 0, parent: null, expandable: true },
  { id: "interviews", label: "Interviews", icon: "note", depth: 1, parent: "research", expandable: false },
  { id: "one-on-ones", label: "1:1s", icon: "locked", depth: 0, parent: null, expandable: false },
];
const byId = new Map(lines.map((line) => [line.id, line]));

export default function TreeDemo() {
  const [expanded, setExpanded] = useState(() => new Set(["product"]));
  const [selectedId, setSelectedId] = useState("roadmap");

  const shown = (line: TreeLine): boolean =>
    line.parent === null || (expanded.has(line.parent) && shown(byId.get(line.parent)!));
  const toggle = (id: string) =>
    setExpanded((open) => {
      const next = new Set(open);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      <SoneSidebar style={{ width: "18rem" }}>
        <SoneTree aria-label="Workspace">
          {lines.filter(shown).map((line) => (
            <SoneTreeRow
              key={line.id}
              label={line.label}
              icon={line.icon}
              depth={line.depth}
              expandable={line.expandable}
              expanded={expanded.has(line.id)}
              selected={selectedId === line.id}
              onActivate={() => setSelectedId(line.id)}
              onToggleExpand={() => toggle(line.id)}
            />
          ))}
        </SoneTree>
      </SoneSidebar>
      <p style={{ margin: "var(--space-3) 0 0", color: "var(--text-secondary)" }}>Opened: {selectedId}</p>
    </>
  );
}
