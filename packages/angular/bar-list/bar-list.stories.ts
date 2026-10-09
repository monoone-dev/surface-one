import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneBadgeDirective } from "@surface-one/angular/badge";
import {
  SONE_BAR_LIST_PARTS,
  SoneBarListComponent,
  type SoneBarListItem,
} from "./bar-list.component";

const MODELS: SoneBarListItem[] = [
  { key: "sonnet", label: "claude-sonnet-4-5", value: 182_400 },
  { key: "haiku", label: "claude-haiku-4-5", value: 64_200 },
  { key: "llama", label: "llama3.1:8b (local Ollama)", value: 21_050 },
  { key: "gemma", label: "gemma-3-12b", value: 0 },
];

const tokens = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);

const meta: Meta<SoneBarListComponent> = {
  title: "Components/Charts/Bar list",
  component: SoneBarListComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneBadgeDirective] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-bar-list>` — a ranked list of labelled horizontal bars with the value written next to " +
          "each. A real `<ul>`: every row reads as “label value”; the bar is `aria-hidden` decoration, so " +
          'nothing is said twice. `scale="max"` (default) draws the largest value full, `scale="total"` ' +
          "draws each row as its share of the sum, `max` pins a fixed full bar (a quota). `tone` per item: " +
          "`accent` | `success` | `warning` | `danger` | `chart-1`…`chart-8`. Replace a label with " +
          "`<ng-template soneBarListLabel let-item>` (a badge, a link). The fill grows in with " +
          "`transform: scaleX` once and honours reduced motion.\n\n" +
          "**Reference**\n" +
          "- shadcn/ui charts — [https://ui.shadcn.com/charts/bar](https://ui.shadcn.com/charts/bar)\n" +
          "- spartan/ui progress (the track) — [https://spartan.ng/components/progress](https://spartan.ng/components/progress)\n" +
          "- Tremor BarList (the anatomy) — [https://tremor.so/docs/visualizations/bar-list](https://tremor.so/docs/visualizations/bar-list)",
      },
    },
  },
  argTypes: {
    scale: { control: "inline-radio", options: ["max", "total"] },
    max: { control: "number" },
    ariaLabel: { control: "text" },
  },
  args: { items: MODELS, scale: "max", ariaLabel: "Tokens by model" },
  render: (args) => ({
    props: { ...args, tokens },
    template: `<div style="max-width: 420px"><sone-bar-list [items]="items" [scale]="scale" [max]="max" [valueFormat]="tokens" [ariaLabel]="ariaLabel" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneBarListComponent>;

export const Default: Story = {};

export const ShareOfTotal: Story = { args: { scale: "total" } };

export const FixedMax: Story = {
  args: { max: 250_000, ariaLabel: "Tokens against a 250k quota" },
};

export const Empty: Story = { args: { items: [], ariaLabel: "No data" } };

export const Tones: Story = {
  render: () => ({
    props: {
      items: [
        { key: "a", label: "Accent", value: 9, tone: "accent" },
        { key: "s", label: "Success", value: 7, tone: "success" },
        { key: "w", label: "Warning", value: 5, tone: "warning" },
        { key: "d", label: "Danger", value: 3, tone: "danger" },
        { key: "1", label: "chart-1", value: 8, tone: "chart-1" },
        { key: "2", label: "chart-2", value: 6, tone: "chart-2" },
        { key: "3", label: "chart-3", value: 4, tone: "chart-3" },
        { key: "4", label: "chart-4", value: 2, tone: "chart-4" },
      ] satisfies SoneBarListItem[],
    },
    template: `<div style="max-width: 420px"><sone-bar-list [items]="items" ariaLabel="Tones" /></div>`,
  }),
};

export const BadgeLabels: Story = {
  decorators: [moduleMetadata({ imports: [SONE_BAR_LIST_PARTS] })],
  render: () => ({
    props: {
      items: [
        {
          key: "SUMMARIZED",
          label: "Summarized",
          value: 42,
          tone: "accent",
          variant: "accent",
        },
        {
          key: "EXPORTED",
          label: "Exported",
          value: 31,
          tone: "success",
          variant: "success",
        },
        {
          key: "DRAFT",
          label: "Draft",
          value: 6,
          tone: "accent",
          variant: "outline",
        },
        {
          key: "ERROR",
          label: "Error",
          value: 2,
          tone: "danger",
          variant: "destructive",
        },
      ],
    },
    template: `
      <div style="max-width: 420px">
        <sone-bar-list [items]="items" ariaLabel="Meetings by status">
          <ng-template soneBarListLabel [soneBarListLabelOf]="items" let-item>
            <span soneBadge [variant]="item.variant">{{ item.label }}</span>
          </ng-template>
        </sone-bar-list>
      </div>`,
  }),
};
