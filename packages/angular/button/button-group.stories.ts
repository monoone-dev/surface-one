import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_INPUT_GROUP_PARTS } from "@surface-one/angular/input";
import { SoneSeparatorDirective } from "@surface-one/angular/separator";
import { SoneButtonDirective } from "./button.directive";
import { SoneButtonGroupDirective } from "./button-group.directive";

const CHEVRON = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>`;
const NOTE = `<svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M4 2.7h6l3.8 3.8v8.8H4V2.7Z"
  stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M10 2.7v3.8h3.8M6.5 10h5M6.5 12.5h3.7"
  stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>`;
const BACK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3.5 5.5 8l4.5 4.5"/></svg>`;
const FWD = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3.5 10.5 8 6 12.5"/></svg>`;

const meta: Meta = {
  title: "Components/Actions/Button Group",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneButtonDirective,
        SoneButtonGroupDirective,
        SoneSeparatorDirective,
        ...SONE_INPUT_GROUP_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneButtonGroup]` — spartan/ui Button Group (https://spartan.ng/components/button-group). " +
          "Joins its `soneBtn` children (and a native input / select or a `[soneInputGroup]`) into one " +
          "shape: inner corners squared, outline hairlines shared, filled buttons split by a 1px seam of " +
          "page (2px on Studio / Paper). `orientation` = `horizontal` (default) | `vertical`. " +
          "`[soneSeparator]` inside becomes a full-height divider; nested groups are spaced, not joined. " +
          "Give the group an `aria-label` when its buttons do not name the whole.\n\n" +
          "**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/button-group](https://spartan.ng/components/button-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/button-group](https://ui.shadcn.com/docs/components/button-group)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <div soneButtonGroup aria-label="Meeting actions">
        <button soneBtn type="button" variant="outline">Archive</button>
        <button soneBtn type="button" variant="outline">Share</button>
        <button soneBtn type="button" variant="outline">Export</button>
      </div>`,
  }),
};

export const SplitButton: Story = {
  render: () => ({
    props: { open: false },
    template: `
      <div style="display: flex; gap: var(--space-6); align-items: center">
        <div soneButtonGroup aria-label="Convert to note">
          <button soneBtn type="button" size="icon" aria-label="Convert to note">${NOTE}</button>
          <button soneBtn type="button" size="icon" aria-label="Choose note template"
            aria-haspopup="menu" [attr.aria-expanded]="open" (click)="open = !open">${CHEVRON}</button>
        </div>
        <div soneButtonGroup aria-label="Convert to note">
          <button soneBtn type="button">${NOTE} Convert to note</button>
          <button soneBtn type="button" size="icon" aria-label="Choose note template" aria-haspopup="menu">${CHEVRON}</button>
        </div>
        <div soneButtonGroup aria-label="Export">
          <button soneBtn type="button" variant="outline" size="sm">Export</button>
          <button soneBtn type="button" variant="outline" size="icon-sm" aria-label="Export options" aria-haspopup="menu">${CHEVRON}</button>
        </div>
        <div soneButtonGroup aria-label="Convert to note (disabled)">
          <button soneBtn type="button" size="icon" disabled aria-label="Convert to note">${NOTE}</button>
          <button soneBtn type="button" size="icon" disabled aria-label="Choose note template" aria-haspopup="menu">${CHEVRON}</button>
        </div>
      </div>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    props: { sizes: ["xs", "sm", "default", "lg"] },
    template: `
      <div style="display: grid; gap: var(--space-3)">
        @for (s of sizes; track s) {
          <div style="display: flex; gap: var(--space-4)">
            <div soneButtonGroup [attr.aria-label]="'Outline ' + s">
              <button soneBtn type="button" variant="outline" [size]="s">Day</button>
              <button soneBtn type="button" variant="outline" [size]="s">Week</button>
              <button soneBtn type="button" variant="outline" [size]="s">Month</button>
            </div>
            <div soneButtonGroup [attr.aria-label]="'Secondary ' + s">
              <button soneBtn type="button" variant="secondary" [size]="s">Copy</button>
              <span soneSeparator orientation="vertical"></span>
              <button soneBtn type="button" variant="secondary" [size]="s">Paste</button>
            </div>
          </div>
        }
      </div>`,
  }),
};

export const IconSizes: Story = {
  render: () => ({
    props: { sizes: ["icon-xs", "icon-sm", "icon", "icon-lg"] },
    template: `
      <div style="display: flex; align-items: center; gap: var(--space-4)">
        @for (s of sizes; track s) {
          <div soneButtonGroup [attr.aria-label]="'History ' + s">
            <button soneBtn type="button" variant="outline" [size]="s" aria-label="Back">${BACK}</button>
            <button soneBtn type="button" variant="outline" [size]="s" aria-label="Forward">${FWD}</button>
          </div>
        }
      </div>`,
  }),
};

export const Nested: Story = {
  render: () => ({
    template: `
      <div soneButtonGroup aria-label="Pager">
        <div soneButtonGroup>
          <button soneBtn type="button" variant="outline" size="icon-sm" aria-label="Previous">${BACK}</button>
          <button soneBtn type="button" variant="outline" size="icon-sm" aria-label="Next">${FWD}</button>
        </div>
        <div soneButtonGroup>
          <button soneBtn type="button" variant="outline" size="sm">1</button>
          <button soneBtn type="button" variant="outline" size="sm" aria-current="page">2</button>
          <button soneBtn type="button" variant="outline" size="sm">3</button>
        </div>
      </div>`,
  }),
};

export const Vertical: Story = {
  render: () => ({
    template: `
      <div soneButtonGroup orientation="vertical" aria-label="Zoom">
        <button soneBtn type="button" variant="outline" size="icon" aria-label="Zoom in">+</button>
        <button soneBtn type="button" variant="outline" size="icon" aria-label="Zoom out">−</button>
      </div>`,
  }),
};

export const VerticalWithSeparator: Story = {
  render: () => ({
    template: `
      <div soneButtonGroup orientation="vertical" aria-label="Text size">
        <button soneBtn type="button" variant="secondary" size="sm">Larger</button>
        <span soneSeparator></span>
        <button soneBtn type="button" variant="secondary" size="sm">Smaller</button>
      </div>`,
  }),
};

export const WithInput: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: var(--space-3); max-width: 24rem">
        <div soneButtonGroup aria-label="Search">
          <input aria-label="Search notes" placeholder="Search…" />
          <button soneBtn type="button" variant="outline">Search</button>
        </div>
        <div soneButtonGroup aria-label="Invite">
          <div soneInputGroup>
            <span soneInputGroupAddon>@</span>
            <input soneInputGroupInput aria-label="Email" placeholder="name@example.com" />
          </div>
          <button soneBtn type="button" variant="outline">Invite</button>
        </div>
      </div>`,
  }),
};
