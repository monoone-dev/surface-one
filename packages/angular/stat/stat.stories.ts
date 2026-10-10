import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_STAT_PARTS } from "./stat-parts";

const meta: Meta = {
  title: "Components/Data display/Stat",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_STAT_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`dl[soneStatGroup]` + `[soneStat]` — key figures (KPI tiles). Each `<div soneStat>` groups a " +
          "`dt[soneStatLabel]` with a `dd[soneStatValue]` (tabular monospaced numerals) and optional " +
          "`dd[soneStatHint]` / `dd[soneStatTrend]`, so screen readers pair every label with its value. " +
          "Group: `layout` `grid` (auto-fit ~10rem tracks, or a fixed `columns`) or `inline` (a wrapping row), " +
          "`separated` (a joined panel with hairlines in `grid`, rules in `inline`). Stat: `variant` " +
          "`card` (the card surface) / `inset` (a sunken tile) / `plain`; `size` `sm` / `md` / `lg`; " +
          "`labelPosition` `bottom` moves the label under the value visually while the DOM keeps `dt` first. " +
          'Trend: `delta`\'s sign draws an up / down arrow and, with `tone="auto"`, colours it ' +
          "(up = positive); screen readers hear the direction before the projected text (“up 12%”). " +
          "Entry animation staggers by `--i` and stops under reduced motion.\n\n" +
          "**Reference**\n" +
          "- shadcn/ui — [https://ui.shadcn.com/blocks](https://ui.shadcn.com/blocks) (dashboard-01 section cards)\n" +
          "- spartan/ui — [https://www.spartan.ng/components/card](https://www.spartan.ng/components/card) (the card surface it reuses)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Cards: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup style="max-width: 56rem">
        <div soneStat style="--i: 0">
          <dt soneStatLabel>Meetings</dt>
          <dd soneStatValue>128</dd>
          <dd soneStatHint>Since March</dd>
        </div>
        <div soneStat style="--i: 1">
          <dt soneStatLabel>Total time</dt>
          <dd soneStatValue>41h 12m</dd>
          <dd soneStatHint>About 19 min a meeting</dd>
        </div>
        <div soneStat style="--i: 2">
          <dt soneStatLabel>This week</dt>
          <dd soneStatValue>9</dd>
          <dd soneStatTrend [delta]="3">50%</dd>
        </div>
        <div soneStat style="--i: 3">
          <dt soneStatLabel>Notes</dt>
          <dd soneStatValue>342</dd>
        </div>
      </dl>`,
  }),
};

export const Trends: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup [columns]="4" style="max-width: 56rem">
        <div soneStat>
          <dt soneStatLabel>Up</dt>
          <dd soneStatValue>1,204</dd>
          <dd soneStatTrend [delta]="0.12">12%</dd>
        </div>
        <div soneStat>
          <dt soneStatLabel>Down</dt>
          <dd soneStatValue>87</dd>
          <dd soneStatTrend [delta]="-0.03">3%</dd>
        </div>
        <div soneStat>
          <dt soneStatLabel>Unchanged</dt>
          <dd soneStatValue>12</dd>
          <dd soneStatTrend [delta]="0">0%</dd>
        </div>
        <div soneStat>
          <dt soneStatLabel>Cloud calls (up is bad)</dt>
          <dd soneStatValue>56</dd>
          <dd soneStatTrend [delta]="8" tone="negative">8</dd>
        </div>
      </dl>`,
  }),
};

export const InlineSeparated: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup layout="inline" separated aria-label="Your stats">
        <div soneStat variant="plain" size="sm" style="--i: 0">
          <dt soneStatLabel>Meetings</dt>
          <dd soneStatValue>128</dd>
        </div>
        <div soneStat variant="plain" size="sm" style="--i: 1">
          <dt soneStatLabel>Total time</dt>
          <dd soneStatValue>41h 12m</dd>
        </div>
        <div soneStat variant="plain" size="sm" style="--i: 2">
          <dt soneStatLabel>This week</dt>
          <dd soneStatValue>9</dd>
        </div>
      </dl>`,
  }),
};

export const SeparatedGrid: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup separated [columns]="3" style="max-width: 44rem">
        <div soneStat>
          <dt soneStatLabel>Cloud calls</dt>
          <dd soneStatValue>56</dd>
        </div>
        <div soneStat>
          <dt soneStatLabel>Tokens sent</dt>
          <dd soneStatValue>48.2k</dd>
          <dd soneStatHint>Roughly ¾ of a word each</dd>
        </div>
        <div soneStat>
          <dt soneStatLabel>Emails, phones and cards removed</dt>
          <dd soneStatValue>14</dd>
          <dd soneStatHint>2 names masked too</dd>
        </div>
      </dl>`,
  }),
};

export const Inset: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup style="max-width: 40rem">
        <div soneStat variant="inset" size="sm">
          <dt soneStatLabel>Readable sources</dt>
          <dd soneStatValue>24</dd>
        </div>
        <div soneStat variant="inset" size="sm">
          <dt soneStatLabel>Derived views</dt>
          <dd soneStatValue>6</dd>
        </div>
        <div soneStat variant="inset" size="sm">
          <dt soneStatLabel>People</dt>
          <dd soneStatValue>11</dd>
        </div>
        <div soneStat variant="inset" size="sm">
          <dt soneStatLabel>Open items</dt>
          <dd soneStatValue>3</dd>
        </div>
      </dl>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup [columns]="3" style="max-width: 48rem">
        <div soneStat size="sm"><dt soneStatLabel>Small</dt><dd soneStatValue>42</dd><dd soneStatHint>sm</dd></div>
        <div soneStat size="md"><dt soneStatLabel>Medium</dt><dd soneStatValue>42</dd><dd soneStatHint>md (default)</dd></div>
        <div soneStat size="lg"><dt soneStatLabel>Large</dt><dd soneStatValue>42</dd><dd soneStatHint>lg</dd></div>
      </dl>`,
  }),
};

export const LabelBelow: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup layout="inline" aria-label="What’s in your Ivy">
        <div soneStat variant="plain" labelPosition="bottom"><dt soneStatLabel>Meetings</dt><dd soneStatValue>128</dd></div>
        <div soneStat variant="plain" labelPosition="bottom"><dt soneStatLabel>Documents</dt><dd soneStatValue>37</dd></div>
        <div soneStat variant="plain" labelPosition="bottom"><dt soneStatLabel>Notes</dt><dd soneStatValue>342</dd></div>
      </dl>`,
  }),
};

export const Centered: Story = {
  render: () => ({
    template: `
      <dl soneStatGroup layout="inline" aria-label="Briefs" style="justify-content: center">
        <div soneStat variant="plain" align="center" labelPosition="bottom"><dt soneStatLabel>Briefs</dt><dd soneStatValue>8</dd></div>
        <div soneStat variant="plain" align="center" labelPosition="bottom"><dt soneStatLabel>Open tasks</dt><dd soneStatValue>21</dd></div>
      </dl>`,
  }),
};
