import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSelectComponent } from "./select.component";

const meta: Meta<SoneSelectComponent> = {
  title: "Components/Forms/Select",
  component: SoneSelectComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-select>` — a native select as a form control with **projected** `<option>`s " +
          "(static or `@for`-generated). Options paint `var(--surface-overlay)` (rule T3).\n\n" +
          "Two ways to drive it:\n" +
          "- the CVA path — `formControlName` / `[formControl]`;\n" +
          "- the signal path — `[(value)]` + `[disabled]`, for hosts with no reactive form.\n\n" +
          "Which output fires when: a user pick emits `(valueChange)` and `(selectionChange)` (and the " +
          "form's `onChange`); a forms write (`setValue` / `patchValue` → `writeValue`) only updates the " +
          "shown option and emits neither. `(selectionChange)` is the user-only event to react to.\n\n" +
          "`[disabled]` and a disabled FormControl are OR-ed: either one disables.\n\n" +
          "shadcn Native Select anatomy: the host is `native-select-wrapper`, the inner " +
          '`<select data-slot="native-select">` takes `size` (`default` h-8 · `sm` h-7 in Nova; ' +
          "Vega/Maia h-9 · h-8 via the theme's `--control-h-*`) and `invalid` (`aria-invalid`). " +
          "`selectId` pairs it with a `<label for>`, `ariaDescribedby` adds hint / error ids. Styling is the global control language in " +
          "`input/forms.css` — every bare `<select>` in the app looks the same.\n\n" +
          "Options projected **after** the value (an `@for` over a list that loads later) are " +
          "re-synced after render, so the shown option never disagrees with `value`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/native-select](https://spartan.ng/components/native-select)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/native-select](https://ui.shadcn.com/docs/components/native-select)",
      },
    },
  },
  argTypes: {
    value: {
      control: "inline-radio",
      options: ["small", "medium", "large-v3"],
    },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    size: { control: "inline-radio", options: ["default", "sm"] },
    ariaLabel: { control: "text" },
    valueChange: { action: "valueChange" },
  },
  args: {
    value: "medium",
    disabled: false,
    invalid: false,
    size: "default",
    ariaLabel: "Transcription model",
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 320px">
        <sone-select [(value)]="value" [disabled]="disabled" [invalid]="invalid" [size]="size" [ariaLabel]="ariaLabel" (valueChange)="valueChange($event)">
          <option value="small">Whisper small — fastest</option>
          <option value="medium">Whisper medium — balanced</option>
          <option value="large-v3">Whisper large-v3 — most accurate</option>
        </sone-select>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneSelectComponent>;

export const SignalBound: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Invalid: Story = { args: { invalid: true } };
export const Small: Story = { args: { size: "sm" } };

export const WithLabel: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    template: `
      <div style="max-width: 320px; display: grid; gap: var(--space-2)">
        <label for="story-select-vault" style="font-size: var(--font-size-sm); font-weight: 500">Vault</label>
        <sone-select selectId="story-select-vault" value="work">
          <option value="personal">Personal vault</option>
          <option value="work">Work vault</option>
        </sone-select>
      </div>`,
  }),
};

export const ReactiveForm: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { control: new FormControl("en") },
    template: `
      <div style="max-width: 320px; display: grid; gap: var(--space-2)">
        <sone-select [formControl]="control" ariaLabel="Language">
          <option value="auto">Detect automatically</option>
          <option value="en">English</option>
          <option value="pl">Polski</option>
          <option value="de">Deutsch</option>
        </sone-select>
        <span style="color: var(--text-tertiary); font-size: var(--font-size-xs)">Form value: {{ control.value }}</span>
      </div>`,
  }),
};

export const SizesAndStates: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { sizes: ["default", "sm"] },
    template: `
      <div style="display: grid; gap: var(--space-3); max-width: 320px">
        @for (s of sizes; track s) {
          <sone-select [size]="$any(s)" [ariaLabel]="'Model, size ' + s" value="medium">
            <option value="small">Whisper small — {{ s }}</option>
            <option value="medium">Whisper medium — {{ s }}</option>
          </sone-select>
        }
        <sone-select invalid ariaLabel="Invalid select" value="">
          <option value="">Choose a vault…</option>
          <option value="work">Work vault</option>
        </sone-select>
        <sone-select [disabled]="true" ariaLabel="Disabled select" value="medium">
          <option value="medium">Disabled</option>
        </sone-select>
      </div>`,
  }),
};
