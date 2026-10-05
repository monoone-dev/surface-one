import type { Meta, StoryObj } from "@storybook/angular";

import { SoneSecretFieldComponent } from "./secret-field.component";

const meta: Meta<SoneSecretFieldComponent> = {
  title: "Components/Forms/Secret Field",
  component: SoneSecretFieldComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-secret-field>` — enter a BYO secret stored in the macOS Keychain. A status row (`label` + a " +
          "set / not-set badge from `hasKey`; `null` hides it), a password Input Group with **Save** (emits " +
          "`save(value)`), optional **Clear** (`clearable`, emits `clear`), helper copy and an error.\n\n" +
          "The component owns the typed value and never receives a stored one, so a secret cannot be echoed " +
          "back. It clears the input once the parent's save settles (`busy` back to false with no `error`); " +
          'a failure keeps the typed value for a retry. Host: `data-slot="secret-field"`, `data-state` = ' +
          "`set` | `unset` | `unknown`.\n\n" +
          "Own composite (source order step 4) on shadcn's Field + Input Group + Badge.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/input-group](https://spartan.ng/components/input-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/input-group](https://ui.shadcn.com/docs/components/input-group)",
      },
    },
  },
  argTypes: {
    hasKey: { control: "inline-radio", options: [true, false, null] },
    busy: { control: "boolean" },
    error: { control: "text" },
    clearable: { control: "boolean" },
  },
  args: {
    hasKey: false,
    busy: false,
    error: null,
    label: "Status",
    placeholder: "Example service API key",
    help: "Bring your own key — it's stored in your macOS Keychain and never logged.",
    setLabel: "Key set ✓",
    saveLabel: "Save key",
    clearable: false,
  },
  render: (args) => ({
    props: args,
    template: `<div style="max-width: 420px">
      <sone-secret-field [hasKey]="hasKey" [busy]="busy" [error]="error" [label]="label"
        [placeholder]="placeholder" [help]="help" [setLabel]="setLabel" [saveLabel]="saveLabel"
        [clearable]="clearable" /></div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneSecretFieldComponent>;

export const NotSet: Story = {};
export const KeySet: Story = { args: { hasKey: true, clearable: true } };
export const Saving: Story = { args: { busy: true } };
export const Failed: Story = {
  args: { error: "The Keychain refused the write. Try again." },
};
export const Token: Story = {
  args: {
    setLabel: "Token set ✓",
    saveLabel: "Save",
    placeholder: "Example workspace token (tok_…)",
  },
};
export const NoStatus: Story = {
  args: { hasKey: null, help: null, placeholder: "ex-key-…" },
};
