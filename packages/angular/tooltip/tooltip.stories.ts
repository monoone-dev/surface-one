import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  type TooltipAlign,
  type TooltipSide,
  SoneTooltipDirective,
} from "./tooltip.directive";

interface TooltipArgs {
  text: string;
  side: TooltipSide;
  align: TooltipAlign;
  arrow: boolean;
  disabled: boolean;
  showDelay: number;
}

const meta: Meta<TooltipArgs> = {
  title: "Components/Overlays/Tooltip",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneButtonDirective, SoneTooltipDirective, SoneIconComponent],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneTooltip]` — a styled hover/focus tooltip for an icon-only control (spartan/ui Tooltip). It appears " +
          "after `soneTooltipShowDelay` (350 ms), on keyboard focus too, and hides on click or Escape.\n\n" +
          "- `soneTooltipSide` = `top` | `right` | `bottom` (default) | `left` — flips when it does not fit.\n" +
          "- `soneTooltipAlign` = `start` | `center` (default) | `end`.\n" +
          "- `soneTooltipArrow` (default `true`), `soneTooltipDisabled`.\n\n" +
          "It **replaces** `title` (a host `title` is stripped and adopted) so the OS never draws a second bubble. " +
          "It is **not** the accessible name: the bubble is `aria-hidden`, so keep the control’s `aria-label`. " +
          "The core bubble is shadcn's inverted one (foreground ground, background ink); Studio / Paper re-declare " +
          "the `--tooltip-*` tokens to the opaque overlay surface. It is created on `<body>` so " +
          "transformed ancestors cannot offset it.\n\n" +
          "Metrics are shadcn's in every style — px-3 py-1.5, 12px text, a 10px arrow — except the corner: " +
          "rounded-md on Studio (Vega) and Minimalist (Nova), rounded-2xl on Paper (Maia). Ground, ink, " +
          "hairline, corner, weight, shadow, alignment and arrow inset are `--tooltip-*` style tokens. It enters with shadcn's fade + " +
          "zoom-95 + 8px slide from the anchor side; Escape anywhere dismisses it." +
          "\n\n**Reference**\n\n" +
          "- spartan/ui — [https://spartan.ng/components/tooltip](https://spartan.ng/components/tooltip)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/tooltip](https://ui.shadcn.com/docs/components/tooltip)",
      },
    },
  },
  argTypes: {
    text: { control: "text" },
    side: {
      control: "inline-radio",
      options: ["top", "right", "bottom", "left"],
    },
    align: { control: "inline-radio", options: ["start", "center", "end"] },
    arrow: { control: "boolean" },
    disabled: { control: "boolean" },
    showDelay: { control: { type: "number", min: 0, step: 50 } },
  },
  args: {
    text: "Lock all unlocked folders",
    side: "bottom",
    align: "center",
    arrow: true,
    disabled: false,
    showDelay: 350,
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; gap: var(--space-3); padding: var(--space-8)">
        <button soneBtn variant="ghost" size="icon" type="button" aria-label="Lock all"
          [soneTooltip]="text" [soneTooltipSide]="side" [soneTooltipAlign]="align"
          [soneTooltipArrow]="arrow" [soneTooltipDisabled]="disabled" [soneTooltipShowDelay]="showDelay">
          <sone-icon icon="lock" />
        </button>
        <button soneBtn variant="ghost" size="icon" type="button" soneTooltip="New note (⌘N)" aria-label="New note"
          [soneTooltipSide]="side" [soneTooltipAlign]="align" [soneTooltipArrow]="arrow">
          <sone-icon icon="note-add" />
        </button>
        <button soneBtn variant="ghost" size="icon" type="button" soneTooltip="Move to trash" aria-label="Move to trash"
          [soneTooltipSide]="side" [soneTooltipAlign]="align" [soneTooltipArrow]="arrow">
          <sone-icon icon="trash" />
        </button>
      </div>`,
  }),
};
export default meta;
type Story = StoryObj<TooltipArgs>;

export const IconButtons: Story = {};

export const Sides: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(3, auto); justify-content: center; gap: var(--space-3); padding: var(--space-8)">
        <span></span>
        <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens above" soneTooltipSide="top">Top</button>
        <span></span>
        <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens to the left" soneTooltipSide="left">Left</button>
        <span></span>
        <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens to the right" soneTooltipSide="right">Right</button>
        <span></span>
        <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Opens below (default)">Bottom</button>
        <span></span>
      </div>`,
  }),
};

export const Align: Story = {
  render: () => ({
    template: `
      <div style="display: flex; justify-content: center; gap: var(--space-6); padding: var(--space-8)">
        <button soneBtn variant="outline" type="button" soneTooltip="Aligned with the start edge of the control" soneTooltipAlign="start">Start</button>
        <button soneBtn variant="outline" type="button" soneTooltip="Centred on the control" soneTooltipAlign="center">Center</button>
        <button soneBtn variant="outline" type="button" soneTooltip="Aligned with the end edge of the control" soneTooltipAlign="end">End</button>
      </div>`,
  }),
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-3); padding: var(--space-8)">
        <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Plain bubble" [soneTooltipArrow]="false">No arrow</button>
        <button soneBtn variant="outline" size="sm" type="button" soneTooltip="You should never see this" [soneTooltipDisabled]="true">Disabled tooltip</button>
        <button soneBtn variant="outline" size="sm" type="button" soneTooltip="Shown instantly" [soneTooltipShowDelay]="0">No delay</button>
      </div>`,
  }),
};

export const EdgeClamp: Story = {
  render: () => ({
    template: `
      <div style="display: flex; justify-content: space-between; padding: var(--space-8) 0">
        <button soneBtn variant="ghost" size="icon" type="button" aria-label="Settings"
          soneTooltip="A deliberately long explanation that cannot be centred on this control">
          <sone-icon icon="settings" />
        </button>
        <button soneBtn variant="ghost" size="icon" type="button" aria-label="Search"
          soneTooltip="A deliberately long explanation that cannot be centred on this control">
          <sone-icon icon="search" />
        </button>
      </div>`,
  }),
};

export const Anatomy: Story = {
  parameters: { controls: { disable: true } },
  render: () => ({
    props: { sides: ["top", "right", "bottom", "left"] },
    template: `
      <div style="display: flex; flex-wrap: wrap; gap: var(--space-6); padding: var(--space-5)">
        @for (s of sides; track s) {
          <div class="sone-tooltip" data-arrow [attr.data-side]="s"
            style="position: relative; z-index: auto; --sone-tooltip-arrow-at: 50%">Lock all ({{ s }})</div>
        }
      </div>`,
  }),
};
