import { useState } from "react";
import {
  SoneField,
  SoneFieldLabel,
  SoneLevelMeter,
  SoneMicToggle,
  SoneProcessingStatus,
  SoneRecordButton,
  SoneRecordingIndicator,
  SoneStatusOrb,
} from "@surface-one/react";

/** Recent input levels, oldest first — a recorder would push one per tick. */
const HISTORY = Array.from(
  { length: 24 },
  (_, i) => 0.5 + 0.45 * Math.sin(i / 2.3) * Math.cos(i / 5.1),
);

export default function RecordingDemo() {
  const [recording, setRecording] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [level, setLevel] = useState(0.45);
  const seconds = 754;
  /** The meter only moves while recording, unmuted and not paused. */
  const meterLevel = recording && !muted && !paused ? level : 0;

  return (
    <div className="demo-stack" style={{ maxWidth: 360, width: "100%" }}>
      <div className="demo-row">
        <SoneRecordButton
          type="button"
          state={recording ? "recording" : "idle"}
          aria-label={recording ? "Stop recording" : "Start recording"}
          onClick={() => setRecording(!recording)}
        />
        <SoneMicToggle muted={muted} disabled={!recording} onMuteToggle={() => setMuted(!muted)} />
        <SoneRecordButton
          withLabel
          size="sm"
          type="button"
          state={paused ? "paused" : "recording"}
          disabled={!recording}
          onClick={() => setPaused(!paused)}
        >
          {paused ? "Resume" : "Pause"}
        </SoneRecordButton>
      </div>
      {recording ? (
        <SoneRecordingIndicator
          seconds={seconds}
          state={paused ? "paused" : "live"}
          label={paused ? "Paused" : muted ? "Recording · muted" : "Recording"}
        />
      ) : (
        <div className="demo-row">
          <SoneStatusOrb state="ready" />
          <span>Ready</span>
        </div>
      )}
      <SoneField>
        <SoneFieldLabel htmlFor="recording-demo-level">Simulated input level</SoneFieldLabel>
        <input
          id="recording-demo-level"
          style={{ accentColor: "var(--accent)" }}
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={level}
          onChange={(e) => setLevel(e.currentTarget.valueAsNumber)}
        />
      </SoneField>
      <SoneLevelMeter level={meterLevel} />
      <SoneLevelMeter bars={24} history={HISTORY} />
      <div className="demo-row" style={{ alignItems: "center" }}>
        <SoneStatusOrb state="paused" /><span>Paused</span>
        <SoneStatusOrb state="queued" /><span>Queued</span>
        <SoneStatusOrb state="error" /><span>Failed</span>
      </div>
      <SoneProcessingStatus stage="summarizing" progress={0.42} />
      <SoneProcessingStatus stage="error" size="sm" />
    </div>
  );
}
