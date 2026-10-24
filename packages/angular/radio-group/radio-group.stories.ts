import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";
import { FormControl, ReactiveFormsModule } from "@angular/forms";

import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_RADIO_GROUP_PARTS } from "./radio-group.directive";

const meta: Meta = {
  title: "Components/Forms/Radio Group",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_RADIO_GROUP_PARTS,
        ...SONE_FIELD_PARTS,
        ReactiveFormsModule,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          'spartan/ui RadioGroup, native first. `[soneRadioGroup]` (`role="radiogroup"`, on a ' +
          "`fieldset` with a `legend` or a `div` with an `aria-label`) holds the value — " +
          "`[(value)]`, `ngModel` or `formControl` — and shares one `name` between its " +
          "`input[soneRadio]`s, so the browser keeps the arrow keys and the single Tab stop. " +
          "`disabled`, `required` and `orientation` on the group; `value` and `disabled` on each " +
          "radio. The global form styles draw the radios (`--checkbox-*`, the accent dot when " +
          'checked). Pair each with a label through `[soneField] orientation="horizontal"`.' +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/radio-group](https://spartan.ng/components/radio-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/radio-group](https://ui.shadcn.com/docs/components/radio-group)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: { density: "comfortable" },
    template: `
      <div soneRadioGroup aria-label="Density" [(value)]="density">
        <div soneField orientation="horizontal">
          <input soneRadio id="rg-default" value="default" />
          <label soneFieldLabel for="rg-default">Default</label>
        </div>
        <div soneField orientation="horizontal">
          <input soneRadio id="rg-comfortable" value="comfortable" />
          <label soneFieldLabel for="rg-comfortable">Comfortable</label>
        </div>
        <div soneField orientation="horizontal">
          <input soneRadio id="rg-compact" value="compact" />
          <label soneFieldLabel for="rg-compact">Compact</label>
        </div>
      </div>
      <p class="text-hint">Value: {{ density }}</p>`,
  }),
};

export const Fieldset: Story = {
  render: () => ({
    props: { plan: new FormControl("pro") },
    template: `
      <fieldset soneRadioGroup [formControl]="plan" required>
        <legend soneFieldLegend variant="label">Plan</legend>
        <div soneField orientation="horizontal">
          <input soneRadio id="rg-free" value="free" />
          <label soneFieldLabel for="rg-free">Free</label>
        </div>
        <div soneField orientation="horizontal">
          <input soneRadio id="rg-pro" value="pro" />
          <label soneFieldLabel for="rg-pro">Pro</label>
        </div>
        <div soneField orientation="horizontal">
          <input soneRadio id="rg-team" value="team" disabled />
          <label soneFieldLabel for="rg-team">Team (soon)</label>
        </div>
      </fieldset>
      <p class="text-hint">Value: {{ plan.value }}</p>`,
  }),
};

export const Horizontal: Story = {
  render: () => ({
    template: `
      <div soneRadioGroup aria-label="Size" orientation="horizontal" value="m">
        <label soneLabel><input soneRadio value="s" /> Small</label>
        <label soneLabel><input soneRadio value="m" /> Medium</label>
        <label soneLabel><input soneRadio value="l" /> Large</label>
      </div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `
      <div soneRadioGroup aria-label="Sync" value="auto" disabled>
        <label soneLabel><input soneRadio value="auto" /> Automatic</label>
        <label soneLabel><input soneRadio value="manual" /> Manual</label>
      </div>`,
  }),
};
