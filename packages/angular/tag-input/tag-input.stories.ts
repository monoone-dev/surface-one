import { signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneTagInputComponent } from "./tag-input.component";

const meta: Meta<SoneTagInputComponent> = {
  title: "Components/Forms/Tag Input",
  component: SoneTagInputComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-tag-input>` — tags as removable chips, a form control of `string[]` (ControlValueAccessor, or " +
          "`[(value)]`). Enter or a comma adds the typed tag (a pasted `a, b, c` adds three), Backspace in the " +
          'empty field removes the last one; each chip is a `soneBadge` with a `button[soneBadgeRemove]` named "Remove ' +
          '{tag}". `max`, `maxVisible` (a "+N more" toggle with `aria-expanded`), `suggestions` (a native ' +
          "`<datalist>`), `validate`, case-insensitive duplicate prevention; refused text stays in the field " +
          "and `(rejected)` says why (`duplicate` | `invalid` | `max`). `(added)` / `(removed)` fire per tag, " +
          "and a polite live region announces both." +
          "\n\n**Reference**\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/badge](https://ui.shadcn.com/docs/components/badge) (chips) and [Input](https://ui.shadcn.com/docs/components/input)\n" +
          "- spartan/ui — [https://spartan.ng/components/badge](https://spartan.ng/components/badge)",
      },
    },
  },
  argTypes: {
    invalid: { control: "boolean" },
    disabled: { control: "boolean" },
    max: { control: "number" },
    maxVisible: { control: "number" },
  },
  args: {
    placeholder: "Add tag…",
    ariaLabel: "Add tag",
    invalid: false,
    disabled: false,
    max: null,
    maxVisible: null,
  },
  render: (args) => ({
    props: { ...args, control: new FormControl(["design", "q3", "roadmap"]) },
    template: `<div style="max-width: 28rem">
      <sone-tag-input [formControl]="control" [placeholder]="placeholder" [ariaLabel]="ariaLabel"
        [invalid]="invalid" [max]="max" [maxVisible]="maxVisible" /></div>
      <p style="color: var(--text-tertiary); font-size: var(--font-size-xs)">Form value: {{ control.value?.join(", ") }}</p>`,
  }),
};
export default meta;
type Story = StoryObj<SoneTagInputComponent>;

export const Default: Story = {};

export const Empty: Story = {
  render: (args) => ({
    props: { ...args, tags: signal<string[]>([]) },
    template: `<div style="max-width: 28rem"><sone-tag-input [(value)]="tags" [placeholder]="placeholder" /></div>`,
  }),
};

export const Collapsed: Story = {
  args: { maxVisible: 2 },
};

export const WithSuggestions: Story = {
  render: (args) => ({
    props: {
      ...args,
      tags: signal(["design"]),
      suggestions: ["design", "engineering", "hiring", "planning", "sales"],
    },
    template: `<div style="max-width: 28rem"><sone-tag-input [(value)]="tags" [suggestions]="suggestions"
      placeholder="Type or pick a tag" /></div>`,
  }),
};

export const Invalid: Story = { args: { invalid: true } };

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl({ value: ["design", "q3"], disabled: true }),
    },
    template: `<div style="max-width: 28rem"><sone-tag-input [formControl]="control" /></div>`,
  }),
};
