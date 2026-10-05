import { type Meta, type StoryObj } from "@storybook/angular";

const meta: Meta = {
  title: "Foundations/Utilities",
  tags: ["autodocs"],
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        component:
          "App-wide utilities from **`packages/angular/styles.css`** (loaded globally " +
          "through `styles.css`). `styles.css` otherwise only `@import`s the per-component " +
          "stylesheets — every control is documented on its own page under **Components**.",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Text: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-2); max-width: 420px">
        <span class="section-label">Section label</span>
        <p style="margin: 0">Primary text</p>
        <p class="text-secondary" style="margin: 0">.text-secondary</p>
        <p class="text-muted" style="margin: 0">.text-muted (≥13px only)</p>
        <p class="text-success" style="margin: 0">.text-success</p>
        <p class="text-danger" style="margin: 0">.text-danger</p>
        <p class="field-help text-muted">.field-help — the explanatory line under a form control.</p>
      </div>`,
  }),
};

export const ScrollbarAndRise: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-4); max-width: 420px">
        <div style="height: 120px; overflow: auto; padding: var(--space-3);
                    border: 1px solid var(--border); border-radius: var(--radius-md)">
          @for (n of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]; track n) {
            <p style="margin: 0 0 var(--space-2)">Scrollable line {{ n }}</p>
          }
        </div>
        <p style="margin: 0; animation: rise 0.6s ease both">This line enters with <code>rise</code>.</p>
      </div>`,
  }),
};
