import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { SoneButtonDirective } from "@surface-one/angular/button";
import {
  SONE_AGENT_CHAT_PARTS,
  type AgentState,
} from "@surface-one/angular/agent-chat";

interface Sent {
  id: number;
  from: "user" | "agent";
  kind: "message" | "activity";
  text: string;
  glyph?: string;
  meta?: string;
}

const TEMPLATE = `<sone-agent-chat style="height: 560px; width: 100%">
  <sone-agent-chat-log>
    <sone-agent-chat-divider [time]="at(0)">Run started · fix-flaky-tests</sone-agent-chat-divider>
    <sone-agent-chat-message from="user" to="Lead" [time]="at(1)">
      The checkout tests fail about once in ten runs. Find out why and fix it.
    </sone-agent-chat-message>
    <sone-agent-chat-message speaker="Lead" [hue]="3" [time]="at(2)">
      On it. I'll rerun the suite to catch the failure first.
    </sone-agent-chat-message>
    <sone-agent-chat-message kind="activity" speaker="Lead" [hue]="3" glyph="$" tone="danger" [time]="at(3)">
      Ran npm test -- checkout --repeat 20 --reporter=verbose --coverage=false --bail=false
      <button soneBtn soneAgentChatMessageMeta type="button" variant="outline" size="icon-xs"
        [attr.aria-expanded]="open()" [attr.aria-label]="open() ? 'Hide output' : 'Show output'"
        (click)="open.set(!open())">{{ open() ? "−" : "+" }}</button>
      @if (open()) {
        <pre soneAgentChatMessageDetail>Exit code 1
✕ checkout › applies the discount once (2 of 20 runs)
    expected 90, received 81
    at discount.spec.ts:42:18</pre>
      }
    </sone-agent-chat-message>
    <sone-agent-chat-message kind="activity" speaker="Explore" [hue]="5" [time]="at(4)">Read 2 files</sone-agent-chat-message>
    <sone-agent-chat-message kind="activity" speaker="Lead" [hue]="3" [time]="at(5)">
      Edited src/checkout/discount.ts
      <span soneAgentChatMessageMeta><ins>+3</ins> <del>−1</del></span>
    </sone-agent-chat-message>
    <sone-agent-chat-message kind="activity" speaker="Lead" [hue]="3" glyph="$" [time]="at(6)">
      Ran npm test -- checkout --repeat 20
      <span soneAgentChatMessageMeta>ok · 41s</span>
    </sone-agent-chat-message>
    <sone-agent-chat-message speaker="Lead" [hue]="3" [time]="at(7)">
      <sone-agent-chat-thought [seconds]="12">
        Two of twenty runs failed with 81 instead of 90, so the discount ran twice. Only a slow
        run does that, which points at a promise nobody awaits.
      </sone-agent-chat-thought>
      <p><strong>Fixed: the discount was applied twice.</strong></p>
      <ul>
        <li><code>applyDiscount()</code> ran in a promise nobody awaited, so a slow run applied it again.</li>
        <li>It is awaited now, and <code>discount.spec.ts</code> covers the slow path.</li>
      </ul>
      <p>20 of 20 runs pass.</p>
    </sone-agent-chat-message>
    <sone-agent-chat-divider tone="success" [time]="at(8)">Done · 6 turns · 1m 12s</sone-agent-chat-divider>
    @if (asking()) {
      <sone-agent-chat-question who="Lead" [hue]="3" [time]="at(9)"
        question="Fix the orders that already got the double discount, or ship the fix now?"
        reason="The fix is right. Orders placed before today may already hold a second discount."
        [options]="options" (answer)="reply($event)" />
    }
    @for (e of sent(); track e.id) {
      <sone-agent-chat-message [from]="e.from" [kind]="e.kind" [glyph]="e.glyph ?? null"
        [speaker]="e.from === 'user' ? null : 'Lead'" [to]="e.from === 'user' ? 'Lead' : null"
        [hue]="3" [time]="at(10 + e.id)">
        {{ e.text }}
        @if (e.meta) { <span soneAgentChatMessageMeta>{{ e.meta }}</span> }
      </sone-agent-chat-message>
    }
  </sone-agent-chat-log>
  <sone-agent-chat-status [state]="state()" speaker="Lead" [hue]="3" [since]="since()">
    {{ doing() }}
    @if (state() === "working") {
      <button soneBtn soneAgentChatStatusActions type="button" variant="outline" size="sm"
        (click)="finish('idle')">Interrupt</button>
    }
  </sone-agent-chat-status>
  <sone-agent-chat-composer (submitted)="send()">
    <textarea soneAgentChatComposerInput placeholder="Message the lead…"
      [value]="draft()" (input)="draft.set($any($event.target).value)"></textarea>
    <button soneBtn soneAgentChatComposerActions type="submit" size="sm"
      [disabled]="!draft().trim()">Send</button>
  </sone-agent-chat-composer>
</sone-agent-chat>`;

export const code = TEMPLATE;

const STARTED = Date.UTC(2026, 9, 17, 12, 47, 0);

@Component({
  selector: "docs-agent-chat-demo",
  imports: [...SONE_AGENT_CHAT_PARTS, SoneButtonDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: TEMPLATE,
})
export default class AgentChatDemo {
  readonly open = signal(true);
  readonly sent = signal<readonly Sent[]>([]);
  readonly draft = signal("");
  readonly asking = signal(true);
  readonly state = signal<AgentState>("waiting");
  readonly since = signal<number | null>(null);
  readonly doing = signal("");
  private nextId = 1;
  private timers: ReturnType<typeof setTimeout>[] = [];

  at(step: number): number {
    return STARTED + step * 9000;
  }

  readonly options = [
    {
      label: "Ship the fix now",
      hint: "I note the old orders as a follow-up task",
    },
    {
      label: "Fix the old orders too",
      hint: "A migration recomputes their totals",
    },
  ];

  reply(text: string): void {
    this.asking.set(false);
    this.run(text);
  }

  send(): void {
    const text = this.draft().trim();
    if (!text) return;
    this.draft.set("");
    this.asking.set(false);
    this.run(text);
  }

  private run(text: string): void {
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
