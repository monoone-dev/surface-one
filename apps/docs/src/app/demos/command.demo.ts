import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_COMMAND_PARTS,
  SoneCommandDialogComponent,
} from "@surface-one/angular/command";
import { SoneKbdComponent } from "@surface-one/angular/kbd";

const TEMPLATE = `<div class="demo-stack" style="max-width: 26rem">
  <sone-command style="box-shadow: 0 0 0 1px var(--border)">
    <input soneCommandInput placeholder="Type a command or search…" aria-label="Search commands" />
    <div soneCommandList aria-label="Commands">
      <div soneCommandEmpty>No results found.</div>
      <div soneCommandGroup heading="Notes">
        @for (note of notes; track note) {
          <div soneCommandItem (select)="picked.set($event)">{{ note }}</div>
        }
      </div>
      <div soneCommandSeparator></div>
      <div soneCommandGroup heading="Actions">
        <div soneCommandItem value="New note" [keywords]="['create', 'add']" (select)="picked.set($event)">New note</div>
        <div soneCommandItem value="Start recording" [keywords]="['record', 'meeting']" (select)="picked.set($event)">Start recording</div>
        <div soneCommandItem value="Export" disabled>Export (locked)</div>
      </div>
    </div>
  </sone-command>
  <p style="margin: 0; color: var(--text-secondary)">Selected: {{ picked() ?? "nothing yet" }}</p>
  <div class="demo-row">
    <button soneBtn variant="outline" type="button" (click)="paletteOpen.set(true)">
      Open the palette <sone-kbd>⌘K</sone-kbd>
    </button>
  </div>
</div>

@if (paletteOpen()) {
  <sone-command-dialog label="Command palette" (dismiss)="paletteOpen.set(false)">
    <sone-command>
      <input soneCommandInput data-autofocus placeholder="Search notes…" aria-label="Search notes" />
      <div soneCommandList aria-label="Notes">
        <div soneCommandEmpty>No notes match.</div>
        @for (note of notes; track note) {
          <div soneCommandItem (select)="picked.set($event); paletteOpen.set(false)">{{ note }}</div>
        }
      </div>
    </sone-command>
  </sone-command-dialog>
}`;

export const code = TEMPLATE;

@Component({
  selector: "docs-command-demo",
  imports: [
    ...SONE_COMMAND_PARTS,
    SoneCommandDialogComponent,
    SoneButtonDirective,
    SoneKbdComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class CommandDemo {
  readonly notes = [
    "Q4 planning",
    "Design review — Łódź office",
    "Weekly sync",
    "Café roadmap",
    "Hiring loop",
  ];
  readonly picked = signal<string | null>(null);
  readonly paletteOpen = signal(false);
}
