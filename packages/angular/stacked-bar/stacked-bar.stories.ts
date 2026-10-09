import type { Meta, StoryObj } from "@storybook/angular";

import {
  SoneStackedBarComponent,
  type SoneStackedBarSegment,
} from "./stacked-bar.component";

const GB = 1024 ** 3;
const STORAGE: readonly SoneStackedBarSegment[] = [
  { key: "playback", label: "Playback", value: 4.2 * GB },
  { key: "masters", label: "Masters", value: 2.8 * GB },
  { key: "locked", label: "Locked", value: 0.6 * GB },
];
const gigabytes = (v: number) => `${(v / GB).toFixed(1)} GB`;

const meta: Meta<SoneStackedBarComponent> = {
  title: "Components/Data display/Stacked Bar",
  component: SoneStackedBarComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-stacked-bar>` — one bar split into the parts of a whole: `segments: { key, label, " +
          "value, tone? }[]` (tone defaults to `chart-<n>` by position; zero and negative values are " +
          "skipped). `max` above the sum leaves the rest as the empty track (the `<sone-progress>` " +
          'track); without it the parts fill the bar. The bar is `role="img"` with a generated, ' +
          "localized summary (“Storage: Playback 4.2 GB (55%), …; 7.6 GB of 20 GB”) starting with " +
          "`ariaLabel`; `valueLabel` formats values (bytes, durations), `locale` numbers and percentages. " +
          "`showLegend` adds a `<sone-chart-legend>` below. `size` `sm` / `md` / `lg`. Parts grow in with " +
          "`transform` only and stand still under reduced motion.\n\n" +
          "**Reference**\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/progress](https://ui.shadcn.com/docs/components/progress) (the track) and [chart](https://ui.shadcn.com/docs/components/chart) (stacked bars)\n" +
          "- spartan/ui — [https://www.spartan.ng/components/progress](https://www.spartan.ng/components/progress)",
      },
    },
  },
  args: {
    segments: [...STORAGE],
    max: 20 * GB,
    ariaLabel: "Recording storage",
    showLegend: true,
    size: "md",
    valueLabel: gigabytes,
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
};
export default meta;
type Story = StoryObj<SoneStackedBarComponent>;

export const WithMax: Story = {};

export const Full: Story = { args: { max: null } };

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: grid; gap: var(--space-4); max-width: 28rem">
        <sone-stacked-bar size="sm" [segments]="segments" [max]="max" [valueLabel]="valueLabel" ariaLabel="Small" />
        <sone-stacked-bar size="md" [segments]="segments" [max]="max" [valueLabel]="valueLabel" ariaLabel="Medium" />
        <sone-stacked-bar size="lg" [segments]="segments" [max]="max" [valueLabel]="valueLabel" ariaLabel="Large" />
      </div>`,
  }),
};

export const HealthCounts: Story = {
  args: {
    segments: [
      { key: "ok", label: "Working", value: 9, tone: "success" },
      { key: "attention", label: "Need attention", value: 2, tone: "warning" },
      { key: "optional", label: "Optional", value: 3, tone: "chart-seq-1" },
    ],
    max: null,
    ariaLabel: "Health checks",
    valueLabel: null,
  },
};

export const Empty: Story = {
  args: {
    segments: [],
    max: null,
    ariaLabel: "Recording storage",
    showLegend: false,
  },
};
