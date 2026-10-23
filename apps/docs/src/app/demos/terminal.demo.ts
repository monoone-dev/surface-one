import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SONE_TERMINAL_PARTS,
  type AgentState,
} from "@surface-one/angular/terminal";

interface Sent {
  id: number;
  from: "user" | "agent";
  kind: "message" | "activity";
  text: string;
  glyph?: string;
  meta?: string;
}

const TEMPLATE = `<sone-terminal style="height: 560px; width: 100%">
  <sone-terminal-log>
    <sone-terminal-divider [time]="at(0)">Run started · fix-flaky-tests</sone-terminal-divider>
    <sone-terminal-line from="user" to="Lead" [time]="at(1)">
      The checkout tests fail about once in ten runs. Find out why and fix it.
    </sone-terminal-line>
    <sone-terminal-line speaker="Lead" [hue]="3" [time]="at(2)">
      On it. I'll rerun the suite to catch the failure first.
    </sone-terminal-line>
    <sone-terminal-line kind="activity" speaker="Lead" [hue]="3" glyph="$" tone="danger" [time]="at(3)">
      Ran npm test -- checkout --repeat 20 --reporter=verbose --coverage=false --bail=false
      <button soneBtn soneTerminalLineMeta type="button" variant="outline" size="icon-xs"
        [attr.aria-expanded]="open()" [attr.aria-label]="open() ? 'Hide output' : 'Show output'"
        (click)="open.set(!open())">{{ open() ? "−" : "+" }}</button>
      @if (open()) {
        <pre soneTerminalLineDetail>Exit code 1
✕ checkout › applies the discount once (2 of 20 runs)
    expected 90, received 81
    at discount.spec.ts:42:18</pre>
      }
    </sone-terminal-line>
    <sone-terminal-line kind="activity" speaker="Explore" [hue]="5" [time]="at(4)">Read 2 files</sone-terminal-line>
    <sone-terminal-line kind="activity" speaker="Lead" [hue]="3" [time]="at(5)">
      Edited src/checkout/discount.ts
      <span soneTerminalLineMeta><ins>+3</ins> <del>−1</del></span>
    </sone-terminal-line>
    <sone-terminal-line kind="activity" speaker="Lead" [hue]="3" glyph="$" [time]="at(6)">
      Ran npm test -- checkout --repeat 20
      <span soneTerminalLineMeta>ok · 41s</span>
    </sone-terminal-line>
    <sone-terminal-line speaker="Lead" [hue]="3" [time]="at(7)">
      <p><strong>Fixed: the discount was applied twice.</strong></p>
      <ul>
        <li><code>applyDiscount()</code> ran in a promise nobody awaited, so a slow run applied it again.</li>
        <li>It is awaited now, and <code>discount.spec.ts</code> covers the slow path.</li>
      </ul>
      <p>20 of 20 runs pass. Shall I look at the cart tests next?</p>
    </sone-terminal-line>
    <sone-terminal-divider tone="success" [time]="at(8)">Done · 6 turns · 1m 12s</sone-terminal-divider>
    @for (e of sent(); track e.id) {
      <sone-terminal-line [from]="e.from" [kind]="e.kind" [glyph]="e.glyph ?? null"
        [speaker]="e.from === 'user' ? null : 'Lead'" [to]="e.from === 'user' ? 'Lead' : null"
        [hue]="3" [time]="at(9 + e.id)">
        {{ e.text }}
        @if (e.meta) { <span soneTerminalLineMeta>{{ e.meta }}</span> }
      </sone-terminal-line>
    }
  </sone-terminal-log>
  <sone-terminal-status [state]="state()" speaker="Lead" [hue]="3" [since]="since()">
    {{ doing() }}
    @if (state() === "working") {
      <button soneBtn soneTerminalStatusActions type="button" variant="ghost" size="icon-sm"
        aria-label="Interrupt" (click)="finish('idle')"><sone-icon icon="square" /></button>
    }
  </sone-terminal-status>
  <sone-terminal-prompt (submitted)="send()">
    <textarea soneTerminalPromptInput placeholder="Message the lead…"
      [value]="draft()" (input)="draft.set($any($event.target).value)"></textarea>
    <button soneBtn soneTerminalPromptActions type="submit" size="icon-sm"
      aria-label="Send" [disabled]="!draft().trim()"><sone-icon icon="arrow-up" /></button>
  </sone-terminal-prompt>
</sone-terminal>`;

export const code = TEMPLATE;

const STARTED = Date.UTC(2026, 9, 17, 12, 47, 0);

@Component({
  selector: "docs-terminal-demo",
  imports: [...SONE_TERMINAL_PARTS, SoneButtonDirective, SoneIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class TerminalDemo {
  readonly open = signal(true);
  readonly sent = signal<readonly Sent[]>([]);
  readonly draft = signal("");
  readonly state = signal<AgentState>("done");
  readonly since = signal<number | null>(null);
  readonly doing = signal("");
  private nextId = 1;
  private timers: ReturnType<typeof setTimeout>[] = [];

  at(step: number): number {
    return STARTED + step * 9000;
  }

  send(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.draft.set("");
    this.add({ from: "user", kind: "message", text });
    this.state.set("working");
    this.since.set(Date.now());
    this.doing.set("Reading the cart tests");
    // A canned run stands in for the agent; it only ever starts after a user action.
    this.timers.push(
      setTimeout(() => {
        this.add({
          from: "agent",
          kind: "activity",
          glyph: "$",
          text: "Ran npm test -- cart",
          meta: "ok · 2s",
        });
        this.doing.set("Writing the answer");
      }, 1600),
      setTimeout(() => {
        this.add({
          from: "agent",
          kind: "message",
          text: "This is a demo, so here is a canned answer: the cart suite is green.",
        });
        this.finish("done");
      }, 3400),
    );
  }

  finish(state: AgentState): void {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.state.set(state);
    this.since.set(null);
    this.doing.set("");
  }

  private add(entry: Omit<Sent, "id">): void {
    this.sent.update((all) => [...all, { ...entry, id: this.nextId++ }]);
  }
}
