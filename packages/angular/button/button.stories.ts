import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SoneButtonDirective,
  type ButtonSize,
  type ButtonVariant,
} from "./button.directive";

const VARIANTS: readonly ButtonVariant[] = [
  "default",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
];
const TEXT_SIZES: readonly ButtonSize[] = ["xs", "sm", "default", "lg"];
const ICON_SIZES: readonly ButtonSize[] = [
  "icon-xs",
  "icon-sm",
  "icon",
  "icon-lg",
];

const CHEVRON = `<svg data-icon="inline-end" viewBox="0 0 16 16" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>`;
const PLUS = `<svg data-icon="inline-start" viewBox="0 0 16 16" fill="none" stroke="currentColor"
  stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9"/></svg>`;
const TRASH = `<svg data-icon="inline-start" viewBox="0 0 16 16" fill="none" stroke="currentColor"
  stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5h10M6 4.5V3h4v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5"/></svg>`;

const ARROW = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 11 11 5M6 5h5v5"/></svg>`;

interface ButtonArgs {
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  label: string;
}

const meta: Meta<ButtonArgs> = {
  title: "Components/Actions/Button",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [SoneButtonDirective] })],
  parameters: {
    docs: {
      description: {
        component:
          "`button[soneBtn]` — the ONE button, modelled on spartan/ui `hlmBtn` " +
          "(https://spartan.ng/components/button). Same variants (`default`, `secondary`, " +
          "`outline`, `ghost`, `destructive`, `link`) and sizes (`xs` · `sm` · `default` · `lg`, plus " +
          "square `icon-xs` / `icon-sm` / `icon` / `icon-lg`). With the base tokens it is shadcn Nova " +
          "1:1; every colour, fill and metric is a token the skin's theme file re-declares. Icon-only " +
          "buttons need an `aria-label`.\n\n" +
          "The metrics are per shadcn STYLE — flip the toolbar's **Skin**: Studio = Vega " +
          "(24/32/36/40, rounded-md), Minimalist = Nova (24/28/32/36, rounded-lg, sm at 0.8rem with " +
          "14px glyphs), Paper = Maia (pill, px 10/12/12/16). A leading/trailing glyph tightens its side " +
          'by the style\'s edge step — `data-icon="inline-start"` on an `<svg>`, `inline="start"` ' +
          "on a `<sone-icon>`.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/button](https://spartan.ng/components/button)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/button](https://ui.shadcn.com/docs/components/button)",
      },
    },
  },
  argTypes: {
    variant: { control: "inline-radio", options: VARIANTS },
    size: { control: "inline-radio", options: [...TEXT_SIZES, ...ICON_SIZES] },
    disabled: { control: "boolean" },
    label: { control: "text" },
  },
  args: {
    variant: "default",
    size: "default",
    disabled: false,
    label: "Button",
  },
  render: (args) => ({
    props: args,
    template: `<button soneBtn type="button" [variant]="variant" [size]="size" [disabled]="disabled">{{ label }}</button>`,
  }),
};
export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {};
export const Outline: Story = { args: { variant: "outline" } };
export const Destructive: Story = {
  args: { variant: "destructive", label: "Delete" },
};

export const Matrix: Story = {
  render: () => ({
    props: { variants: VARIANTS, sizes: TEXT_SIZES },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (v of variants; track v) {
          <div style="display: flex; align-items: center; gap: var(--space-2)">
            @for (s of sizes; track s) {
              <button soneBtn type="button" [variant]="v" [size]="s">{{ v }} · {{ s }}</button>
            }
          </div>
        }
      </div>`,
  }),
};

export const IconSizes: Story = {
  render: () => ({
    props: {
      pairs: TEXT_SIZES.map((s, i) => ({ text: s, icon: ICON_SIZES[i] })),
    },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-6)">
        @for (p of pairs; track p.text) {
          <div style="display: flex; align-items: center; gap: var(--space-2)">
            <button soneBtn type="button" variant="outline" [size]="p.text">{{ p.text }}</button>
            <button soneBtn type="button" variant="outline" [size]="p.icon" aria-label="Open">${ARROW}</button>
          </div>
        }
      </div>`,
  }),
};

