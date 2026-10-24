import type { Meta, StoryObj } from "@storybook/angular";

import {
  SoneLineChartComponent,
  type SoneLineChartSeries,
} from "./line-chart.component";

interface Month {
  readonly month: string;
  readonly desktop: number | null;
  readonly mobile: number;
}

const DATA: Month[] = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const SERIES: SoneLineChartSeries[] = [
  { key: "desktop", label: "Desktop" },
  { key: "mobile", label: "Mobile" },
];

const short = (x: unknown): string => String(x).slice(0, 3);

const meta: Meta<SoneLineChartComponent<Month>> = {
  title: "Components/Charts/Line chart",
  component: SoneLineChartComponent,
  tags: ["autodocs"],
  args: {
    data: DATA,
    series: SERIES,
    xKey: "month",
    xFormat: short,
    ariaLabel: "Visitors, January to June",
  },
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-line-chart>` — the shadcn/ui Line Chart without Recharts: `data` rows hold an x " +
          "value (`xKey`) and one value per series (`series: { key, label, tone }`). The x values are " +
          'categories (evenly spaced) or, with `xScale="time"`, dates spaced by their time. The value ' +
          "axis starts at 0 (or the lowest negative value) and ends on a round step; `yMin` / `yMax` " +
          'fix it. `curve="smooth"` draws a monotone curve that never overshoots a value; a `null` ' +
          "value breaks the line. Colours are the categorical `--chart-1…8` tokens (or a series " +
          "`tone`).\n\n" +
          "**Keyboard** — ONE Tab stop with a roving focus over the x values: Left/Right, Home/End, " +
          'Escape hides the tooltip. Each x value is `role="img"` named by its values ' +
          "(“Jan: Desktop 186, Mobile 80”), and a visually hidden table carries the data. Motion " +
          "stops under `prefers-reduced-motion`.\n\n" +
          "**Reference**\n\n" +
          "- shadcn/ui — [https://ui.shadcn.com/charts/line](https://ui.shadcn.com/charts/line)",
      },
    },
  },
};
export default meta;

type Story = StoryObj<SoneLineChartComponent<Month>>;

export const Lines: Story = {};

export const Smooth: Story = { args: { curve: "smooth", dots: false } };

export const OneSeries: Story = {
  args: { series: [SERIES[0]], legend: false },
};

export const Gap: Story = {
  args: {
    data: DATA.map((d, i) => (i === 3 ? { ...d, desktop: null } : d)),
  },
};

export const Time: Story = {
  args: {
    data: [
      { day: "2026-10-01", sessions: 12 },
      { day: "2026-10-02", sessions: 18 },
      { day: "2026-10-05", sessions: 9 },
      { day: "2026-10-06", sessions: 22 },
      { day: "2026-10-09", sessions: 15 },
    ] as unknown as Month[],
    series: [{ key: "sessions", label: "Sessions", tone: "chart-2" }],
    xKey: "day",
    xScale: "time",
    xFormat: null,
    legend: false,
  },
};
