import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SoneChartLegendComponent,
  type SoneChartLegendItem,
} from "./chart-legend.component";
import { SoneSwatchDirective } from "./swatch.directive";

const KINDS: readonly SoneChartLegendItem[] = [
  { key: "meeting", label: "Meetings", tone: "graph-meeting", value: 128 },
  { key: "note", label: "Notes", tone: "graph-note", value: 342 },
  { key: "document", label: "Documents", tone: "graph-document", value: 37 },
  { key: "person", label: "People", tone: "graph-person", value: 1204 },
];

const meta: Meta<SoneChartLegendComponent> = {
  title: "Components/Data display/Chart Legend",
  component: SoneChartLegendComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneSwatchDirective] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-chart-legend>` — the key of a chart: a swatch, a label and an optional value per series " +
          "(`items: { key, label, tone?, value? }[]`, numbers formatted for `locale`). `orientation` `row` " +
          "(wrapping) or `column` (values aligned to the end). `toggleable` makes every item a toggle button " +
          "(`aria-pressed` = shown) that updates `[(hidden)]` and emits `(toggle)` with the key; a hidden " +
          "series is struck through, not only dimmed.\n\n" +
          "`span[soneSwatch]` is the colour key on its own: `tone` is a token suffix (`chart-3`, " +
          "`graph-note`, `success`), a custom property (`--brand`) or any CSS colour; `shape` `dot` / " +
          "`square` / `line`; size with `--swatch-size`. Always `aria-hidden` — pair it with text. A missing " +
          "`tone` falls back to `chart-<n>` by position.\n\n" +
          "**Reference**\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/chart](https://ui.shadcn.com/docs/components/chart) (ChartLegend)\n" +
          "- spartan/ui — [https://www.spartan.ng/components/toggle](https://www.spartan.ng/components/toggle) (the toggle pattern of a toggleable item)",
      },
    },
  },
  args: { items: [...KINDS], orientation: "row", toggleable: false },
  argTypes: {
    orientation: { control: "inline-radio", options: ["row", "column"] },
    shape: { control: "inline-radio", options: ["dot", "square", "line"] },
  },
};
export default meta;
type Story = StoryObj<SoneChartLegendComponent>;

export const Row: Story = {};

export const Column: Story = {
  args: { orientation: "column" },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 16rem"><sone-chart-legend [items]="items" orientation="column" /></div>`,
  }),
};

export const Toggleable: Story = {
  render: () => ({
    props: { items: [...KINDS], hidden: ["document"] },
    template: `
      <sone-chart-legend [items]="items" toggleable [(hidden)]="hidden" ariaLabel="Node kinds" />
      <p style="margin-top: var(--space-3); color: var(--text-secondary); font-size: var(--font-size-sm)">
        hidden: {{ hidden.join(", ") || "none" }}
      </p>`,
  }),
};

export const DefaultTones: Story = {
  args: {
    items: Array.from({ length: 8 }, (_, i) => ({
      key: `s${i + 1}`,
      label: `--chart-${i + 1}`,
    })),
  },
};

export const Swatches: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-3); font-size: var(--font-size-sm)">
        <span style="display: inline-flex; gap: var(--space-2); align-items: center">
          <span soneSwatch tone="chart-1"></span> dot
          <span soneSwatch tone="chart-3" shape="square"></span> square
          <span soneSwatch tone="chart-4" shape="line"></span> line
        </span>
        <span style="display: inline-flex; gap: var(--space-2); align-items: center">
          <span soneSwatch tone="graph-note"></span> graph-note
          <span soneSwatch tone="--success"></span> --success
          <span soneSwatch tone="var(--warning)"></span> var(--warning)
          <span soneSwatch style="--swatch-size: 12px" tone="chart-6"></span> 12px
        </span>
      </div>`,
  }),
};
