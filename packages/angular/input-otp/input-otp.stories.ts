import { signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import {
  SONE_OTP_ALPHANUMERIC,
  SoneInputOtpComponent,
} from "./input-otp.component";

const meta: Meta<SoneInputOtpComponent> = {
  title: "Components/Forms/Input OTP",
  component: SoneInputOtpComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-input-otp>` — a one-time code as a form control (ControlValueAccessor, or `[(value)]`). " +
          'shadcn\'s approach: ONE real `<input autocomplete="one-time-code">` (`inputmode="numeric"` for the ' +
          "digits pattern) lies transparent over the slots, so paste, SMS / password-manager autofill and " +
          "screen readers see a plain text field; the slots only draw it. `length` (6), `pattern` (one " +
          "character: `SONE_OTP_DIGITS` by default, `SONE_OTP_ALPHANUMERIC`, any RegExp), `groups` (`[3, 3]` → a " +
          "separator between groups), `disabled`, `invalid`, `ariaLabel` / `inputId` for the label. " +
          "`(complete)` fires with the code once every slot is filled by the user; `focus()` focuses it." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/input-otp](https://spartan.ng/components/input-otp)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/input-otp](https://ui.shadcn.com/docs/components/input-otp)",
      },
    },
  },
  argTypes: {
    length: { control: { type: "number", min: 4, max: 8 } },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
  },
  args: {
    length: 6,
    invalid: false,
    disabled: false,
    ariaLabel: "Verification code",
  },
  render: (args) => ({
    props: { ...args, control: new FormControl("") },
    template: `
      <sone-input-otp [formControl]="control" [length]="length" [invalid]="invalid" [ariaLabel]="ariaLabel" />
      <p style="color: var(--text-tertiary); font-size: var(--font-size-xs)">Form value: {{ control.value }}</p>`,
  }),
};
export default meta;
type Story = StoryObj<SoneInputOtpComponent>;

export const Default: Story = {};

export const Grouped: Story = {
  render: (args) => ({
    props: { ...args, code: signal("123") },
    template: `<sone-input-otp [(value)]="code" [groups]="[3, 3]" [ariaLabel]="ariaLabel" />`,
  }),
};

export const Filled: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl("482915") },
    template: `<sone-input-otp [formControl]="control" [ariaLabel]="ariaLabel" />`,
  }),
};

export const Invalid: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl("4829") },
    template: `<sone-input-otp [formControl]="control" invalid [ariaLabel]="ariaLabel" />`,
  }),
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl({ value: "12", disabled: true }),
    },
    template: `<sone-input-otp [formControl]="control" [ariaLabel]="ariaLabel" />`,
  }),
};

export const Alphanumeric: Story = {
  render: (args) => ({
    props: { ...args, pattern: SONE_OTP_ALPHANUMERIC, code: signal("") },
    template: `<sone-input-otp [(value)]="code" [pattern]="pattern" [length]="8" [groups]="[4, 4]"
      ariaLabel="Recovery code" />`,
  }),
};
