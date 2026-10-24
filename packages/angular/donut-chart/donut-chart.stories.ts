import type { Meta, StoryObj } from "@storybook/angular";

import {
  SoneDonutChartComponent,
  type SoneDonutChartSegment,
} from "./donut-chart.component";

const BROWSERS: SoneDonutChartSegment[] = [
  { key: "chrome", label: "Chrome", value: 275 },
  { key: "safari", label: "Safari", value: 200 },
  { key: "firefox", label: "Firefox", value: 187 },
  { key: "edge", label: "Edge", value: 173 },
  { key: "other", label: "Other", value: 90 },
];

const meta: Meta<SoneDonutChartComponent> = {
  title: "Components/Charts/Donut chart",
  component: SoneDonutChartComponent,
  tags: ["autodocs"],
  args: {
    segments: BROWSERS,
    label: "Visitors",
    ariaLabel: "Visitors by browser",
  },
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-donut-chart>` — the shadcn/ui Pie Chart “donut with text”: `segments` " +
          "(`{ key, label, value, tone }`) clockwise from 12 o'clock in the categorical " +
          "`--chart-1…8` colours, the total in the centre (or `centerValue`, captioned by " +
          "`label`) and a legend with the values. Hovering or focusing a segment dims the others " +
          "and writes its value in the centre. `thickness` is the ring's width as a part of the " +
          "radius (1 draws a pie, without the centre text); `padAngle` the gap between segments.\n\n" +
          "**Keyboard** — ONE Tab stop with a roving focus around the ring (arrow keys wrap, " +
          'Home/End; Escape returns the centre to the total). Each segment is `role="img"` named ' +
          "“Chrome: 275 (30%)”, and a visually hidden table carries the data. Motion stops under " +
          "`prefers-reduced-motion`.\n\n" +
          "**Reference**\n\n" +
          "- shadcn/ui — [https://ui.shadcn.com/charts/pie](https://ui.shadcn.com/charts/pie)",
      },
    },
  },
};
export default meta;

type Story = StoryObj<SoneDonutChartComponent>;

export const Donut: Story = {};

export const Thin: Story = { args: { thickness: 0.15, size: 160 } };

export const Pie: Story = { args: { thickness: 1 } };

export const NoLegend: Story = { args: { legend: false, centerValue: "925" } };
