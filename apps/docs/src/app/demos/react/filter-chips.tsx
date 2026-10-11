import { useState } from "react";
import { SoneFilterChips, type FilterChipOption } from "@surface-one/react";

const levels: FilterChipOption[] = [
  { value: "all", label: "All", count: 128 },
  { value: "error", label: "Errors", count: 3, tone: "danger" },
  { value: "warn", label: "Warnings", count: 11, tone: "warning" },
];
const views: FilterChipOption[] = [
  { value: "inbox", label: "Inbox", count: 4 },
  { value: "upcoming", label: "Upcoming" },
  { value: "done", label: "Done" },
];

export default function FilterChipsDemo() {
  const [level, setLevel] = useState("all");
  const [view, setView] = useState("inbox");
  return (
    <div className="demo-stack">
      <SoneFilterChips value={level} onValueChange={setLevel} options={levels} ariaLabel="Filter by level" />
      <SoneFilterChips value={view} onValueChange={setView} variant="tabs" options={views} ariaLabel="Reminder views" />
    </div>
  );
}
