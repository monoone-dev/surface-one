import type { Meta, StoryObj } from "@storybook/angular";

import { SoneSparklineComponent } from "./sparkline.component";

const MEETINGS = [
  0, 1, 0, 2, 3, 1, 0, 0, 2, 4, 3, 1, 0, 0, 1, 2, 5, 3, 2, 0, 0, 1, 3, 4, 2, 1,
  0, 0, 2, 3,
];

const meta: Meta<SoneSparklineComponent> = {
  title: "Components/Charts/Sparkline",
  component: SoneSparklineComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-sparkline>` — a word-sized chart without axes, drawn in ONE stretched " +
          '`<svg viewBox="0 0 100 100" preserveAspectRatio="none">`: a single path per series, ' +
          "`vector-effect: non-scaling-stroke` keeps the line crisp at any size, the area is " +
          "`currentColor` at low opacity, and there are no `<defs>` or ids (safe to repeat on a page). " +
          "`type`: `line` | `area` | `bar` | `heat` (equal cells on the `--chart-seq-1…5` ramp). " +
          "The scale is `min` (0) to `max` (default `niceCeiling(values, 4)`, so a quiet month does not " +
          "draw one meeting full-height). `tone` sets the colour; the size follows the host (`width: 100%`, " +
          "height `--sone-sparkline-h`, default `--space-6`).\n\n" +
          'Decorative by default (`aria-hidden="true"`) — put it next to the number it illustrates. ' +
          'With `[decorative]="false"` it becomes `role="img"` named by `summary` or a generated ' +
          "“30 values, peak 5, total 50”.\n\n" +
          "**Reference**\n" +
          "- shadcn/ui charts — [https://ui.shadcn.com/charts/area](https://ui.shadcn.com/charts/area)\n" +
          "- spartan/ui — no chart primitive; this follows the shadcn look on plain SVG.",
      },
    },
  },
  argTypes: {
    type: {
      control: "inline-radio",
      options: ["line", "area", "bar", "heat"],
    },
    tone: {
      control: "select",
      options: [
        "accent",
        "success",
        "warning",
        "danger",
        "chart-1",
        "chart-2",
        "chart-3",
        "chart-4",
        "chart-5",
        "chart-6",
        "chart-7",
        "chart-8",
      ],
    },
    min: { control: "number" },
    max: { control: "number" },
    decorative: { control: "boolean" },
    summary: { control: "text" },
  },
  args: { values: MEETINGS, type: "line", tone: "accent", decorative: true },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 240px"><sone-sparkline [values]="values" [type]="type" [tone]="tone" [min]="min ?? 0" [max]="max" [decorative]="decorative" [summary]="summary" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneSparklineComponent>;

export const Line: Story = {};
export const Area: Story = { args: { type: "area", tone: "chart-2" } };
export const Bar: Story = { args: { type: "bar" } };
export const Heat: Story = { args: { type: "heat" } };
export const Empty: Story = { args: { values: [] } };
export const SingleValue: Story = { args: { values: [3] } };
export const FixedScale: Story = { args: { type: "bar", max: 20 } };
export const Labelled: Story = {
  args: {
    type: "area",
    decorative: false,
    summary: "Meetings per day, last 30 days: peak 5",
  },
};

export const Inline: Story = {
  render: () => ({
    props: { values: MEETINGS },
    template: `
      <dl style="display: grid; grid-template-columns: auto 8rem; gap: var(--space-2) var(--space-4); align-items: center; max-width: 320px; --sone-sparkline-h: var(--space-5)">
        <dt>Meetings</dt><dd style="margin: 0"><sone-sparkline [values]="values" type="bar" /></dd>
        <dt>Talk time</dt><dd style="margin: 0"><sone-sparkline [values]="values" type="area" tone="chart-3" /></dd>
        <dt>Streak</dt><dd style="margin: 0"><sone-sparkline [values]="values" type="heat" /></dd>
      </dl>`,
  }),
};
