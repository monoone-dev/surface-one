import { SoneLineChart, type SoneLineChartSeries } from "@surface-one/react";

const VISITORS = [
  { month: "Jan", desktop: 186, mobile: 80 },
  { month: "Feb", desktop: 305, mobile: 200 },
  { month: "Mar", desktop: 237, mobile: 120 },
  { month: "Apr", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "Jun", desktop: 214, mobile: 140 },
];

const SERIES: SoneLineChartSeries[] = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
];

export default function LineChartDemo() {
  return (
    <div className="demo-stack" style={{ paddingTop: "var(--space-4)" }}>
      <SoneLineChart
        data={VISITORS}
        series={SERIES}
        xKey="month"
        curve="smooth"
        ariaLabel="Visitors, January to June 2026"
        categoryHeader="Month"
      />
    </div>
  );
}
