import { type Meta, type StoryObj, moduleMetadata } from "@storybook/angular";

import { SONE_EMPTY_PARTS } from "@surface-one/angular/empty-state";
import { SONE_ALERT_PARTS } from "@surface-one/angular/alert";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import { SONE_CHAT_PARTS } from "./chat.parts";

interface Turn {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const TURNS: Turn[] = [
  {
    id: "u1",
    role: "user",
    content: "What did the team decide about the onboarding checklist?",
  },
  {
    id: "a1",
    role: "assistant",
    content:
      "The team agreed to cut the checklist from twelve steps to five, and to ship the shorter version behind a flag first.",
  },
  {
    id: "u2",
    role: "user",
    content: "Who owns the flag rollout?\nAnd by when?",
  },
];

interface ChatArgs {
  bare: boolean;
  pending: boolean;
  error: boolean;
  empty: boolean;
}

const meta: Meta<ChatArgs> = {
  title: "Components/Chat/Chat",
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [
        ...SONE_CHAT_PARTS,
        ...SONE_EMPTY_PARTS,
        ...SONE_ALERT_PARTS,
        SoneButtonDirective,
        SoneIconComponent,
      ],
    }),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "The Ask surfaces' shared chat anatomy. The thread entries are spartan/ui's Message, Bubble " +
          "and Marker parts (see their own stories); the frame and the prompt box follow shadcn.io's " +
          "AI chat blocks (AI Elements):\n\n" +
          "- `[soneChatPane]` (+ `[soneChatPaneHeader]` / `Heading` / `Title` / `Description` / `Actions`) — " +
          "the frame: a `.card`, or `bare` = a full-height drawer pane with a bordered header band.\n" +
          "- `<sone-chat-thread>` — **Conversation** (spartan Message Scroller): the scrolling " +
          '`role="log"` (polite live region); the owner calls `scrollToEnd()` after a new row renders.\n' +
          "- `<sone-chat-message [from]>` + `[soneChatMessageContent]` — a spartan `soneMessage` + `soneBubble`: " +
          "the user's turn is aligned `end` in a `default` (primary) bubble, the assistant's `start` in a " +
          "`ghost` bubble (its answers are markdown, read full width); `variant` overrides. The bubble is " +
          'named "You said" / "Assistant said"; the host carries `is-user` / `is-assistant`.\n' +
          '- `<sone-typing-indicator>` — a spartan `soneMarker`: spinner + shimmering "Thinking…".\n' +
          "- `<sone-chat-composer>` + `textarea[soneChatComposerInput]` + `<sone-chat-composer-submit>` — " +
          "**PromptInput**: one input group; Enter sends, Shift+Enter is a newline.\n" +
          "- `<sone-suggestion-chips>` — **Suggestions**: starter prompts that rise in.\n\n" +
          "Styled globally (`chat.css` + message / bubble / marker css) — the parts are projected.\n\n" +
          "**Reference**\n" +
          "- spartan/ui Message — [https://www.spartan.ng/components/message](https://www.spartan.ng/components/message)\n" +
          "- spartan/ui Bubble — [https://www.spartan.ng/components/bubble](https://www.spartan.ng/components/bubble)\n" +
          "- spartan/ui Marker — [https://www.spartan.ng/components/marker](https://www.spartan.ng/components/marker)\n" +
          "- shadcn.io AI chat — [https://www.shadcn.io/ai](https://www.shadcn.io/ai)",
      },
    },
  },
  argTypes: {
    bare: { control: "boolean" },
    pending: { control: "boolean" },
    error: { control: "boolean" },
    empty: { control: "boolean" },
  },
  args: { bare: false, pending: true, error: false, empty: false },
  render: (args) => ({
    props: {
      ...args,
      turns: TURNS,
      starters: [
        "Summarize the key decisions",
        "What are my action items?",
        "What questions were left open?",
      ],
      draft: "",
    },
    template: `
      <div [style.height]="bare ? '560px' : null" style="display: flex; flex-direction: column; max-width: 560px">
        <div soneChatPane [bare]="bare">
          <div soneChatPaneHeader>
            <div soneChatPaneHeading>
              <h3 soneChatPaneTitle>Ask about this meeting</h3>
              @if (!bare) { <span soneChatPaneDescription>Answers use this transcript and selected sources</span> }
            </div>
            <div soneChatPaneActions>
              <button soneBtn variant="ghost" size="sm" type="button" aria-label="Conversation history">
                <sone-icon icon="history" /><span>History</span>
              </button>
              <button soneBtn variant="ghost" size="sm" type="button" aria-label="New conversation">
                <sone-icon icon="plus" /><span>New</span>
              </button>
            </div>
          </div>
          <sone-chat-thread [style.max-height]="bare ? null : '420px'">
            @if (empty) {
              <div soneEmpty>
                <div soneEmptyHeader>
                  <div soneEmptyMedia variant="icon"><sone-icon icon="ask" /></div>
                  <p soneEmptyTitle>Chat with this meeting</p>
                  <p soneEmptyDescription>Ask anything about what was said — decisions, owners, follow-ups.</p>
                </div>
                <div soneEmptyContent><sone-suggestion-chips [suggestions]="starters" /></div>
              </div>
            } @else {
              @for (turn of turns; track turn.id) {
                <sone-chat-message [from]="turn.role">
                  <div soneChatMessageContent>{{ turn.content }}</div>
                </sone-chat-message>
              }
              @if (pending) {
                <sone-chat-message from="assistant">
                  <sone-typing-indicator />
                </sone-chat-message>
              }
            }
            @if (error) {
              <div soneAlert variant="destructive" role="alert">
                <span>Couldn’t get an answer — the model timed out.</span>
                <div soneAlertAction><button soneBtn variant="ghost" size="sm" type="button">Retry</button></div>
              </div>
            }
          </sone-chat-thread>
          <sone-chat-composer>
            <textarea soneChatComposerInput rows="1" aria-label="Your question"
                      placeholder="Ask about this meeting…" [value]="draft"
                      (draftInput)="draft = $event" [disabled]="pending"></textarea>
            <sone-chat-composer-submit [pending]="pending" [disabled]="pending || !draft.trim()" />
          </sone-chat-composer>
        </div>
      </div>`,
  }),
};
export default meta;

type Story = StoryObj<ChatArgs>;

export const Default: Story = {};

export const Empty: Story = { args: { empty: true, pending: false } };

export const WithError: Story = { args: { pending: false, error: true } };

export const Bare: Story = { args: { bare: true, pending: false } };
