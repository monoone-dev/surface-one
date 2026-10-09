import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_CHOICE_CARD_PARTS } from "./choice-card.directive";

const meta: Meta = {
  title: "Components/Forms/Choice card",
  tags: ["autodocs"],
  decorators: [moduleMetadata({ imports: [...SONE_CHOICE_CARD_PARTS] })],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneChoiceCard]` — spartan/ui Radio Group choice card: the whole card is the option. " +
          'Wrap the set in `[soneChoiceGroup]` (a `role="radiogroup"`): every card becomes a radio ' +
          "with `aria-checked`, the set has ONE tab stop, and Arrow/Home/End move + select. Parts: " +
          "`soneChoiceCardTitle`, `soneChoiceCardDescription`, optional `soneChoiceCardIndicator` (the " +
          "radio mark — a shape cue for the checked state). `orientation` vertical | horizontal." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/radio-group](https://spartan.ng/components/radio-group)\n" +
          "- spartan/ui — [https://spartan.ng/components/field](https://spartan.ng/components/field)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/radio-group](https://ui.shadcn.com/docs/components/radio-group)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/field](https://ui.shadcn.com/docs/components/field)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const ACCESS = [
  {
    id: "view",
    title: "View only",
    copy: "Members can read and search everything in this space.",
  },
  {
    id: "edit",
    title: "Can edit",
    copy: "Members can also edit the notes inside it.",
  },
];

export const Vertical: Story = {
  render: () => {
    const value = signal("view");
    return {
      props: { value, options: ACCESS },
      template: `
        <div soneChoiceGroup aria-label="Member access"
          style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2); max-width: 32rem">
          @for (o of options; track o.id) {
            <button soneChoiceCard type="button" [selected]="value() === o.id" (click)="value.set(o.id)">
              <span soneChoiceCardTitle>{{ o.title }}</span>
              <span soneChoiceCardDescription>{{ o.copy }}</span>
              <span soneChoiceCardIndicator></span>
            </button>
          }
        </div>`,
    };
  },
};

export const Horizontal: Story = {
  render: () => {
    const value = signal("p1");
    return {
      props: {
        value,
        options: [
          { id: "p1", title: "Product", copy: "Project · 12 notes" },
          { id: "f1", title: "Hiring", copy: "Folder in Product · 4 notes" },
          { id: "f2", title: "Board", copy: "Folder · 9 notes" },
        ],
      },
      template: `
        <div soneChoiceGroup orientation="vertical" aria-label="Destination"
          style="display: grid; gap: var(--space-2); max-width: 26rem">
          @for (o of options; track o.id) {
            <button soneChoiceCard orientation="horizontal" type="button"
              [selected]="value() === o.id" (click)="value.set(o.id)">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 4.5h4l1.5 1.5H14v6.5H2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" />
              </svg>
              <span style="display: grid; gap: var(--choice-card-gap)">
                <span soneChoiceCardTitle>{{ o.title }}</span>
                <span soneChoiceCardDescription>{{ o.copy }}</span>
              </span>
              <span soneChoiceCardIndicator></span>
            </button>
          }
        </div>`,
    };
  },
};

export const States: Story = {
  render: () => ({
    template: `
      <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 14rem)); gap: var(--space-3)">
        <button soneChoiceCard type="button" role="radio">
          <span soneChoiceCardTitle>Unchecked</span>
          <span soneChoiceCardDescription>Hover for the muted ground.</span>
          <span soneChoiceCardIndicator></span>
        </button>
        <button soneChoiceCard type="button" role="radio" selected>
          <span soneChoiceCardTitle>Checked</span>
          <span soneChoiceCardDescription>Primary edge on a primary tint.</span>
          <span soneChoiceCardIndicator></span>
        </button>
        <button soneChoiceCard type="button" role="radio" disabled>
          <span soneChoiceCardTitle>Disabled</span>
          <span soneChoiceCardDescription>Not available on this Mac.</span>
          <span soneChoiceCardIndicator></span>
        </button>
        <button soneChoiceCard type="button" role="radio" selected disabled>
          <span soneChoiceCardTitle>Disabled + checked</span>
          <span soneChoiceCardDescription>Locked while a change applies.</span>
          <span soneChoiceCardIndicator></span>
        </button>
      </div>`,
  }),
};

export const PostureNoIndicator: Story = {
  render: () => {
    const value = signal("hybrid");
    return {
      props: {
        value,
        options: [
          {
            id: "cloud",
            title: "Cloud",
            copy: "Your Default engine does everything",
            disabled: false,
          },
          {
            id: "hybrid",
            title: "Hybrid",
            copy: "Cloud notes + realtime reactions on this Mac",
            disabled: false,
          },
          {
            id: "local",
            title: "Fully local",
            copy: "Nothing leaves this Mac",
            disabled: true,
          },
        ],
      },
      template: `
        <div soneChoiceGroup aria-label="Assistant posture"
          style="display: flex; flex-wrap: wrap; gap: var(--space-2); max-width: 40rem">
          @for (o of options; track o.id) {
            <button soneChoiceCard type="button" style="flex: 1 1 140px"
              [selected]="value() === o.id" [disabled]="o.disabled" (click)="value.set(o.id)">
              <span soneChoiceCardTitle>{{ o.title }}</span>
              <span soneChoiceCardDescription>{{ o.copy }}</span>
            </button>
          }
        </div>`,
    };
  },
};

export const Standalone: Story = {
  render: () => {
    const on = signal(false);
    return {
      props: { on },
      template: `
        <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 14rem)); gap: var(--space-3)">
          <button soneChoiceCard type="button" [selected]="on()" (click)="on.set(!on())">
            <span soneChoiceCardTitle>Remind me</span>
            <span soneChoiceCardDescription>Toggles on click (aria-pressed).</span>
            <span soneChoiceCardIndicator></span>
          </button>
          <button soneChoiceCard type="button" aria-disabled="true">
            <span soneChoiceCardTitle>aria-disabled</span>
            <span soneChoiceCardDescription>Focusable, but reads and looks disabled.</span>
            <span soneChoiceCardIndicator></span>
          </button>
        </div>`,
    };
  },
};
