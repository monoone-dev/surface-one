import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneRatingComponent } from "./rating.component";

const meta: Meta<SoneRatingComponent> = {
  title: "Components/Forms/Rating",
  component: SoneRatingComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-rating>` — stars for a score. `readonly` draws one image named “4.5 out of 5” and fills " +
          "fractions; otherwise it is a native radio group (arrow keys change the score, every star is a " +
          "labelled radio) and a ControlValueAccessor of `number` (0 = no rating), or `[(value)]`. " +
          "`clearable` clears the score when the current star is chosen again; `max`, `size`." +
          "\n\n**Reference**\n" +
          "- Nuxt UI — no rating; shadcn/ui community “Rating” blocks (radio group of stars)\n" +
          "- WAI-ARIA — [Radio group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)",
      },
    },
  },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    readonly: { control: "boolean" },
    disabled: { control: "boolean" },
    clearable: { control: "boolean" },
    max: { control: "number" },
  },
  args: {
    value: 3,
    max: 5,
    size: "default",
    readonly: false,
    disabled: false,
    clearable: true,
    ariaLabel: "Rating",
  },
};
export default meta;
type Story = StoryObj<SoneRatingComponent>;

export const Interactive: Story = {};

export const ReadOnly: Story = {
  args: { value: 4.5, readonly: true, ariaLabel: "Average rating" },
};

export const Sizes: Story = {
  render: () => ({
    template: `<div style="display: grid; gap: var(--space-2)">
      <sone-rating [value]="3.5" readonly size="sm" />
      <sone-rating [value]="3.5" readonly />
      <sone-rating [value]="3.5" readonly size="lg" />
    </div>`,
  }),
};

export const FormControlBinding: Story = {
  render: () => ({
    props: { control: new FormControl(4) },
    template: `<sone-rating [formControl]="control" ariaLabel="Your rating" />
      <p style="color: var(--text-tertiary); font-size: var(--font-size-xs)">Form value: {{ control.value }}</p>`,
  }),
};

export const Disabled: Story = { args: { disabled: true } };
