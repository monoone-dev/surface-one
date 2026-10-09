import type { Meta, StoryObj } from "@storybook/angular";

import { fillDaySeries, localIsoDate } from "@surface-one/angular/chart-utils";
import {
  SoneBarChartComponent,
  type SoneBarChartDatum,
} from "./bar-chart.component";

const COUNTS = [
  0, 1, 0, 2, 3, 1, 0, 0, 2, 4, 3, 1, 0, 0, 1, 2, 5, 3, 2, 0, 0, 1, 3, 4, 2, 1,
  0, 0, 2, 3,
];
const TODAY = new Date(2026, 9, 9);

/** 30 gap-filled days, as an app builds them from sparse rows. */
const DAYS: SoneBarChartDatum[] = fillDaySeries(
  COUNTS.map((value, i) => ({
    key: localIsoDate(new Date(2026, 8, 10 + i)),
    date: localIsoDate(new Date(2026, 8, 10 + i)),
    value,
  })).filter((d) => d.value > 0),
  30,
  {
    today: TODAY,
    empty: (date) => ({ key: date, date, value: 0 }),
  },
).map(({ key, value }) => {
  const [y, m, d] = key.split("-").map(Number);
  return {
    key,
    value,
    label: new Date(y, m - 1, d).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
    }),
  };
});

const tick = (d: SoneBarChartDatum, i: number): string | null =>
  (DAYS.length - 1 - i) % 7 === 0 ? (d.label ?? null) : null;
const tooltip = (d: SoneBarChartDatum): string =>
  `${d.label} · ${d.value === 1 ? "1 meeting" : `${d.value} meetings`}`;

const meta: Meta<SoneBarChartComponent> = {
  title: "Components/Charts/Bar chart",
  component: SoneBarChartComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-bar-chart>` — a column chart for a short series (one bar per day). Bars are HTML boxes " +
          "rather than a stretched SVG: crisp edges and true rounded corners at any width; tick labels " +
          "sit in HTML under the plot. The value axis tops out at `yMax` (default " +
          '`niceCeiling(values, 4)`); `zero="baseline"` keeps a flat stub for an empty day, ' +
          '`zero="gap"` leaves it blank.\n\n' +
          "**Keyboard** — the chart is ONE Tab stop with a roving focus (the APG pattern for a " +
          "composite that is not a selection, so no `listbox`): Left/Right move one bar, Home/End jump, " +
          "Escape hides the tooltip. The focus starts on the last bar (the newest day). Each bar is " +
          '`role="img"` named by its tooltip, so moving focus speaks it without a live region; the ' +
          "tooltip also shows on hover. A visually hidden `<table>` carries every value for " +
          "screen-reader browsing. Reduced motion drops the grow-in.\n\n" +
          "**Reference**\n" +
          "- shadcn/ui charts — [https://ui.shadcn.com/charts/bar](https://ui.shadcn.com/charts/bar)\n" +
          "- WAI-ARIA APG, roving tabindex — [https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)\n" +
          "- spartan/ui — no chart primitive; this follows the shadcn look.",
      },
    },
  },
  argTypes: {
    height: { control: { type: "range", min: 60, max: 240, step: 4 } },
    yMax: { control: "number" },
    zero: { control: "inline-radio", options: ["baseline", "gap"] },
    tone: {
      control: "select",
      options: ["accent", "success", "warning", "danger", "chart-1", "chart-2"],
    },
    ariaLabel: { control: "text" },
  },
  args: {
    data: DAYS,
    height: 132,
    zero: "baseline",
    tone: "accent",
    ariaLabel: "Meetings per day, last 30 days",
  },
  render: (args) => ({
    props: { ...args, tick, tooltip },
    template: `<div style="max-width: 560px; padding-top: var(--space-8)"><sone-bar-chart [data]="data" [height]="height" [yMax]="yMax" [zero]="zero" [tone]="tone" [ariaLabel]="ariaLabel" [tick]="tick" [tooltip]="tooltip" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneBarChartComponent>;

export const Default: Story = {};
export const ZeroGap: Story = { args: { zero: "gap" } };
export const FixedScale: Story = { args: { yMax: 10, tone: "chart-2" } };
export const Empty: Story = { args: { data: [], ariaLabel: "No meetings" } };
export const AllZero: Story = {
  args: { data: DAYS.map((d) => ({ ...d, value: 0 })) },
};

export const WithoutTicks: Story = {
  render: () => ({
    props: { data: DAYS.slice(-7) },
    template: `<div style="max-width: 320px; padding-top: var(--space-8)"><sone-bar-chart [data]="data" [height]="80" ariaLabel="Meetings, last 7 days" /></div>`,
  }),
};
