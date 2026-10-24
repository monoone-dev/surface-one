import { SoneLiveTranscript, type LiveTranscriptLine } from "@surface-one/react";

const LINES: LiveTranscriptLine[] = [
  {
    id: "l1",
    speaker: "Leo Ruiz",
    tone: "others",
    timeLabel: "0:04",
    final: true,
    text: "Morning! Can everyone see the roadmap doc?",
  },
  {
    id: "l2",
    speaker: "Ada Park",
    tone: "me",
    timeLabel: "0:09",
    final: true,
    text: "Yes — I'm on the Q3 tab.",
  },
  {
    id: "l3",
    speaker: "Leo Ruiz",
    tone: "others",
    timeLabel: "0:15",
    final: true,
    flag: "Possible question",
    text: "Should we move the beta invite to next sprint?",
  },
  // A non-final line is the in-progress partial result from speech-to-text.
  {
    id: "l4",
    speaker: "Ada Park",
    tone: "me",
    timeLabel: "0:21",
    final: false,
    text: "I think we can keep it if the copy lands by",
  },
];

export default function LiveTranscriptDemo() {
  return (
    <SoneLiveTranscript
      className="panel-card"
      style={{ height: 360, maxWidth: 380, width: "100%" }}
      lines={LINES}
      partialLabel="Listening…"
    />
  );
}
