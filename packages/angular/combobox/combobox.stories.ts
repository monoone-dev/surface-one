import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_FIELD_PARTS } from "@surface-one/angular/input";

import type { SoneComboboxItems } from "./combobox-options";
import { SoneComboboxComponent } from "./combobox.component";

const FRAMEWORKS: SoneComboboxItems = [
  { value: "next", label: "Next.js" },
  { value: "sveltekit", label: "SvelteKit" },
  { value: "nuxt", label: "Nuxt.js" },
  { value: "remix", label: "Remix", disabled: true },
  { value: "astro", label: "Astro" },
];

const GROUPED: SoneComboboxItems = [
  {
    label: "Europe",
    options: [
      { value: "warsaw", label: "Warsaw" },
      { value: "lisbon", label: "Lisbon" },
      { value: "kraków", label: "Kraków", keywords: ["krakow"] },
    ],
  },
  {
    label: "Asia",
    options: [
      { value: "tokyo", label: "Tokyo" },
      { value: "seoul", label: "Seoul" },
    ],
  },
];

const meta: Meta<SoneComboboxComponent> = {
  title: "Components/Forms/Combobox",
  component: SoneComboboxComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [ReactiveFormsModule, ...SONE_FIELD_PARTS] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-combobox>` — shadcn/ui Combobox (spartan/ui Autocomplete): an input that filters " +
          "a listbox of `options` (`{ value, label, disabled?, keywords? }` or `{ label, options }` " +
          "groups) as you type, by the command's filter (every word, case- and accent-insensitive; " +
          "`filter` / `shouldFilter` for your own or server-side search). It follows the WAI-ARIA " +
          "combobox pattern: the input keeps focus (`aria-activedescendant`), Up / Down, Home / End " +
          "and PageUp / PageDown move the highlight, Enter picks, Escape closes, Alt + Down opens. " +
          "`[(value)]` is one value — or a list with `multiple`, shown as chips that Backspace " +
          "removes — and also a form control; `[(search)]` and `[(open)]` are two-way, `clearable` " +
          "adds a clear button and `emptyText` is the empty state. The popup is the popover " +
          "family's overlay (`SoneOverlayTriggerBase` on `input[soneComboboxInput]`): on `<body>`, " +
          "under the whole control and at least as wide, flipped when there is no room. Inside " +
          "`[soneField]` the label (`inputId`), description and error wire to the input." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/autocomplete](https://spartan.ng/components/autocomplete)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/combobox](https://ui.shadcn.com/docs/components/combobox)",
      },
    },
  },
  argTypes: {
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    invalid: { control: "boolean" },
    clearable: { control: "boolean" },
    placeholder: { control: "text" },
    valueChange: { action: "valueChange" },
  },
  args: {
    options: FRAMEWORKS,
    value: null,
    multiple: false,
    disabled: false,
    invalid: false,
    clearable: false,
    placeholder: "Select a framework",
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 18rem; min-height: 18rem">
        <sone-combobox
          [options]="options"
          [(value)]="value"
          [multiple]="multiple"
          [disabled]="disabled"
          [invalid]="invalid"
          [clearable]="clearable"
          [placeholder]="placeholder"
          ariaLabel="Framework"
          (valueChange)="valueChange($event)"
        />
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<SoneComboboxComponent>;

export const Default: Story = {};
export const Picked: Story = { args: { value: "nuxt", clearable: true } };
export const Multiple: Story = {
  args: {
    multiple: true,
    value: ["next", "astro"],
    placeholder: "Add frameworks",
  },
};
export const Groups: Story = {
  args: { options: GROUPED, placeholder: "Pick a city" },
};
export const Disabled: Story = { args: { disabled: true, value: "next" } };
export const Invalid: Story = { args: { invalid: true } };

export const InAField: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: {
      options: GROUPED,
      control: new FormControl<string[]>(["lisbon"]),
    },
    template: `
      <div soneField style="max-width: 20rem; min-height: 18rem">
        <label soneFieldLabel for="story-cities">Cities</label>
        <sone-combobox inputId="story-cities" [options]="options" multiple [formControl]="control" placeholder="Add a city" />
        <p soneFieldDescription>Picked: {{ control.value.join(", ") || "none" }}</p>
      </div>`,
  }),
};
