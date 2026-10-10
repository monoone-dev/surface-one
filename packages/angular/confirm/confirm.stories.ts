import { signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_CONFIRM_PARTS, SoneConfirmComponent } from "./confirm.component";

const meta: Meta<SoneConfirmComponent> = {
  title: "Components/Feedback/Confirm",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [SoneButtonDirective, ...SONE_CONFIRM_PARTS] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "`[soneConfirm]` — an inline confirmation with the shadcn/ui Alert Dialog anatomy, rendered in " +
          "place (a row, a list, a panel) instead of a modal. Parts: `[soneConfirmTitle]` (names the " +
          '`role="alertdialog"`), `[soneConfirmDescription]`, `[soneConfirmError]` (`role="alert"`) and ' +
          "`[soneConfirmActions]` (extra controls at the start of the button row). The buttons are drawn for " +
          "you, always **Cancel then Confirm**. Focus moves to Confirm when it renders (`autoFocus`), Escape " +
          "cancels, and while `busy` both buttons are `aria-disabled` and the action reads `busyLabel`.\n\n" +
          "Inputs: `variant` (`default` | `destructive`), `size` (`default` | `compact`), `layout` " +
          "(`inline` | `card`), `confirmLabel`, `cancelLabel`, `busyLabel`, `busy`, `autoFocus`. " +
          "Outputs: `(confirm)`, `(cancel)`. Render it with `@if` and give focus back to the opener on cancel." +
          "\n\n**Reference**\n" +
          "- spartan/ui — [https://spartan.ng/components/alert-dialog](https://spartan.ng/components/alert-dialog)\n" +
          "- shadcn/ui — [https://ui.shadcn.com/docs/components/alert-dialog](https://ui.shadcn.com/docs/components/alert-dialog)",
      },
    },
  },
};
export default meta;
type Story = StoryObj<SoneConfirmComponent>;

export const Inline: Story = {
  render: () => ({
    template: `
      <div soneConfirm variant="destructive" confirmLabel="Delete" style="max-width: 32rem" [autoFocus]="false">
        <p soneConfirmTitle>Permanently delete 3 items?</p>
        <p soneConfirmDescription>This cannot be undone.</p>
      </div>`,
  }),
};

export const Card: Story = {
  render: () => ({
    template: `
      <div soneConfirm layout="card" variant="destructive" confirmLabel="Remove lock" style="max-width: 26rem" [autoFocus]="false">
        <h3 soneConfirmTitle>Remove the lock from “Board”?</h3>
        <p soneConfirmDescription>Every note in this folder is decrypted and stays readable without Touch ID.</p>
      </div>`,
  }),
};

export const Compact: Story = {
  render: () => ({
    template: `
      <div soneConfirm size="compact" variant="destructive" confirmLabel="Delete" aria-label="Delete reminder"
        style="max-width: 20rem" [autoFocus]="false">
        <span soneConfirmTitle>Delete?</span>
      </div>`,
  }),
};

export const Busy: Story = {
  render: () => ({
    template: `
      <div soneConfirm variant="destructive" confirmLabel="Delete" busyLabel="Deleting…" busy style="max-width: 32rem" [autoFocus]="false">
        <p soneConfirmTitle>Empty the trash?</p>
      </div>`,
  }),
};

export const WithError: Story = {
  render: () => ({
    template: `
      <div soneConfirm layout="card" confirmLabel="Try again" style="max-width: 26rem" [autoFocus]="false">
        <p soneConfirmTitle>Share with the team?</p>
        <p soneConfirmError>The server could not be reached.</p>
      </div>`,
  }),
};

export const Interactive: Story = {
  render: () => {
    const open = signal(false);
    const log = signal("");
    return {
      props: { open, log },
      template: `
        <div style="display: grid; gap: var(--space-3); max-width: 32rem">
          @if (open()) {
            <div soneConfirm variant="destructive" confirmLabel="Delete"
              (confirm)="open.set(false); log.set('Deleted')" (cancel)="open.set(false); log.set('Cancelled')">
              <p soneConfirmTitle>Delete this note?</p>
              <p soneConfirmDescription>It moves to the trash for 30 days.</p>
            </div>
          } @else {
            <button type="button" soneBtn variant="outline" size="sm" (click)="open.set(true)">Delete note</button>
          }
          <p role="status" style="margin: 0; color: var(--text-secondary)">{{ log() }}</p>
        </div>`,
    };
  },
};
