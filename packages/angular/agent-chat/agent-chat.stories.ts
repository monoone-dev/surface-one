import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SoneButtonDirective } from "@surface-one/angular/button";
import type { AgentState } from "@surface-one/angular/format";
import { SONE_AGENT_CHAT_PARTS } from "./agent-chat.component";

interface AgentChatArgs {
  state: AgentState;
  speaker: string;
  detail: string;
}

const AT = Date.UTC(2026, 9, 17, 12, 47, 0);

const meta: Meta<AgentChatArgs> = {
  title: "Components/Chat/Agent Chat",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [...SONE_AGENT_CHAT_PARTS, SoneButtonDirective],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "An agent conversation shown as a chat — the twin of `<sone-terminal>`: every part takes the " +
          "same inputs, so an app switches views without touching its data.\n\n" +
          "- `<sone-agent-chat>` — the frame; a light sweeps across its top while the agent is busy.\n" +
          '- `<sone-agent-chat-log>` — the scrolling `role="log"`; follows the newest message and offers ' +
          "“Jump to newest” once the reader scrolls up.\n" +
          "- `<sone-agent-chat-message [from] [kind] [speaker] [to] [time] [tone] [glyph] [hue]>` — one entry. " +
          '`from="user"` is an accent bubble on the right; an agent answers on the left under its avatar; ' +
          '`kind="activity"` is a quiet line with no bubble. `[soneAgentChatMessageMeta]` ends the bubble, ' +
          "`[soneAgentChatMessageDetail]` goes under it.\n" +
          "- `<sone-agent-chat-divider [time] [tone]>` — a run boundary or a turn summary.\n" +
          "- `<sone-agent-chat-status [state] [speaker] [since]>` — what the agent is doing now: a ringed avatar " +
          "while busy, a running time and `[soneAgentChatStatusActions]` (Interrupt).\n" +
          "- `<sone-agent-chat-composer (submitted)>` + `textarea[soneAgentChatComposerInput]` — Enter sends, " +
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
    template: `<sone-agent-chat style="height: 440px">
  <sone-agent-chat-log>
    <sone-agent-chat-divider [time]="at">Run started · fix-flaky-tests</sone-agent-chat-divider>
    <sone-agent-chat-message from="user" to="Lead" [time]="at + 9000">The checkout tests fail about once in ten runs. Find out why.</sone-agent-chat-message>
    <sone-agent-chat-message speaker="Lead" [hue]="3" [time]="at + 18000">On it. I'll rerun the suite to catch the failure.</sone-agent-chat-message>
    <sone-agent-chat-message kind="activity" speaker="Lead" [hue]="3" glyph="$" tone="danger" [time]="at + 27000">
      npm test -- checkout --repeat 20
      <pre soneAgentChatMessageDetail>✕ applies the discount once (2 of 20 runs)</pre>
    </sone-agent-chat-message>
    <sone-agent-chat-message kind="activity" speaker="Explore" [hue]="5" [time]="at + 36000">
      Read src/checkout/discount.ts<span soneAgentChatMessageMeta>142 lines</span>
    </sone-agent-chat-message>
    <sone-agent-chat-message speaker="Lead" [hue]="3" [time]="at + 45000">The discount is applied in a promise that is not awaited.</sone-agent-chat-message>
    <sone-agent-chat-divider tone="success">Done · 4 turns · 1m 12s</sone-agent-chat-divider>
  </sone-agent-chat-log>
  <sone-agent-chat-status [state]="state" [speaker]="speaker" [hue]="3" [since]="since">
    {{ detail }}
    <button soneBtn soneAgentChatStatusActions type="button" variant="outline" size="sm">Interrupt</button>
  </sone-agent-chat-status>
  <sone-agent-chat-composer>
    <textarea soneAgentChatComposerInput placeholder="Message the lead…"></textarea>
    <button soneBtn soneAgentChatComposerActions type="submit" size="sm">Send</button>
  </sone-agent-chat-composer>
</sone-agent-chat>`,
  }),
};

export default meta;
type Story = StoryObj<AgentChatArgs>;

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
