import { useState } from "react";
import { SoneDatePicker, SoneField, SoneFieldLabel, type SoneCalendarValue } from "@surface-one/react";

export default function DatePickerDemo() {
  const [due, setDue] = useState<SoneCalendarValue>("2026-06-12");
  const [trip, setTrip] = useState<SoneCalendarValue>(null);
  return (
    <div className="demo-row" style={{ alignItems: "flex-start", flexWrap: "wrap", minHeight: "24rem" }}>
      <SoneField style={{ width: "15rem" }}>
        <SoneFieldLabel htmlFor="demo-due-date">Due date</SoneFieldLabel>
        <SoneDatePicker triggerId="demo-due-date" value={due} onValueChange={setDue} />
      </SoneField>
      <SoneField style={{ width: "18rem" }}>
        <SoneFieldLabel htmlFor="demo-trip">Trip</SoneFieldLabel>
        <SoneDatePicker triggerId="demo-trip" mode="range" value={trip} onValueChange={setTrip} weekStartsOn={1} placeholder="Pick the dates" />
      </SoneField>
    </div>
  );
}
