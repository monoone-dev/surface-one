import type { Meta, StoryObj } from "@storybook/angular";

import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "./segmented.component";

const THEME_OPTIONS: readonly SegmentOption[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "display" },
];

const RANGE_OPTIONS: readonly SegmentOption[] = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "90d", label: "90 days" },
  { value: "all", label: "All time" },
];

const meta: Meta<SoneSegmentedComponent> = {
  title: "Components/Forms/Segmented",
  component: SoneSegmentedComponent,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-segmented>` — the segmented control (the Light / Dark / System pattern): a " +
          "single-choice `soneToggleGroup` (spacing 0, joined) rendered from data. `options` is a " +
          "list of `SegmentOption { value, label, icon?, iconOnly?, disabled? }`; two-way bind the " +
          "selection with `[(value)]`. `variant` (outline | default), `size` (sm | default | lg) and " +
          "`orientation` pass through to the group. Items expose `aria-pressed` and " +
          '`data-state="on|off"`; arrow keys / Home / End move focus. A glyph-only option takes ' +
          "its `label` as the accessible name and tooltip. Flip the toolbar's **Skin** × **Theme**: " +
          "the metrics and ON fill come from the toggle tokens (Nova / Vega / Maia).\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/toggle-group](https://spartan.ng/components/toggle-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/toggle-group](https://ui.shadcn.com/docs/components/toggle-group)",
      },
    },
  },
  argTypes: {
    value: { control: "text" },
    ariaLabel: { control: "text" },
    variant: { control: "inline-radio", options: ["outline", "default"] },
    size: { control: "inline-radio", options: ["sm", "default", "lg"] },
    orientation: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
    },
    valueChange: { action: "valueChange" },
  },
  args: {
    options: THEME_OPTIONS,
    value: "dark",
    ariaLabel: "Theme",
    variant: "outline",
    size: "default",
    orientation: "horizontal",
  },
  render: (args) => ({
    props: args,
    template: `<sone-segmented [options]="options" [(value)]="value" [ariaLabel]="ariaLabel" [variant]="variant" [size]="size" [orientation]="orientation" (valueChange)="valueChange($event)" />`,
  }),
};
export default meta;
type Story = StoryObj<SoneSegmentedComponent>;

export const WithIcons: Story = {};
export const TextOnly: Story = {
  args: { options: RANGE_OPTIONS, value: "30d", ariaLabel: "Range" },
};

const SESSION_OPTIONS: readonly SegmentOption[] = [
  { value: "current", label: "This session" },
  { value: "previous", label: "Previous" },
  { value: "archived", label: "Archived", disabled: true },
];

const ICON_ONLY_OPTIONS: readonly SegmentOption[] = THEME_OPTIONS.map((o) => ({
  ...o,
  iconOnly: true,
}));

export const Matrix: Story = {
  render: () => ({
    props: {
      theme: THEME_OPTIONS,
      range: RANGE_OPTIONS,
      session: SESSION_OPTIONS,
      iconOnly: ICON_ONLY_OPTIONS,
      variants: ["outline", "default"],
      sizes: ["sm", "default", "lg"],
    },
    template: `
      <div style="display: grid; gap: var(--space-3); justify-items: start">
        @for (variant of variants; track variant) {
          @for (size of sizes; track size) {
            <sone-segmented [options]="range" value="30d" [variant]="$any(variant)" [size]="$any(size)" ariaLabel="Range" />
          }
        }
        <sone-segmented [options]="session" value="current" size="sm" ariaLabel="Log session" />
        <sone-segmented [options]="iconOnly" value="dark" ariaLabel="Theme" />
        <sone-segmented [options]="theme" value="system" orientation="vertical" ariaLabel="Theme" />
      </div>`,
  }),
};
