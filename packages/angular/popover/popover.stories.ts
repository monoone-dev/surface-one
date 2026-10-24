import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_FIELD_PARTS } from "@surface-one/angular/input";
import { SONE_POPOVER_PARTS } from "./popover.directive";

const FIELDS = `
  <div soneField>
    <label soneFieldLabel for="{{ id }}-width">Width</label>
    <input id="{{ id }}-width" type="text" value="100%" />
  </div>
  <div soneField>
    <label soneFieldLabel for="{{ id }}-height">Height</label>
    <input id="{{ id }}-height" type="text" value="25px" />
  </div>`;

const meta: Meta = {
  title: "Components/Overlays/Popover",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_POPOVER_PARTS,
        ...SONE_FIELD_PARTS,
        SoneButtonDirective,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "spartan/ui Popover. `[sonePopoverTrigger]` (brnPopoverTrigger) opens a non-modal panel " +
          "next to its host: pass an `<ng-template>` (`let-close` closes it) or a `[sonePopover]` " +
          '(alias `[sonePopoverContent]`) by reference (`#pop="sonePopover"`). It has `side`, ' +
          "`align`, `offset`, `[(open)]` and `keepOpenOnOutsideClick`; the trigger carries " +
          '`aria-haspopup="dialog"`, `aria-expanded` and `aria-controls`. The panel is rendered ' +
          "into a layer on `<body>`, placed with `computeFloatingPosition` (it flips and stays in " +
          "the viewport, re-placed on scroll / resize), takes focus (`autofocus`, else its first " +
          "control), sits right after the trigger in the Tab order, and closes on Escape and on a " +
          "click outside, giving focus back to the trigger. `[sonePopover]` is " +
          '`role="dialog"` by default — name it with `aria-labelledby` — and has a header, title ' +
          "and description. Inside `sone-dialog` / `sone-sheet` the panel joins the dialog's " +
          "focus trap. Also exported from `@surface-one/angular/menu`, where it used to live." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/popover](https://spartan.ng/components/popover)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/popover](https://ui.shadcn.com/docs/components/popover)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    props: { id: "pop" },
    template: `
      <div style="min-height: 18rem">
        <button soneBtn variant="outline" type="button" [sonePopoverTrigger]="pop">Dimensions</button>
        <ng-template #pop let-close="close">
          <div sonePopoverContent aria-labelledby="pop-title">
            <div sonePopoverHeader>
              <p sonePopoverTitle id="pop-title">Dimensions</p>
              <p sonePopoverDescription>Set the dimensions for the layer.</p>
            </div>
            ${FIELDS}
            <button soneBtn size="sm" type="button" (click)="close()">Apply</button>
          </div>
        </ng-template>
      </div>`,
  }),
};

export const Placement: Story = {
  render: () => ({
    template: `
      <div style="display: flex; gap: var(--space-3); justify-content: center; padding: 8rem 0">
        @for (side of ['top', 'right', 'bottom', 'left']; track side) {
          <button soneBtn variant="outline" type="button" [sonePopoverTrigger]="tip" [side]="$any(side)" align="center">{{ side }}</button>
        }
        <ng-template #tip>
          <div sonePopover aria-label="Placement" style="width: auto">
            <p sonePopoverDescription>Flips when that side lacks room.</p>
          </div>
        </ng-template>
      </div>`,
  }),
};

export const ByReference: Story = {
  render: () => ({
    props: { id: "ref", open: false },
    template: `
      <div style="min-height: 18rem">
        <button soneBtn variant="outline" type="button" [sonePopoverTrigger]="panel" [(open)]="open">
          Dimensions ({{ open ? 'open' : 'closed' }})
        </button>
        <div sonePopover #panel="sonePopover" aria-labelledby="ref-title">
          <div sonePopoverHeader>
            <p sonePopoverTitle id="ref-title">Dimensions</p>
          </div>
          ${FIELDS}
        </div>
      </div>`,
  }),
};

export const Surface: Story = {
  render: () => ({
    props: { id: "surface" },
    template: `
      <div sonePopover aria-labelledby="surface-title">
        <div sonePopoverHeader>
          <p sonePopoverTitle id="surface-title">Dimensions</p>
          <p sonePopoverDescription>Set the dimensions for the layer.</p>
        </div>
        ${FIELDS}
        <button soneBtn size="sm" type="button">Apply</button>
      </div>`,
  }),
};
