import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_DIALOG_PARTS } from "@surface-one/angular/dialog";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneSheetComponent } from "./sheet.component";

const meta: Meta = {
  title: "Components/Overlays/Sheet",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneButtonDirective,
        SoneIconComponent,
        SoneSheetComponent,
        ...SONE_DIALOG_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-sheet>` — spartan/ui Sheet: a modal panel docked to one edge of the window over " +
          'a dimmed scrim. `side="top|right|bottom|left"` (default `right`); left/right sheets ' +
          'are 3/4 of the window capped at 24rem (`size="lg"`: 32rem), top/bottom span the ' +
          "window (capped at 85vh). Anatomy: `soneSheetHeader` › `soneSheetTitle` + " +
          "`soneSheetDescription`, body, `soneSheetFooter` (the `soneDialog*` parts, same " +
          "directives). The caller renders it with `@if` and closes it on `(dismiss)` — Escape, " +
          'a scrim click (`[scrimCloses]="false"` turns that off) or the corner close ' +
          '(`[showClose]="false"` hides it); `[dismissible]="false"` holds it open while a save ' +
          "is in flight. Tab is trapped, focus returns on close. The footer is sticky and the " +
          "corner close stays put while a long body scrolls. shadcn's Drawer is the bottom " +
          'sheet (`side="bottom"`), without a drag handle.' +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/sheet](https://spartan.ng/components/sheet)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/sheet](https://ui.shadcn.com/docs/components/sheet), " +
          "[drawer](https://ui.shadcn.com/docs/components/drawer)",
      },
    },
  },
};
export default meta;
type Story = StoryObj;

const LONG_BODY = Array.from(
  { length: 14 },
  (_, i) =>
    `<p style="margin: 0">Paragraph ${i + 1}. Decisions, owners and dates from the meeting stay ` +
    `with the note; the transcript is the source every line links back to.</p>`,
).join("");

export const Sides: Story = {
  render: () => ({
    props: {
      pick: signal<{ side: string; size: string } | null>(null),
      cases: ["right", "left", "top", "bottom"].flatMap((side) =>
        ["default", "lg"].map((size) => ({ side, size })),
      ),
    },
    template: `
      <div style="display: flex; gap: var(--space-2); flex-wrap: wrap">
        @for (c of cases; track c.side + c.size) {
          <button soneBtn variant="outline" type="button" (click)="pick.set(c)">{{ c.side }} · {{ c.size }}</button>
        }
      </div>
      @if (pick(); as p) {
        <sone-sheet [side]="$any(p.side)" [size]="$any(p.size)" (dismiss)="pick.set(null)">
          <header soneSheetHeader>
            <h2 soneSheetTitle>Edit profile</h2>
            <p soneSheetDescription>Make changes to your profile here. Click save when you're done.</p>
          </header>
          <div style="display: flex; flex-direction: column; gap: var(--space-3)">
            <input type="text" value="Alex Morgan" aria-label="Name" autofocus />
            <input type="email" value="alex@example.com" aria-label="Email" />
          </div>
          <footer soneSheetFooter>
            <button soneBtn type="button" (click)="pick.set(null)">Save changes</button>
            <button soneBtn variant="outline" type="button" (click)="pick.set(null)">Cancel</button>
          </footer>
        </sone-sheet>
      }`,
  }),
};

export const Scrolling: Story = {
  render: () => ({
    props: { side: signal<string | null>(null), sides: ["right", "bottom"] },
    template: `
      <div style="display: flex; gap: var(--space-2)">
        @for (s of sides; track s) {
          <button soneBtn variant="outline" type="button" (click)="side.set(s)">long {{ s }} sheet</button>
        }
      </div>
      @if (side(); as s) {
        <sone-sheet [side]="$any(s)" (dismiss)="side.set(null)">
          <form (submit)="$event.preventDefault(); side.set(null)">
            <header soneSheetHeader>
              <h2 soneSheetTitle>Meeting notes</h2>
              <p soneSheetDescription>Inside a &lt;form&gt;: Enter submits.</p>
            </header>
            <div style="display: flex; flex-direction: column; gap: var(--space-3)">${LONG_BODY}</div>
            <footer soneSheetFooter>
              <button soneBtn type="submit">Save</button>
              <button soneBtn variant="outline" type="button" (click)="side.set(null)">Cancel</button>
            </footer>
          </form>
        </sone-sheet>
      }`,
  }),
};

export const NoCloseButton: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open filters</button>
      @if (open()) {
        <sone-sheet side="left" [showClose]="false" [scrimCloses]="false" (dismiss)="open.set(false)">
          <header soneSheetHeader>
            <h2 soneSheetTitle>Filters</h2>
            <p soneSheetDescription>Escape still closes it.</p>
          </header>
          <footer soneSheetFooter>
            <button soneBtn type="button" data-autofocus (click)="open.set(false)">Apply</button>
          </footer>
        </sone-sheet>
      }`,
  }),
};

export const Busy: Story = {
  render: () => ({
    props: { open: signal(false), busy: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open</button>
      @if (open()) {
        <sone-sheet [dismissible]="!busy()" (dismiss)="open.set(false)">
          <header soneSheetHeader>
            <h2 soneSheetTitle>Export notes</h2>
            <p soneSheetDescription>{{ busy() ? 'Exporting… the sheet stays open until it finishes.' : 'Press Export, then try Escape.' }}</p>
          </header>
          <footer soneSheetFooter>
            <button soneBtn type="button" [disabled]="busy()" (click)="busy.set(true)">{{ busy() ? 'Exporting…' : 'Export' }}</button>
            <button soneBtn variant="outline" type="button" (click)="busy.set(false); open.set(false)">Finish</button>
          </footer>
        </sone-sheet>
      }`,
  }),
};

export const AriaLabel: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open</button>
      @if (open()) {
        <sone-sheet side="bottom" ariaLabel="Share options" (dismiss)="open.set(false)">
          <div style="display: flex; gap: var(--space-2); padding-block: var(--space-4)">
            <button soneBtn variant="outline" type="button" data-autofocus (click)="open.set(false)">
              <sone-icon icon="copy" /> Copy link
            </button>
          </div>
        </sone-sheet>
      }`,
  }),
};
