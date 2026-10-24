import { type Meta, type StoryObj } from "@storybook/angular";

import { SoneCalendarComponent } from "./calendar.component";

const meta: Meta<SoneCalendarComponent> = {
  title: "Components/Forms/Calendar",
  component: SoneCalendarComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-calendar>` — spartan/ui and shadcn/ui Calendar: a month grid to pick one date " +
          '(`mode="single"`), a range (`mode="range"`, value `{ start, end }`) or several dates ' +
          '(`mode="multiple"`, a list). Values are ISO strings ("YYYY-MM-DD") — `[(value)]` or a ' +
          'form control — and `[(month)]` ("YYYY-MM") is the month on show.\n\n' +
          "The grid is the WAI-ARIA date picker grid: one Tab stop, the arrow keys move a day or a " +
          "week, Home / End go to the week's ends, PageUp / PageDown a month and Shift + PageUp / " +
          "PageDown a year; Enter or Space picks. `min`, `max` and `disabledDate` refuse days " +
          "(still reachable, announced as disabled), `weekStartsOn` (0 = Sunday) orders the " +
          "week and `locale` names the months and weekdays through `Intl`. Today is read after " +
          "the first render (or passed as `today`), so prerendered pages hydrate cleanly. The date " +
          "math is Angular-free (`calendar-grid.ts`) and shared with the Vue, React and React " +
          "Native twins." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/calendar](https://spartan.ng/components/calendar)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/calendar](https://ui.shadcn.com/docs/components/calendar)",
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range", "multiple"] },
    weekStartsOn: { control: "inline-radio", options: [0, 1, 6] },
    locale: { control: "text" },
    disabled: { control: "boolean" },
    showOutsideDays: { control: "boolean" },
    valueChange: { action: "valueChange" },
  },
  args: {
    mode: "single",
    value: "2026-10-14",
    today: "2026-10-24",
    weekStartsOn: 1,
    locale: "en-US",
    disabled: false,
    showOutsideDays: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <sone-calendar
        [mode]="mode"
        [(value)]="value"
        [today]="today"
        [weekStartsOn]="weekStartsOn"
        [locale]="locale"
        [disabled]="disabled"
        [showOutsideDays]="showOutsideDays"
        (valueChange)="valueChange($event)"
        style="border: var(--border-width-thin) solid var(--border); border-radius: var(--radius-lg)"
      />`,
  }),
};
export default meta;
type Story = StoryObj<SoneCalendarComponent>;

export const Single: Story = {};

export const Range: Story = {
  args: { mode: "range", value: { start: "2026-10-12", end: "2026-10-16" } },
};

export const Multiple: Story = {
  args: { mode: "multiple", value: ["2026-10-02", "2026-10-09", "2026-10-23"] },
};

export const MinMaxAndWeekends: Story = {
  render: () => ({
    props: {
      value: null,
      weekend: (iso: string) => [0, 6].includes(new Date(iso).getUTCDay()),
    },
    template: `
      <sone-calendar
        [(value)]="value"
        today="2026-10-24"
        min="2026-10-05"
        max="2026-11-20"
        [disabledDate]="weekend"
        [weekStartsOn]="1"
        locale="en-US"
      />`,
  }),
};

export const Localized: Story = {
  args: { locale: "pl-PL", weekStartsOn: 1 },
};

export const Disabled: Story = { args: { disabled: true } };
