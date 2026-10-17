import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import type { AgentState } from "@surface-one/angular/format";
import { SONE_TERMINAL_PARTS } from "./terminal.component";

interface TerminalArgs {
  state: AgentState;
  speaker: string;
  detail: string;
}

const AT = Date.UTC(2026, 9, 17, 12, 47, 0);

const meta: Meta<TerminalArgs> = {
  title: "Components/Chat/Terminal",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({ imports: [...SONE_TERMINAL_PARTS, SoneButtonDirective] }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "An agent conversation shown as a terminal — the twin of `<sone-agent-chat>`: every part takes the " +
          "same inputs, so an app switches views without touching its data.\n\n" +
          "- `<sone-terminal>` — the frame; a light sweeps across its top while the agent is busy.\n" +
          '- `<sone-terminal-log>` — the scrolling `role="log"`; follows the newest line and offers ' +
          "“Jump to newest” once the reader scrolls up.\n" +
          "- `<sone-terminal-line [from] [kind] [speaker] [to] [time] [tone] [glyph] [hue]>` — one entry. " +
          '`from="user"` is a tinted row with an accent bar and the `❯` prompt; `kind="activity"` is a ' +
          "quiet one-liner. `[soneTerminalLineMeta]` ends the line, `[soneTerminalLineDetail]` goes under it.\n" +
          "- `<sone-terminal-divider [time] [tone]>` — a run boundary or a turn summary.\n" +
          "- `<sone-terminal-status [state] [speaker] [since]>` — what the agent is doing now, with a running " +
          "time and `[soneTerminalStatusActions]` (Interrupt).\n" +
          "- `<sone-terminal-prompt (submitted)>` + `textarea[soneTerminalPromptInput]` — Enter sends, " +
          "Shift+Enter breaks the line.\n\n" +
          "**Reference**\n" +
          "- spartan/ui Message — [https://www.spartan.ng/components/message](https://www.spartan.ng/components/message)\n" +
          "- shadcn.io AI chat — [https://www.shadcn.io/ai](https://www.shadcn.io/ai)",
      },
    },
  },
  argTypes: {
    state: {
      control: "select",
      options: ["idle", "working", "thinking", "waiting", "done", "error"],
    },
  },
  args: { state: "working", speaker: "Lead", detail: "Reading discount.ts" },
  render: (args) => ({
    props: { ...args, at: AT, since: Date.now() - 83_000 },
    template: `<sone-terminal style="height: 440px">
  <sone-terminal-log>
    <sone-terminal-divider [time]="at">Run started · fix-flaky-tests</sone-terminal-divider>
    <sone-terminal-line from="user" to="Lead" [time]="at + 9000">The checkout tests fail about once in ten runs. Find out why.</sone-terminal-line>
    <sone-terminal-line speaker="Lead" [hue]="3" [time]="at + 18000">On it. I'll rerun the suite to catch the failure.</sone-terminal-line>
    <sone-terminal-line kind="activity" speaker="Lead" [hue]="3" glyph="$" tone="danger" [time]="at + 27000">
      npm test -- checkout --repeat 20
      <pre soneTerminalLineDetail>✕ applies the discount once (2 of 20 runs)</pre>
    </sone-terminal-line>
    <sone-terminal-line kind="activity" speaker="Explore" [hue]="5" [time]="at + 36000">
      Read src/checkout/discount.ts<span soneTerminalLineMeta>142 lines</span>
    </sone-terminal-line>
    <sone-terminal-line speaker="Lead" [hue]="3" [time]="at + 45000">The discount is applied in a promise that is not awaited.</sone-terminal-line>
    <sone-terminal-divider tone="success">Done · 4 turns · 1m 12s</sone-terminal-divider>
  </sone-terminal-log>
  <sone-terminal-status [state]="state" [speaker]="speaker" [hue]="3" [since]="since">
    {{ detail }}
    <button soneBtn soneTerminalStatusActions type="button" variant="outline" size="sm">Interrupt</button>
  </sone-terminal-status>
  <sone-terminal-prompt>
    <textarea soneTerminalPromptInput placeholder="Message the lead…"></textarea>
    <button soneBtn soneTerminalPromptActions type="submit" size="sm">Send</button>
  </sone-terminal-prompt>
</sone-terminal>`,
  }),
};

export default meta;
type Story = StoryObj<TerminalArgs>;

export const Working: Story = {};
export const Thinking: Story = { args: { state: "thinking" } };
export const WaitingForYou: Story = {
  args: { state: "waiting", detail: "Approve the fix?" },
};
export const Done: Story = { args: { state: "done", detail: "" } };
export const Failed: Story = {
  args: { state: "error", detail: "npm test exited 1" },
};
export const Idle: Story = { args: { state: "idle", detail: "" } };
