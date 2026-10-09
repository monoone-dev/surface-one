import { signal } from "@angular/core";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SoneSheetComponent } from "@surface-one/angular/sheet";
import { SONE_DIALOG_PARTS } from "./dialog-parts.directive";
import {
  SoneAlertDialogComponent,
  SoneDialogComponent,
} from "./dialog.component";

const meta: Meta = {
  title: "Components/Overlays/Dialog",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        SoneButtonDirective,
        SoneIconComponent,
        SoneDialogComponent,
        SoneAlertDialogComponent,
        SoneSheetComponent,
        ...SONE_DIALOG_PARTS,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`<sone-dialog>`, `<sone-alert-dialog>` and `<sone-sheet>` — spartan/ui Dialog, Alert " +
          "Dialog and Sheet (https://spartan.ng/components/dialog). The caller renders one with " +
          "`@if` and closes it on `(dismiss)` (Escape, scrim click, corner close). Anatomy: " +
          "`soneDialogHeader` › `soneDialogMedia` (optional icon tile) + `soneDialogTitle` + " +
          "`soneDialogDescription`, body, `soneDialogFooter`. The title names the panel " +
          "(`aria-labelledby`), the first description describes it (`aria-describedby`). " +
          "Dialog sizes: `xs` 20rem · `sm` 24rem (default) · `md` 28rem · `lg` 34rem · `xl` 44rem. " +
          "An alert dialog (`md` default, or `xs`) has no corner close and ignores the scrim. " +
          'Sheets take `side="top|right|bottom|left"` and `size="default|lg"` (left/right ' +
          "width). All three portal to `<body>`, trap Tab (Shift+Tab too, and when focus falls " +
          "out to <body>), return focus on close, and only count a click as a scrim click when " +
          "the press also STARTED on the scrim. The corner close stays put while a long panel " +
          "scrolls. Shape follows the Skin: Studio = Vega (p-6, 18px semibold title), Paper = " +
          "Maia (rounded-4xl panel), Minimalist = Nova (p-4 gap-4, text-base title, the footer " +
          "as a tinted bar across the bottom edge)." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/dialog](https://spartan.ng/components/dialog), " +
          "[alert-dialog](https://spartan.ng/components/alert-dialog), " +
          "[sheet](https://spartan.ng/components/sheet)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/dialog](https://ui.shadcn.com/docs/components/dialog), " +
          "[alert-dialog](https://ui.shadcn.com/docs/components/alert-dialog), " +
          "[sheet](https://ui.shadcn.com/docs/components/sheet)",
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

export const Dialog: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open dialog</button>
      @if (open()) {
        <sone-dialog (dismiss)="open.set(false)">
          <header soneDialogHeader>
            <h2 soneDialogTitle>Rename note</h2>
            <p soneDialogDescription>The new name shows everywhere this note appears.</p>
          </header>
          <input type="text" value="Q4 planning" aria-label="Name" data-autofocus="select" />
          <footer soneDialogFooter>
            <button soneBtn variant="outline" type="button" (click)="open.set(false)">Cancel</button>
            <button soneBtn type="button" (click)="open.set(false)">Save</button>
          </footer>
        </sone-dialog>
      }`,
  }),
};

export const DialogSizes: Story = {
  render: () => ({
    props: {
      size: signal<string | null>(null),
      sizes: ["xs", "sm", "md", "lg", "xl"],
    },
    template: `
      <div style="display: flex; gap: var(--space-2); flex-wrap: wrap">
        @for (s of sizes; track s) {
          <button soneBtn variant="outline" type="button" (click)="size.set(s)">size="{{ s }}"</button>
        }
      </div>
      @if (size(); as s) {
        <sone-dialog [size]="$any(s)" (dismiss)="size.set(null)">
          <header soneDialogHeader>
            <h2 soneDialogTitle>Share “Weekly sync”</h2>
            <p soneDialogDescription>People you add can read the note and its transcript.</p>
          </header>
          <input type="email" placeholder="name@company.com" aria-label="Email" autofocus />
          <footer soneDialogFooter>
            <button soneBtn variant="outline" type="button" (click)="size.set(null)">Cancel</button>
            <button soneBtn type="button" (click)="size.set(null)">Share</button>
          </footer>
        </sone-dialog>
      }`,
  }),
};

export const DialogWithMedia: Story = {
  render: () => ({
    props: {
      tone: signal<string | null>(null),
      tones: ["default", "accent", "destructive", "warning"],
    },
    template: `
      <div style="display: flex; gap: var(--space-2); flex-wrap: wrap">
        @for (t of tones; track t) {
          <button soneBtn variant="outline" type="button" (click)="tone.set(t)">tone="{{ t }}"</button>
        }
      </div>
      @if (tone(); as t) {
        <sone-dialog size="lg" (dismiss)="tone.set(null)">
          <header soneDialogHeader>
            <span soneDialogMedia [tone]="$any(t)"><sone-icon icon="folder-add" /></span>
            <h2 soneDialogTitle>Create in Workspaces</h2>
            <p soneDialogDescription>Choose what to create and exactly where it belongs.</p>
          </header>
          <footer soneDialogFooter>
            <button soneBtn variant="outline" type="button" (click)="tone.set(null)">Cancel</button>
            <button soneBtn type="button" (click)="tone.set(null)">Create</button>
          </footer>
        </sone-dialog>
      }`,
  }),
};

export const DialogScrolling: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open long dialog</button>
      @if (open()) {
        <sone-dialog size="lg" (dismiss)="open.set(false)">
          <header soneDialogHeader>
            <h2 soneDialogTitle>Review the summary</h2>
            <p soneDialogDescription>Scroll: the close button stays put.</p>
          </header>
          ${LONG_BODY}
          <footer soneDialogFooter>
            <button soneBtn type="button" (click)="open.set(false)">Done</button>
          </footer>
        </sone-dialog>
      }`,
  }),
};

