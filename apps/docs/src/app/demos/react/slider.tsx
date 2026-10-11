import { useState } from "react";
import { SoneSlider } from "@surface-one/react";

export default function SliderDemo() {
  const [volume, setVolume] = useState(40);
  const [rating, setRating] = useState(7);
  return (
    <div className="demo-stack" style={{ maxWidth: "22rem" }}>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <span style={{ color: "var(--text-secondary)" }}>Volume: {volume}%</span>
        <SoneSlider value={volume} onValueChange={setVolume} aria-label="Volume" />
      </div>
      <div style={{ display: "grid", gap: "var(--space-2)" }}>
        <span style={{ color: "var(--text-secondary)" }}>Rating: {rating} of 10</span>
        <SoneSlider value={rating} onValueChange={setRating} min={0} max={10} step={1} aria-label="Rating" />
      </div>
      <SoneSlider value={60} disabled aria-label="Brightness (locked)" />
    </div>
  );
}
