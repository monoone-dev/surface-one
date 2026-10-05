import { signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSwitchComponent } from "./switch.component";

const meta: Meta<SoneSwitchComponent> = {
  title: "Components/Forms/Switch",
  component: SoneSwitchComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-switch>` — the shadcn/ui Switch as a form control (ControlValueAccessor), " +
          "drawn by the global `.switch` primitive (shadcn `cn-switch`). Sizes `default` (32 × 18.4) " +
          "and `sm` (24 × 14); states on / off / disabled / invalid (`[invalid]` → `aria-invalid`). " +
          "Bind a `FormControl` (CVA), or signals: `[checked]` + `(checkedChange)` (or `[(checked)]`) with " +
          "`[disabled]` — `checkedChange` fires only on a user flip. `writeValue` also syncs the NATIVE checkbox, " +
          "so a confirm-then-revert (user flips, backend refuses, form sets it back) never leaves the " +
          "switch showing the rejected state." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/switch](https://spartan.ng/components/switch)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/switch](https://ui.shadcn.com/docs/components/switch)",
      },
    },
  },
  argTypes: {
    ariaLabel: { control: "text" },
    size: { control: "inline-radio", options: ["default", "sm"] },
    invalid: { control: "boolean" },
  },
  args: { ariaLabel: "Record system audio", size: "default", invalid: false },
  render: (args) => ({
    props: { ...args, control: new FormControl(true) },
    template: `
      <label style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
                    max-width: 360px; color: var(--text-primary)">
        Record system audio
        <sone-switch [formControl]="control" [ariaLabel]="ariaLabel" [size]="size" [invalid]="invalid" />
      </label>
      <p style="color: var(--text-tertiary); font-size: var(--font-size-xs)">Form value: {{ control.value }}</p>`,
  }),
};
export default meta;
type Story = StoryObj<SoneSwitchComponent>;

export const On: Story = {};

export const Off: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl(false) },
    template: `<sone-switch [formControl]="control" [ariaLabel]="ariaLabel" [size]="size" [invalid]="invalid" />`,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl({ value: true, disabled: true }),
    },
    template: `<sone-switch [formControl]="control" [ariaLabel]="ariaLabel" [size]="size" [invalid]="invalid" />`,
  }),
};

export const Invalid: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { off: new FormControl(false), on: new FormControl(true) },
    template: `
      <div style="display: flex; gap: var(--space-5); align-items: center">
        <sone-switch [formControl]="off" [invalid]="true" ariaLabel="Invalid, off" />
        <sone-switch [formControl]="on" [invalid]="true" ariaLabel="Invalid, on" />
      </div>`,
  }),
};

export const Sizes: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      rows: [
        {
          size: "default",
          on: new FormControl(true),
          off: new FormControl(false),
          dis: new FormControl({ value: true, disabled: true }),
        },
        {
          size: "sm",
          on: new FormControl(true),
          off: new FormControl(false),
          dis: new FormControl({ value: false, disabled: true }),
        },
      ],
    },
    template: `
      <div style="display: grid; grid-template-columns: auto repeat(3, auto); gap: var(--space-3) var(--space-5);
                  align-items: center; justify-content: start; color: var(--text-secondary); font-size: var(--font-size-xs)">
        <span></span><span>On</span><span>Off</span><span>Disabled</span>
        @for (r of rows; track r.size) {
          <span>{{ r.size }}</span>
          <sone-switch [size]="$any(r.size)" [formControl]="r.on" [ariaLabel]="r.size + ' on'" />
          <sone-switch [size]="$any(r.size)" [formControl]="r.off" [ariaLabel]="r.size + ' off'" />
          <sone-switch [size]="$any(r.size)" [formControl]="r.dis" [ariaLabel]="r.size + ' disabled'" />
        }
      </div>`,
  }),
};

export const SignalBinding: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { on: signal(true) },
    template: `
      <label style="display: flex; align-items: center; justify-content: space-between; gap: var(--space-4);
                    max-width: 360px; color: var(--text-primary)">
        Example signal switch
        <sone-switch [(checked)]="on" ariaLabel="Example signal switch" />
      </label>
      <p style="color: var(--text-tertiary); font-size: var(--font-size-xs)">Signal value: {{ on() }}</p>
      <sone-switch [checked]="true" disabled ariaLabel="Disabled via input" />`,
  }),
};
