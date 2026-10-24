import { useState } from "react";
import { SoneCalendar, type SoneCalendarValue } from "@surface-one/react";

export default function CalendarDemo() {
  const [date, setDate] = useState<SoneCalendarValue>("2026-06-12");
  const [stay, setStay] = useState<SoneCalendarValue>({ start: "2026-06-08", end: "2026-06-12" });
  return (
    <div className="demo-row" style={{ alignItems: "flex-start", flexWrap: "wrap" }}>
      <SoneCalendar value={date} onValueChange={setDate} aria-label="Delivery date" />
      <SoneCalendar mode="range" value={stay} onValueChange={setStay} weekStartsOn={1} aria-label="Stay" />
    </div>
  );
}
