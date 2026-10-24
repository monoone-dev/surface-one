import { useState } from "react";
import { SoneTimeline, type TimelineData, type TimelineLaneSuggestion } from "@surface-one/react";

const data: TimelineData = {
  blocks: [
    { lane: "Ada Park", startS: 0, endS: 95 },
    { lane: "others-1", startS: 95, endS: 260 },
    { lane: "Ada Park", startS: 260, endS: 310 },
    { lane: "Leo Ruiz", startS: 310, endS: 520 },
    { lane: "others-1", startS: 520, endS: 610 },
    { lane: "Ada Park", startS: 610, endS: 720 },
  ],
  chapters: [
    { label: "Intro", startS: 0, endS: 60 },
    { label: "Launch checklist", startS: 60, endS: 330 },
    { label: "Pricing page", startS: 330, endS: 560 },
    { label: "Next steps", startS: 560, endS: 720 },
  ],
};

// Unnamed lanes ("others-1") can be renamed from the legend; these are offered.
const suggestions: TimelineLaneSuggestion[] = [{ lane: "others-1", label: "Mia Chen" }];

export default function TimelineDemo() {
  const [currentTime, setCurrentTime] = useState(290);
  return (
    <div className="demo-stack" style={{ maxWidth: 760, width: "100%" }}>
      <SoneTimeline data={data} total={720} currentTime={currentTime} suggestions={suggestions} onSeek={setCurrentTime} />
      <span style={{ color: "var(--text-secondary)", fontSize: "var(--font-size-sm)" }}>
        Playhead at {currentTime} s — click a block or chapter to seek.
      </span>
    </div>
  );
}
