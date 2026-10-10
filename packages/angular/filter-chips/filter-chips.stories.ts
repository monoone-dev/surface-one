import { signal } from "@angular/core";
import { type Meta, type StoryObj } from "@storybook/angular";

import {
  type FilterChipOption,
  SoneFilterChipsComponent,
} from "./filter-chips.component";

const LEVELS: readonly FilterChipOption[] = [
  { value: "all", label: "All", count: 128 },
  { value: "error", label: "Errors", count: 3, tone: "danger" },
  { value: "warn", label: "Warnings", count: 11, tone: "warning" },
  { value: "info", label: "Info", count: 114 },
];

const meta: Meta<SoneFilterChipsComponent> = {
  title: "Components/Forms/Filter Chips",
  component: SoneFilterChipsComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-filter-chips>` — one-of-many filter buttons from data: `options` " +
          "(`{ value, label, count?, tone?, disabled? }`), `[(value)]`, `ariaLabel` for the group. " +
          '`variant="toggle"` draws an outline Toggle Group of separate chips (`size` `sm` | `default`); ' +
          '`variant="tabs"` a Tabs list. Every option is a toggle button (`aria-pressed`) with arrow-key, Home ' +
          "and End navigation; `count` shows in a badge tinted by `tone` (`default` | `danger` | `warning` | " +
          "`success` | `accent`)." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/toggle-group](https://spartan.ng/components/toggle-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/toggle-group](https://ui.shadcn.com/docs/components/toggle-group)",
      },
    },
  },
};
export default meta;
type Story = StoryObj<SoneFilterChipsComponent>;

export const Toggle: Story = {
  render: () => {
    const value = signal("all");
    return {
      props: { value, options: LEVELS },
      template: `<sone-filter-chips [options]="options" [(value)]="value" ariaLabel="Filter by level" />`,
    };
  },
};

export const Tabs: Story = {
  render: () => {
    const value = signal("inbox");
    return {
      props: {
        value,
        options: [
          { value: "inbox", label: "Inbox", count: 4 },
          { value: "upcoming", label: "Upcoming" },
          { value: "done", label: "Done" },
        ],
      },
      template: `<sone-filter-chips variant="tabs" [options]="options" [(value)]="value" ariaLabel="Reminder views" />`,
    };
  },
};
