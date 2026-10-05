import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SonePowerSliderComponent,
  type PowerRung,
} from "./power-slider.component";

const RUNGS: readonly PowerRung[] = [
  { id: "battery", name: "Battery saver" },
  { id: "balanced", name: "Balanced" },
  { id: "sharp", name: "Sharp" },
  { id: "max", name: "Maximum" },
];

const meta: Meta<SonePowerSliderComponent> = {
  title: "Components/Forms/Power slider",
  component: SonePowerSliderComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-power-slider>` — a DISCRETE ladder as a range control, sharing `sone-slider`’s look " +
          "through the `.sone-range` primitive.\n\n" +
          "- **Preview vs commit.** Dragging previews the rung; `value` (and the form) updates once, " +
          "on release — dragging past Maximum never persists every rung on the way.\n" +
          "- **Accessibility.** `aria-valuetext` reads the rung *name*; PageUp/PageDown jump exactly " +
          "one rung.\n" +
          "- Driven by a `FormControl` **or** `[(value)]` + `[disabled]`, like `<sone-select>`. A value " +
          "not on the ladder is kept (shown as off-ladder), never silently replaced.\n" +
          "- Not in spartan/shadcn (source-order step 4): an own component on the shadcn Slider " +
          "anatomy — track, range, thumb — plus rung notches and labels.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/slider](https://spartan.ng/components/slider)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/slider](https://ui.shadcn.com/docs/components/slider)",
      },
    },
  },
  argTypes: {
    value: { control: "inline-radio", options: RUNGS.map((r) => r.id) },
    disabled: { control: "boolean" },
    ariaLabel: { control: "text" },
    valueChange: { action: "valueChange" },
  },
  args: {
    rungs: RUNGS,
    value: "balanced",
    disabled: false,
    ariaLabel: "Transcription power",
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 420px">
        <sone-power-slider [rungs]="rungs" [(value)]="value" [disabled]="disabled"
          [ariaLabel]="ariaLabel" (valueChange)="valueChange($event)" />
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SonePowerSliderComponent>;

export const SignalBound: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const OffLadderValue: Story = { args: { value: "custom-q5" } };

const formStory = (control: FormControl<string | null>): Story => ({
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { rungs: RUNGS, control },
    template: `
      <div style="max-width: 420px; display: grid; gap: var(--space-2)">
        <sone-power-slider [rungs]="rungs" [formControl]="control" ariaLabel="Transcription power" />
        <span style="color: var(--text-secondary); font-size: var(--font-size-xs)">Committed: {{ control.value }}</span>
      </div>`,
  }),
});

export const ReactiveForm: Story = formStory(new FormControl("sharp"));

export const ReactiveFormDisabled: Story = formStory(
  new FormControl({ value: "battery", disabled: true }),
);
