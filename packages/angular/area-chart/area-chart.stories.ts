import type { Meta, StoryObj } from "@storybook/angular";

import type { SoneLineChartSeries } from "@surface-one/angular/line-chart";
import { SoneAreaChartComponent } from "./area-chart.component";

interface Month {
  readonly month: string;
  readonly desktop: number;
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
  { key: "mobile", label: "Mobile", tone: "chart-2" },
  { key: "desktop", label: "Desktop", tone: "chart-1" },
];

const short = (x: unknown): string => String(x).slice(0, 3);

const meta: Meta<SoneAreaChartComponent<Month>> = {
  title: "Components/Charts/Area chart",
  component: SoneAreaChartComponent,
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
          "`<sone-area-chart>` — the shadcn/ui Area Chart: a `<sone-line-chart area>` with the same " +
          "inputs (`data`, `series`, `xKey`, `xScale`, `curve`, `yMin` / `yMax`, …), so the same axis, " +
          "legend, tooltip, roving focus and hidden data table. Each area fills down to zero; " +
          "`stacked` piles the series, each filling down to the one below (a missing value adds " +
          "nothing). Dots are off by default (`dots` turns them on).\n\n" +
          "**Reference**\n\n" +
          "- shadcn/ui — [https://ui.shadcn.com/charts/area](https://ui.shadcn.com/charts/area)",
      },
    },
  },
};
export default meta;

type Story = StoryObj<SoneAreaChartComponent<Month>>;

export const Areas: Story = {};

export const Stacked: Story = { args: { stacked: true, curve: "smooth" } };

export const OneSeries: Story = {
  args: { series: [SERIES[1]], legend: false, curve: "smooth" },
};
