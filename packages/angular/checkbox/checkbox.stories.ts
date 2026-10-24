import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SoneCheckboxDirective } from "./checkbox.directive";

const meta: Meta = {
  title: "Components/Forms/Checkbox",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneCheckboxDirective,
        ...SONE_FIELD_PARTS,
        ReactiveFormsModule,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Checkbox, native first. `input[soneCheckbox]` stays an " +
          '`<input type="checkbox">`: `[checked]`, `(change)`, `ngModel`, `formControl`, ' +
          "`disabled`, `required` and `aria-invalid` work as on any checkbox, and the global form " +
          "styles draw it (`--checkbox-*`, the accent when checked). The directive adds the mixed " +
          "state, `[(indeterminate)]`, which a click clears. Pair it with a label through " +
          '`[soneField] orientation="horizontal"` + `label[soneFieldLabel]`, or wrap it in a ' +
          "`label[soneLabel]`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/checkbox](https://spartan.ng/components/checkbox)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/checkbox](https://ui.shadcn.com/docs/components/checkbox)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <div soneField orientation="horizontal">
        <input soneCheckbox id="cb-terms" />
        <label soneFieldLabel for="cb-terms">Accept terms and conditions</label>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-3)">
        <label soneLabel><input soneCheckbox /> Unchecked</label>
        <label soneLabel><input soneCheckbox checked /> Checked</label>
        <label soneLabel><input soneCheckbox [indeterminate]="true" /> Indeterminate</label>
        <label soneLabel><input soneCheckbox aria-invalid="true" /> Invalid</label>
        <label soneLabel><input soneCheckbox disabled /> Disabled</label>
        <label soneLabel><input soneCheckbox checked disabled /> Checked, disabled</label>
      </div>`,
  }),
};

export const WithDescription: Story = {
  render: () => ({
    template: `
      <div soneField orientation="horizontal" style="max-width: 24rem">
        <input soneCheckbox id="cb-notify" checked />
        <div soneFieldContent>
          <label soneFieldLabel for="cb-notify">Enable notifications</label>
          <p soneFieldDescription>You can turn them off at any time.</p>
        </div>
      </div>`,
  }),
};

export const SelectAll: Story = {
  render: () => ({
    props: { a: true, b: false },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        <label soneLabel>
          <input soneCheckbox [checked]="a && b" [indeterminate]="a !== b"
            (change)="a = $any($event.target).checked; b = a" /> All files
        </label>
        <label soneLabel style="padding-left: var(--space-6)">
          <input soneCheckbox [checked]="a" (change)="a = !a" /> Notes.md
        </label>
        <label soneLabel style="padding-left: var(--space-6)">
          <input soneCheckbox [checked]="b" (change)="b = !b" /> Budget.xlsx
        </label>
      </div>`,
  }),
};

export const ReactiveForms: Story = {
  render: () => ({
    props: { agree: new FormControl(false) },
    template: `
      <div soneField orientation="horizontal">
        <input soneCheckbox id="cb-agree" [formControl]="agree" />
        <label soneFieldLabel for="cb-agree">I agree ({{ agree.value }})</label>
      </div>`,
  }),
};
