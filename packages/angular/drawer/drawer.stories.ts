import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_DIALOG_PARTS } from "@surface-one/angular/dialog";
import { SoneDrawerComponent } from "./drawer.component";

const meta: Meta = {
  title: "Components/Overlays/Drawer",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [SoneButtonDirective, SoneDrawerComponent, ...SONE_DIALOG_PARTS],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-drawer>` — shadcn/ui Drawer (Vaul) on the sheet's overlay: a modal panel from the " +
          '`bottom` (or `side="top|left|right"`) with a drag handle. Everything the sheet does — focus ' +
          "moves in and is trapped, Escape and the scrim dismiss it, focus returns to the opener, " +
          "`[(open)]` or `@if` + `(dismiss)` — plus a pointer swipe toward its edge that dismisses it " +
          "past a quarter of its size or on a flick (buttons, links and fields inside do not start one, " +
          "nor does content scrolled away from the top). `snapPoints` (visible fractions, ascending: " +
          "`[0.5, 1]`) let it rest part-open, two-way as `[(activeSnapPoint)]`; the handle cycles them " +
          "and keyboard focus inside opens it fully. No corner close by default (`showClose`); the " +
          "parts are `soneDrawerHeader` / `soneDrawerTitle` / `soneDrawerDescription` / " +
          "`soneDrawerFooter` / `soneDrawerClose` (`SONE_DIALOG_PARTS`). Reduced motion: it moves " +
          "without animating." +
          "\n\n**Reference**\n" +
          "- shadcn/ui — [drawer](https://ui.shadcn.com/docs/components/drawer)\n" +
          "- spartan/ui — [sheet](https://spartan.ng/components/sheet)\n" +
          "- Nuxt UI — [Drawer](https://ui.nuxt.com/docs/components/drawer)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const BODY = `
  <header soneDrawerHeader>
    <h2 soneDrawerTitle>Move goal</h2>
    <p soneDrawerDescription>Set your daily activity goal.</p>
  </header>
  <div style="padding-inline: var(--space-4); font-size: var(--font-size-3xl); font-weight: var(--font-weight-bold); text-align: center">350 kcal/day</div>
  <footer soneDrawerFooter>
    <button soneBtn type="button" (click)="open.set(false)">Submit</button>
    <button soneBtn variant="outline" type="button" (click)="open.set(false)">Cancel</button>
  </footer>`;

export const Default: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open drawer</button>
      <sone-drawer [open]="open()" (openChange)="open.set($event)">${BODY}</sone-drawer>`,
  }),
};

export const SnapPoints: Story = {
  render: () => ({
    props: { open: signal(false), snap: signal<number | null>(0.5) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open drawer</button>
      <sone-drawer [open]="open()" (openChange)="open.set($event)" [snapPoints]="[0.5, 1]"
        [activeSnapPoint]="snap()" (activeSnapPointChange)="snap.set($event)">${BODY}</sone-drawer>`,
  }),
};

export const Right: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open from the right</button>
      <sone-drawer side="right" showClose [open]="open()" (openChange)="open.set($event)">${BODY}</sone-drawer>`,
  }),
};
