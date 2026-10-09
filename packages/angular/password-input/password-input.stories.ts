import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SonePasswordInputComponent } from "./password-input.component";

const meta: Meta<SonePasswordInputComponent> = {
  title: "Components/Forms/Password Input",
  component: SonePasswordInputComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-password-input>` — a password field as a form control (ControlValueAccessor, or `[(value)]`), " +
          "drawn by the Input Group with a ghost `icon-xs` show / hide toggle at the end. The toggle is a toggle " +
          'button: a constant name (`toggleLabel`, "Show password") and `aria-pressed`; `[(visible)]` binds the ' +
          "state. `autocomplete` (`current-password` | `new-password` | `off`), `placeholder`, `invalid`, " +
          "`disabled`, `readonly`, `inputId` for a `<label for>`, `ariaLabel`, `ariaDescribedby`, `name`; " +
          "`focus()` focuses the field. Keydown events (Enter) bubble from the input to the host." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/input-group](https://spartan.ng/components/input-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/input-group](https://ui.shadcn.com/docs/components/input-group)",
      },
    },
  },
  argTypes: {
    autocomplete: {
      control: "inline-radio",
      options: ["current-password", "new-password", "off"],
    },
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    readonly: { control: "boolean" },
  },
  args: {
    autocomplete: "current-password",
    placeholder: "Password",
    ariaLabel: "Password",
    invalid: false,
    disabled: false,
    readonly: false,
  },
  render: (args) => ({
    props: { ...args, control: new FormControl("correct horse") },
    template: `<div style="max-width: 22rem">
      <sone-password-input [formControl]="control" [autocomplete]="autocomplete" [placeholder]="placeholder"
        [ariaLabel]="ariaLabel" [invalid]="invalid" [readonly]="readonly" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SonePasswordInputComponent>;

export const Default: Story = {};
export const Empty: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl("") },
    template: `<div style="max-width: 22rem"><sone-password-input [formControl]="control"
      autocomplete="new-password" placeholder="At least 8 characters" ariaLabel="New password" /></div>`,
  }),
};
export const Visible: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl("correct horse") },
    template: `<div style="max-width: 22rem"><sone-password-input [formControl]="control" [visible]="true"
      ariaLabel="Password" /></div>`,
  }),
};
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl({ value: "secret", disabled: true }),
    },
    template: `<div style="max-width: 22rem"><sone-password-input [formControl]="control" ariaLabel="Password" /></div>`,
  }),
};