export const DialogBusy: Story = {
  render: () => ({
    props: { open: signal(false), busy: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true); busy.set(false)">Open</button>
      @if (open()) {
        <sone-dialog [dismissible]="!busy()" [attr.aria-busy]="busy()" (dismiss)="open.set(false)">
          <form (submit)="$event.preventDefault(); busy.set(true)">
            <header soneDialogHeader>
              <h2 soneDialogTitle>Rename folder</h2>
              <p soneDialogDescription>{{ busy() ? "Saving… Escape and the scrim are off." : "Press Save to lock the dialog." }}</p>
            </header>
            <input type="text" value="Clients" aria-label="Name" data-autofocus="select" [disabled]="busy()" />
            <footer soneDialogFooter>
              <button soneBtn variant="outline" type="button" (click)="busy() ? busy.set(false) : open.set(false)">
                {{ busy() ? "Stop" : "Cancel" }}
              </button>
              <button soneBtn type="submit" [disabled]="busy()">Save</button>
            </footer>
          </form>
        </sone-dialog>
      }`,
  }),
};

export const DialogNoClose: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open</button>
      @if (open()) {
        <sone-dialog [showClose]="false" [scrimCloses]="false" ariaLabel="Keyboard shortcuts" (dismiss)="open.set(false)">
          <p soneDialogDescription>Press ⌘K anywhere to search notes, folders and people.</p>
          <footer soneDialogFooter>
            <button soneBtn type="button" data-autofocus (click)="open.set(false)">Got it</button>
          </footer>
        </sone-dialog>
      }`,
  }),
};

