import { SoneDonutChart, type SoneDonutChartSegment } from "@surface-one/react";

const BROWSERS: SoneDonutChartSegment[] = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 187 },
  { key: "edge", label: "Edge", value: 173 },
  { key: "other", label: "Other", value: 90 },
];

export default function DonutChartDemo() {
  return (
    <div className="demo-stack" style={{ alignItems: "center" }}>
      <SoneDonutChart
        segments={BROWSERS}
        label="Visitors"
        ariaLabel="Visitors by browser, January to June 2026"
        categoryHeader="Browser"
        valueHeader="Visitors"
      />
    </div>
  );
}