export const WithIcon: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-2)">
        <button soneBtn type="button">${ARROW} Open note</button>
        <button soneBtn type="button" variant="outline" size="sm">${ARROW} Open</button>
        <button soneBtn type="button" variant="ghost" size="icon-sm" aria-label="Open">${ARROW}</button>
      </div>`,
  }),
};

export const AsLink: Story = {
  render: () => ({
    template: `<a soneBtn variant="link" href="https://spartan.ng/components/button">spartan docs</a>`,
  }),
};

export const Variants: Story = {
  render: () => ({
    props: { variants: VARIANTS },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (v of variants; track v) {
          <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2)">
            <button soneBtn type="button" [variant]="v">{{ v }}</button>
            <button soneBtn type="button" [variant]="v">${PLUS} New note</button>
            <button soneBtn type="button" [variant]="v" aria-haspopup="menu">Export ${CHEVRON}</button>
            <button soneBtn type="button" [variant]="v" aria-haspopup="menu" aria-expanded="true">Open ${CHEVRON}</button>
            <button soneBtn type="button" [variant]="v" disabled>Disabled</button>
            <button soneBtn type="button" [variant]="v" aria-disabled="true">aria-disabled</button>
          </div>
        }
      </div>`,
  }),
};

export const FullMatrix: Story = {
  render: () => ({
    props: { variants: VARIANTS, sizes: TEXT_SIZES, icons: ICON_SIZES },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (v of variants; track v) {
          <div style="display: flex; align-items: center; gap: var(--space-2)">
            @for (s of sizes; track s) {
              <button soneBtn type="button" [variant]="v" [size]="s">${PLUS} {{ s }}</button>
            }
            @for (s of icons; track s) {
              <button soneBtn type="button" [variant]="v" [size]="s" [attr.aria-label]="v + ' ' + s">${ARROW}</button>
            }
          </div>
        }
      </div>`,
  }),
};

export const DestructiveConfirm: Story = {
  render: () => ({
    template: `
      <div style="display: flex; justify-content: flex-end; gap: var(--space-2)">
        <button soneBtn type="button" variant="outline">Cancel</button>
        <button soneBtn type="button" variant="destructive">${TRASH} Delete meeting</button>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-3)">
        <div style="display: flex; gap: var(--space-2)">
          <button soneBtn type="button" disabled>Save</button>
          <button soneBtn type="button" variant="outline" disabled>Cancel</button>
          <button soneBtn type="button" variant="destructive" disabled>Delete</button>
          <button soneBtn type="button" variant="ghost" size="icon" disabled aria-label="Open">${ARROW}</button>
        </div>
        <div style="display: flex; gap: var(--space-2)">
          <button soneBtn type="button" variant="outline" aria-invalid="true" aria-haspopup="listbox">Choose a folder ${CHEVRON}</button>
          <button soneBtn type="button" variant="outline" aria-haspopup="menu" aria-expanded="true">Sort: newest ${CHEVRON}</button>
          <button soneBtn type="button" variant="secondary" aria-haspopup="menu" aria-expanded="true">Filters ${CHEVRON}</button>
          <button soneBtn type="button" aria-haspopup="menu" aria-expanded="true">Create ${CHEVRON}</button>
          <button soneBtn type="button" variant="ghost" aria-haspopup="menu" aria-expanded="true">More ${CHEVRON}</button>
        </div>
      </div>`,
  }),
};

export const LinkAndLabel: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-3)">
        <div style="display: flex; gap: var(--space-2)">
          <a soneBtn variant="outline" href="https://spartan.ng/components/button" target="_blank" rel="noopener">Open docs</a>
          <a soneBtn variant="outline" href="https://spartan.ng/components/button" aria-disabled="true">Disabled link</a>
          <a soneBtn variant="link" href="https://spartan.ng/components/button">spartan docs</a>
        </div>
        <div style="display: flex; gap: var(--space-2)">
          <label soneBtn variant="ghost" size="sm">
            ${PLUS} Attach file
            <input type="file" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap" />
          </label>
          <label soneBtn variant="ghost" size="sm" aria-disabled="true">
            ${PLUS} Attach (disabled)
            <input type="file" style="position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap" tabindex="-1" />
          </label>
        </div>
      </div>`,
  }),
};

export const StyleMetrics: Story = {
  decorators: [moduleMetadata({ imports: [SoneIconComponent] })],
  render: () => ({
    props: {
      pairs: TEXT_SIZES.map((s, i) => ({ text: s, icon: ICON_SIZES[i] })),
    },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (p of pairs; track p.text) {
          <div style="display: flex; align-items: center; gap: var(--space-2)">
            <button soneBtn type="button" [size]="p.text">{{ p.text }}</button>
            <button soneBtn type="button" variant="outline" [size]="p.text"><sone-icon icon="plus" inline="start" /> New</button>
            <button soneBtn type="button" variant="secondary" [size]="p.text" aria-haspopup="menu">More ${CHEVRON}</button>
            <button soneBtn type="button" variant="ghost" [size]="p.icon" aria-label="Search"><sone-icon icon="search" /></button>
            <button soneBtn type="button" variant="outline" [size]="p.icon" aria-label="Settings"><sone-icon icon="settings" /></button>
          </div>
        }
      </div>`,
  }),
};
