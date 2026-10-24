import {
  SoneMarker,
  SoneMarkerContent,
  SoneMarkerIcon,
  SoneSpinner,
} from "@surface-one/react";

export default function MarkerDemo() {
  return (
    <div className="demo-stack" style={{ maxWidth: 480, width: "100%" }}>
      <SoneMarker>
        <SoneMarkerIcon><SoneSpinner size={16} label={null} /></SoneMarkerIcon>
        <SoneMarkerContent className="shimmer">Thinking…</SoneMarkerContent>
      </SoneMarker>
      <SoneMarker>
        <SoneMarkerIcon>✓</SoneMarkerIcon>
        <SoneMarkerContent>Searched 4 meeting notes</SoneMarkerContent>
      </SoneMarker>
      <SoneMarker variant="separator">
        <SoneMarkerContent>Conversation compacted</SoneMarkerContent>
      </SoneMarker>
      <SoneMarker variant="border">
        <SoneMarkerContent>Earlier today</SoneMarkerContent>
      </SoneMarker>
    </div>
  );
}
