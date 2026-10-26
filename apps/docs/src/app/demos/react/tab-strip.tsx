import { useRef, useState } from "react";
import { SoneTabStrip, SoneTabStripTrailing, type TabStripTab } from "@surface-one/react";

const initial: TabStripTab[] = [
  { id: "plan", label: "Release plan", status: "done" },
  { id: "agent", label: "Agent run", status: "busy", note: "4 min" },
  { id: "review", label: "Review notes", status: "waiting", note: "waits" },
];

export default function TabStripDemo() {
  const [tabs, setTabs] = useState(initial);
  const [active, setActive] = useState<string | null>("agent");
  const count = useRef(0);

  const close = (id: string) => {
    const i = tabs.findIndex((t) => t.id === id);
    const rest = tabs.filter((t) => t.id !== id);
    if (active === id) setActive((rest[i] ?? rest[i - 1])?.id ?? null);
    setTabs(rest);
  };
  const add = () => {
    const n = ++count.current;
    const id = `new-${n}`;
    setTabs([...tabs, { id, label: `Untitled ${n}` }]);
    setActive(id);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-2)",
        padding: "var(--space-2)",
        borderRadius: "var(--island-radius)",
        background: "var(--app-backdrop)",
      }}
    >
      <SoneTabStrip
        ariaLabel="Documents"
        panelIdPrefix="doc"
        tabs={tabs}
        active={active}
        onActiveChange={setActive}
        closable
        addable
        onClose={close}
        onAdd={add}
      >
        <SoneTabStripTrailing>
          <span className="text-hint">{tabs.length} open</span>
        </SoneTabStripTrailing>
      </SoneTabStrip>
      {tabs.map((tab) => (
        <section
          key={tab.id}
          role="tabpanel"
          id={`doc-${tab.id}`}
          aria-labelledby={`doc-tab-${tab.id}`}
          hidden={tab.id !== active}
          tabIndex={0}
          style={{
            minHeight: "8rem",
            padding: "var(--space-4)",
            borderRadius: "var(--island-radius)",
            background: "var(--surface-base)",
            boxShadow: "var(--island-shadow)",
          }}
        >
          <p>{tab.label}</p>
        </section>
      ))}
    </div>
  );
}
