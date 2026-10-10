import { signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneSearchFieldComponent } from "./search-field.component";

const meta: Meta<SoneSearchFieldComponent> = {
  title: "Components/Forms/Search Field",
  component: SoneSearchFieldComponent,
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [ReactiveFormsModule] })],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-search-field>` — a search box on the Input Group: a leading search glyph, the field " +
          '(`role="searchbox"`) and, with `clearable`, a ghost clear button while it has text. A form control ' +
          "(ControlValueAccessor) or `[(value)]`. Enter emits `(submit)` with the text; Escape clears a " +
          "clearable field with text, otherwise it emits `(escape)`. `focus()` and `clear()` are public. " +
          "Inputs: `size` (`sm` | `default`), `placeholder`, `ariaLabel`, `clearLabel`, `inputId`, `name`, `disabled`." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/input-group](https://spartan.ng/components/input-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/input-group](https://ui.shadcn.com/docs/components/input-group)",
      },
    },
  },
};
export default meta;
type Story = StoryObj<SoneSearchFieldComponent>;

export const Default: Story = {
  render: () => {
    const query = signal("");
    const submitted = signal("");
    return {
      props: { query, submitted },
      template: `
        <div style="display: grid; gap: var(--space-2); max-width: 22rem">
          <sone-search-field [(value)]="query" clearable placeholder="Search notes"
            ariaLabel="Search notes" (submit)="submitted.set($event)" />
          <p style="margin: 0; color: var(--text-secondary)">Submitted: {{ submitted() || "—" }}</p>
        </div>`,
    };
  },
};

export const Small: Story = {
  render: () => ({
    props: { control: new FormControl("roadmap") },
    template: `<div style="max-width: 16rem"><sone-search-field size="sm" clearable [formControl]="control" ariaLabel="Filter" placeholder="Filter" /></div>`,
  }),
};

export const Disabled: Story = {
  render: () => ({
    template: `<div style="max-width: 22rem"><sone-search-field disabled placeholder="Search is unavailable" /></div>`,
  }),
};