export const AlertDialog: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="destructive" type="button" (click)="open.set(true)">Delete…</button>
      @if (open()) {
        <sone-alert-dialog (dismiss)="open.set(false)">
          <header soneDialogHeader>
            <h2 soneDialogTitle>Delete “Q4 planning”?</h2>
            <p soneDialogDescription>The note moves to Trash. You can restore it for 30 days.</p>
          </header>
          <footer soneDialogFooter>
            <button soneBtn variant="outline" type="button" data-autofocus (click)="open.set(false)">Cancel</button>
            <button soneBtn variant="destructive" type="button" (click)="open.set(false)">Delete</button>
          </footer>
        </sone-alert-dialog>
      }`,
  }),
};

export const AlertDialogMatrix: Story = {
  render: () => ({
    props: {
      pick: signal<{ size: string; media: boolean } | null>(null),
      cases: [
        { size: "md", media: false },
        { size: "md", media: true },
        { size: "xs", media: false },
        { size: "xs", media: true },
      ],
    },
    template: `
      <div style="display: flex; gap: var(--space-2); flex-wrap: wrap">
        @for (c of cases; track c.size + c.media) {
          <button soneBtn variant="outline" type="button" (click)="pick.set(c)">
            {{ c.size }}{{ c.media ? " + media" : "" }}
          </button>
        }
      </div>
      @if (pick(); as p) {
        <sone-alert-dialog [size]="$any(p.size)" (dismiss)="pick.set(null)">
          <header soneDialogHeader>
            @if (p.media) {
              <span soneDialogMedia tone="destructive"><sone-icon icon="trash" /></span>
            }
            <h2 soneDialogTitle>Delete this folder?</h2>
            <p soneDialogDescription>Its 12 notes move to Trash with it.</p>
          </header>
          <footer soneDialogFooter>
            <button soneBtn variant="outline" type="button" data-autofocus (click)="pick.set(null)">Cancel</button>
            <button soneBtn variant="destructive" type="button" (click)="pick.set(null)">Delete</button>
          </footer>
        </sone-alert-dialog>
      }`,
  }),
};

export const AlertDialogWarningMedia: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Move into locked folder…</button>
      @if (open()) {
        <sone-alert-dialog (dismiss)="open.set(false)">
          <header soneDialogHeader>
            <span soneDialogMedia tone="warning"><sone-icon icon="lock" /></span>
            <div>
              <h2 soneDialogTitle>Move into a locked folder?</h2>
              <p soneDialogDescription style="margin-top: var(--space-2)">
                This encrypts the item. It stays hidden until you unlock the folder.
              </p>
            </div>
          </header>
          <footer soneDialogFooter>
            <button soneBtn variant="outline" type="button" data-autofocus (click)="open.set(false)">Cancel</button>
            <button soneBtn type="button" (click)="open.set(false)">Move and lock</button>
          </footer>
        </sone-alert-dialog>
      }`,
  }),
};

export const Sheet: Story = {
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
            <p soneSheetDescription>Changes save when you press Save.</p>
          </header>
          <div style="display: flex; flex-direction: column; gap: var(--space-3)">
            <input type="text" value="Alex Morgan" aria-label="Name" autofocus />
            <input type="email" value="alex@example.com" aria-label="Email" />
          </div>
          <footer soneSheetFooter>
            <button soneBtn variant="outline" type="button" (click)="pick.set(null)">Cancel</button>
            <button soneBtn type="button" (click)="pick.set(null)">Save</button>
          </footer>
        </sone-sheet>
      }`,
  }),
};

export const SheetScrolling: Story = {
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
          <form style="gap: var(--space-3)" (submit)="$event.preventDefault(); side.set(null)">
            <header soneSheetHeader>
              <span soneSheetMedia tone="accent"><sone-icon icon="notes" /></span>
              <h2 soneSheetTitle>Meeting notes</h2>
              <p soneSheetDescription>Inside a &lt;form&gt;: Enter submits.</p>
            </header>
            <div style="display: flex; flex-direction: column; gap: var(--space-3)">${LONG_BODY}</div>
            <footer soneSheetFooter>
              <button soneBtn variant="outline" type="button" (click)="side.set(null)">Cancel</button>
              <button soneBtn type="submit">Save</button>
            </footer>
          </form>
        </sone-sheet>
      }`,
  }),
};

export const SheetNoClose: Story = {
  render: () => ({
    props: { open: signal(false) },
    template: `
      <button soneBtn variant="outline" type="button" (click)="open.set(true)">Open</button>
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
