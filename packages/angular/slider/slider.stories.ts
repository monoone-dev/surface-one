import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSliderComponent } from "./slider.component";

const meta: Meta<SoneSliderComponent> = {
  title: "Components/Forms/Slider",
  component: SoneSliderComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-slider>` — the range slider (spartan/ui Slider: track, accent RANGE up to " +
          "the value, round thumb; the shared `.sone-range` primitive). Drive it with `[(value)]` + " +
          "`[disabled]` **or** a `FormControl` (it is a ControlValueAccessor; the two disables are OR-ed). Hover or " +
          "drag the thumb for the halo; Tab to it for the focus ring. The Skin switch shows the styles: " +
          "Vega 6px track / 16px thumb, Maia 12px track, Nova 4px track / 12px thumb. For a DISCRETE " +
          "named ladder use `<sone-power-slider>` instead." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/slider](https://spartan.ng/components/slider)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/slider](https://ui.shadcn.com/docs/components/slider)",
      },
    },
  },
  argTypes: {
    value: { control: { type: "range", min: 0, max: 100 } },
    min: { control: "number" },
    max: { control: "number" },
    step: { control: "number" },
    disabled: { control: "boolean" },
    ariaLabel: { control: "text" },
    valueChange: { action: "valueChange" },
  },
  args: {
    value: 60,
    min: 0,
    max: 100,
    step: 1,
    disabled: false,
    ariaLabel: "Volume",
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 320px; display: grid; gap: var(--space-2)">
        <sone-slider [(value)]="value" [min]="min" [max]="max" [step]="step" [disabled]="disabled"
          [ariaLabel]="ariaLabel" (valueChange)="valueChange($event)" />
        <span style="color: var(--text-tertiary); font-size: var(--font-size-xs)">{{ value }}</span>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneSliderComponent>;

export const Default: Story = {};
export const Stepped: Story = { args: { min: 0, max: 10, step: 1, value: 4 } };
export const Disabled: Story = { args: { disabled: true } };

export const Range: Story = {
  render: () => ({
    template: `
      <div style="max-width: 320px; display: grid; gap: var(--space-4)">
        <sone-slider [value]="0" ariaLabel="Empty" />
        <sone-slider [value]="35" ariaLabel="35 percent" />
        <sone-slider [value]="100" ariaLabel="Full" />
        <sone-slider [value]="60" [disabled]="true" ariaLabel="Disabled" />
      </div>`,
  }),
};

export const FormControlBound: Story = {
  name: "Form control",
  render: () => ({
    props: {
      control: new FormControl(40),
      locked: new FormControl({ value: 70, disabled: true }),
    },
    template: `
      <div style="max-width: 320px; display: grid; gap: var(--space-4)">
        <sone-slider [formControl]="control" ariaLabel="Form-bound" />
        <span style="color: var(--text-tertiary); font-size: var(--font-size-xs)">{{ control.value }}</span>
        <sone-slider [formControl]="locked" ariaLabel="Disabled form control" />
      </div>`,
  }),
};
