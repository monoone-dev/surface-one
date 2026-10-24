import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

import { SoneDatePickerComponent } from "./date-picker.component";

const meta: Meta<SoneDatePickerComponent> = {
  title: "Components/Forms/Date Picker",
  component: SoneDatePickerComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule, ...SONE_FIELD_PARTS] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-date-picker>` — shadcn/ui Date Picker: an outline button showing the date that " +
          "opens a `sone-calendar` in a popover (`sonePopoverTrigger`). `[(value)]` is " +
          '"YYYY-MM-DD", or `{ start, end }` with `mode="range"`; it is also a form control. ' +
          "The date is shown through `Intl` in `locale` (`formatOptions`, a long date by " +
          "default), `placeholder` stands in while none is picked, and `min`, `max`, " +
          "`disabledDate` and `weekStartsOn` go to the calendar. The popover opens on the " +
          "picked day (or today), closes on a pick — a whole range — or Escape and gives focus " +
          "back to the button (`closeOnSelect`, `[(open)]`). The button is named by its " +
          "`<label for>` (`triggerId`) and the date together, or by `ariaLabel`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/date-picker](https://spartan.ng/components/date-picker)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/date-picker](https://ui.shadcn.com/docs/components/date-picker)",
      },
    },
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["single", "range"] },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    locale: { control: "text" },
    valueChange: { action: "valueChange" },
  },
  args: {
    mode: "single",
    value: "2026-10-14",
    disabled: false,
    invalid: false,
    locale: "en-US",
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="min-height: 24rem">
        <sone-date-picker
          [mode]="mode"
          [(value)]="value"
          [disabled]="disabled"
          [invalid]="invalid"
          [locale]="locale"
          today="2026-10-24"
          ariaLabel="Due date"
          (valueChange)="valueChange($event)"
        />
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneDatePickerComponent>;

export const Default: Story = {};
export const Empty: Story = { args: { value: null } };
export const Range: Story = {
  args: { mode: "range", value: { start: "2026-10-12", end: "2026-10-16" } },
};
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { invalid: true } };

export const InAField: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { control: new FormControl<string | null>(null) },
    template: `
      <div soneField style="max-width: 20rem; min-height: 24rem">
        <label soneFieldLabel for="story-due">Due date</label>
        <sone-date-picker triggerId="story-due" [formControl]="control" min="2026-10-01" [weekStartsOn]="1" locale="en-GB" />
        <p soneFieldDescription>Picked: {{ control.value ?? "nothing yet" }}</p>
      </div>`,
  }),
};
