import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneInputNumberComponent } from "./input-number.component";

const meta: Meta<SoneInputNumberComponent> = {
  title: "Components/Forms/Input Number",
  component: SoneInputNumberComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-input-number>` — a number field with − and + buttons (a quantity in a cart). The field is a " +
          "WAI-ARIA spinbutton: ↑ / ↓ step, Page Up / Page Down step × 10, Home / End jump to `min` / `max`; typed " +
          "text is parsed and clamped on blur or Enter, decimals follow `step`. A ControlValueAccessor of " +
          "`number | null`, or `[(value)]`. The buttons leave the Tab order — the keys do the same." +
          "\n\n**Reference**\n" +
          "- Nuxt UI — [InputNumber](https://ui.nuxt.com/docs/components/input-number)\n" +
          "- WAI-ARIA — [Spinbutton](https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/)",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default"] },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    value: 2,
    min: 1,
    max: 10,
    step: 1,
    size: "default",
    invalid: false,
    disabled: false,
    ariaLabel: "Quantity",
  },
};
export default meta;
type Story = StoryObj<SoneInputNumberComponent>;

export const Default: Story = {};

export const Small: Story = { args: { size: "sm" } };

export const Decimal: Story = {
  args: { value: 1.5, min: 0, max: null, step: 0.5, ariaLabel: "Weight (kg)" },
};

export const FormControlBinding: Story = {
  render: () => ({
    props: { control: new FormControl(3) },
    template: `<sone-input-number [formControl]="control" [min]="0" [max]="99" ariaLabel="Seats" />
      <p style="color: var(--text-tertiary); font-size: var(--font-size-xs)">Form value: {{ control.value }}</p>`,
  }),
};

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = { args: { disabled: true } };
