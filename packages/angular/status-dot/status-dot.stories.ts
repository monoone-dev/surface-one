import { type Meta, type StoryObj } from "@storybook/angular";

import { SoneStatusDotComponent } from "./status-dot.component";

const meta: Meta<SoneStatusDotComponent> = {
  title: "Components/Data display/Status Dot",
  component: SoneStatusDotComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-status-dot>` — a small round status mark: a live run, a connected app, a step at work. " +
          "`tone` picks the colour (`muted` default, `live`, `success`, `warning`, `destructive`, `accent`, or " +
          "`current` to take the text colour), `size` is `default` (8px) or `sm` (6px), and `pulse` makes it " +
          "breathe while something is going on (still under reduced motion). It is decorative unless it has a " +
          '`label`, which makes it `role="img"` with that name — leave the label out when text beside it ' +
          "already says the status. A dot inside a badge is the badge's own `dot` input." +
          "\n\n**Reference**\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/badge](https://ui.shadcn.com/docs/components/badge)\n" +
          "- Nuxt UI — [https://ui.nuxt.com/components/chip](https://ui.nuxt.com/components/chip)",
      },
    },
  },
  argTypes: {
    tone: {
      control: "select",
      options: [
        "muted",
        "live",
        "success",
        "warning",
        "destructive",
        "accent",
        "current",
      ],
    },
    size: { control: "inline-radio", options: ["default", "sm"] },
    pulse: { control: "boolean" },
    label: { control: "text" },
  },
  args: { tone: "live", size: "default", pulse: false, label: null },
};
export default meta;
type Story = StoryObj<SoneStatusDotComponent>;

export const Default: Story = {};

export const Tones: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-2)">
        @for (tone of ['muted', 'live', 'success', 'warning', 'destructive', 'accent']; track tone) {
          <span style="display: flex; align-items: center; gap: var(--space-2)">
            <sone-status-dot [tone]="$any(tone)" />{{ tone }}
          </span>
        }
      </div>`,
  }),
};

export const PulsingAndSmall: Story = {
  render: () => ({
    template: `
      <div style="display: flex; flex-direction: column; gap: var(--space-2)">
        <span style="display: flex; align-items: center; gap: var(--space-2)">
          <sone-status-dot tone="live" pulse />Running
        </span>
        <span style="display: flex; align-items: center; gap: var(--space-2); color: var(--success-text)">
          <sone-status-dot tone="current" size="sm" />Following
        </span>
        <sone-status-dot tone="warning" label="Needs you" />
      </div>`,
  }),
};
