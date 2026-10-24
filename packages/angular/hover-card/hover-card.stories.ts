import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_AVATAR_PARTS } from "@surface-one/angular/avatar";
import { SONE_HOVER_CARD_PARTS } from "./hover-card.directive";

const meta: Meta = {
  title: "Components/Overlays/Hover Card",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_HOVER_CARD_PARTS, ...SONE_AVATAR_PARTS],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneHoverCardTrigger]` + `[soneHoverCard]` (`soneHoverCardContent`) — a preview card for " +
          "sighted pointer and keyboard users, built on the popover layer: it opens `openDelay` ms (700) " +
          "after the pointer rests on, or focus reaches, the trigger, stays open while the pointer is on the " +
          "trigger or the card, and closes `closeDelay` ms (300) after it leaves, on Escape or on a click " +
          "outside. Non-modal: no focus trap and focus stays on the trigger, which is `aria-describedby` the " +
          "card while it shows. On a touch screen the first tap opens the card, the next follows the link. " +
          "`side`, `align` (`center`), `offset`, `[(open)]`, `openOnFocus`. Keep what the card says " +
          "reachable another way: screen readers may never hear it." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [hover-card](https://spartan.ng/components/hover-card)\n" +
          "- shadcn/ui — [hover-card](https://ui.shadcn.com/docs/components/hover-card)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => ({
    template: `
      <div style="min-height: 14rem; padding: var(--space-4)">
        Built by
        <a href="#profile" [soneHoverCardTrigger]="card" [openDelay]="200">&#64;lukas</a>
        and contributors.
        <ng-template #card>
          <div soneHoverCard>
            <div style="display: flex; gap: var(--space-3)">
              <sone-avatar><span soneAvatarFallback>LS</span></sone-avatar>
              <div style="display: flex; flex-direction: column; gap: var(--space-1)">
                <strong>&#64;lukas</strong>
                <span>Design systems, Angular and the odd typeface.</span>
                <span style="color: var(--text-muted); font-size: var(--font-size-xs)">Joined March 2021</span>
              </div>
            </div>
          </div>
        </ng-template>
      </div>`,
  }),
};

export const OpenOnTheRight: Story = {
  render: () => ({
    props: { open: true },
    template: `
      <div style="min-height: 10rem; padding: var(--space-4)">
        <a href="#" [soneHoverCardTrigger]="card" side="right" align="start" [(open)]="open">Release 0.25</a>
        <div soneHoverCard #card="soneHoverCard">
          Six new families: context menu, menubar, navigation menu, hover card, file upload and textarea.
        </div>
      </div>`,
  }),
};
