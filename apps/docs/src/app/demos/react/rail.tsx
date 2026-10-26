import { useState } from "react";
import { SoneRail, SoneRailButton, SoneRailGroup, type RailBadge, type ShellIcon } from "@surface-one/react";

const places: { id: string; label: string; icon: ShellIcon; badge: RailBadge | null }[] = [
  { id: "home", label: "Home", icon: "dashboards", badge: null },
  { id: "search", label: "Search", icon: "search", badge: null },
  { id: "runs", label: "Runs, one running", icon: "workflow", badge: "busy" },
  { id: "inbox", label: "Inbox, needs you", icon: "bell", badge: "attention" },
];

export default function RailDemo() {
  const [current, setCurrent] = useState("home");
  return (
    <div
      style={{
        display: "flex",
        gap: "var(--space-2)",
        height: "22rem",
        padding: "var(--space-2)",
        borderRadius: "var(--island-radius)",
        background: "var(--app-backdrop)",
      }}
    >
      <SoneRail ariaLabel="Demo app">
        <SoneRailGroup>
          {places.map((place) => (
            <SoneRailButton
              key={place.id}
              icon={place.icon}
              label={place.label}
              badge={place.badge}
              current={current === place.id}
              onClick={() => setCurrent(place.id)}
            />
          ))}
        </SoneRailGroup>
        <SoneRailGroup>
          <SoneRailButton
            icon="settings"
            label="Settings"
            current={current === "settings"}
            onClick={() => setCurrent("settings")}
          />
        </SoneRailGroup>
      </SoneRail>
      <section
        style={{
          flex: 1,
          padding: "var(--space-4)",
          borderRadius: "var(--island-radius)",
          background: "var(--surface-base)",
          boxShadow: "var(--island-shadow)",
        }}
      >
        <p className="text-hint">Current place: {current}</p>
      </section>
    </div>
  );
}
