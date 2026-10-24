import { useState } from "react";
import { SoneAudioPlayer } from "@surface-one/react";

/** A tiny silent WAV inlined as a data URL, so the demo needs no audio file. */
const RECORDING =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=";
const RATES = [1, 1.5, 2];

export default function AudioPlayerDemo() {
  const [position, setPosition] = useState(0);
  return (
    <div className="demo-stack" style={{ maxWidth: 560, width: "100%" }}>
      <SoneAudioPlayer
        src={RECORDING}
        skipSeconds={15}
        rates={RATES}
        onTimeUpdate={setPosition}
      />
      <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)" }}>
        Position: {position.toFixed(1)} s
      </span>
    </div>
  );
}
