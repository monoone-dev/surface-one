import { useState } from "react";
import { SonePowerSlider, type PowerRung } from "@surface-one/react";

const RUNGS: readonly PowerRung[] = [
  { id: "battery", name: "Battery saver" },
  { id: "balanced", name: "Balanced" },
  { id: "sharp", name: "Sharp" },
  { id: "max", name: "Maximum" },
];

export default function PowerSliderDemo() {
  const [power, setPower] = useState("balanced");
  return (
    <div className="demo-stack" style={{ maxWidth: "26rem" }}>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <SonePowerSlider rungs={RUNGS} value={power} onValueChange={setPower} ariaLabel="Processing power" />
        <span style={{ color: "var(--text-secondary)" }}>Committed: {power}</span>
      </div>
      <SonePowerSlider rungs={RUNGS} value="battery" disabled ariaLabel="Processing power (locked)" />
    </div>
  );
}
