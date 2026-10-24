import { useEffect, useRef, useState } from "react";
import {
  SoneButton,
  SoneChatComposer,
  SoneChatComposerInput,
  SoneChatComposerSubmit,
  SoneChatMessage,
  SoneChatMessageContent,
  SoneChatPane,
  SoneChatPaneActions,
  SoneChatPaneDescription,
  SoneChatPaneHeader,
  SoneChatPaneHeading,
  SoneChatPaneTitle,
  SoneChatThread,
  SoneIcon,
  SoneSuggestionChips,
  SoneTypingIndicator,
  type SoneChatThreadHandle,
} from "@surface-one/react";

interface Turn {
  id: number;
  role: "user" | "assistant";
  content: string;
}

const OPENING: readonly Turn[] = [
  {
    id: 1,
    role: "user",
    content: "What did Ada and Leo decide about the onboarding checklist?",
  },
  {
    id: 2,
    role: "assistant",
    content:
      "They agreed to cut the checklist from twelve steps to five and to ship the shorter version behind a feature flag first. Leo owns the rollout.",
  },
];

const STARTERS = ["Summarize the key decisions", "What are my action items?"];

export default function ChatDemo() {
  const [turns, setTurns] = useState<readonly Turn[]>(OPENING);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const thread = useRef<SoneChatThreadHandle>(null);
  const nextId = useRef(OPENING.length + 1);
  const reply = useRef<ReturnType<typeof setTimeout>>(undefined);

  // After a new turn renders, follow it.
  useEffect(() => thread.current?.scrollToEnd(), [turns]);
  useEffect(() => () => clearTimeout(reply.current), []);

  const append = (role: Turn["role"], content: string) =>
    setTurns((all) => [...all, { id: nextId.current++, role, content }]);

  const send = (text: string) => {
    const question = text.trim();
    if (!question || pending) return;
    setDraft("");
    append("user", question);
    setPending(true);
    // A canned reply stands in for the model; only ever runs after a user action.
    reply.current = setTimeout(() => {
      setPending(false);
      append(
        "assistant",
        "This is a demo, so here is a canned answer: the next review is on Friday.",
      );
    }, 1200);
  };

  const reset = () => {
    clearTimeout(reply.current);
    setTurns(OPENING);
    setPending(false);
  };

  return (
    <SoneChatPane style={{ maxWidth: 560, width: "100%" }}>
      <SoneChatPaneHeader>
        <SoneChatPaneHeading>
          <SoneChatPaneTitle>Ask about this meeting</SoneChatPaneTitle>
          <SoneChatPaneDescription>Answers use the planning meeting transcript</SoneChatPaneDescription>
        </SoneChatPaneHeading>
        <SoneChatPaneActions>
          <SoneButton type="button" variant="ghost" size="sm" onClick={reset}>
            <SoneIcon icon="plus" /><span>New</span>
          </SoneButton>
        </SoneChatPaneActions>
      </SoneChatPaneHeader>
      <SoneChatThread handleRef={thread} style={{ maxHeight: 360 }}>
        {turns.map((turn) => (
          <SoneChatMessage key={turn.id} from={turn.role}>
            <SoneChatMessageContent>{turn.content}</SoneChatMessageContent>
          </SoneChatMessage>
        ))}
        {pending ? (
          <SoneChatMessage from="assistant"><SoneTypingIndicator /></SoneChatMessage>
        ) : null}
      </SoneChatThread>
      <SoneSuggestionChips suggestions={STARTERS} disabled={pending} onPicked={send} />
      <SoneChatComposer onSubmitted={() => send(draft)}>
        <SoneChatComposerInput
          rows={1}
          aria-label="Your question"
          placeholder="Ask about this meeting…"
          value={draft}
          onDraftInput={setDraft}
          disabled={pending}
        />
        <SoneChatComposerSubmit pending={pending} disabled={pending || !draft.trim()} />
      </SoneChatComposer>
    </SoneChatPane>
  );
}
