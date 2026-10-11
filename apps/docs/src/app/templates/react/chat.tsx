"use client";

import DOMPurify from "dompurify";
import { marked } from "marked";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  SoneBadge,
  SoneButton,
  SoneEmpty,
  SoneEmptyDescription,
  SoneEmptyHeader,
  SoneEmptyMedia,
  SoneEmptyTitle,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupTextarea,
  SoneItem,
  SoneItemContent,
  SoneItemDescription,
  SoneItemGroup,
  SoneItemMedia,
  SoneItemTitle,
  SoneSpinner,
} from "@surface-one/react";

type Turn =
  | { readonly id: string; readonly kind: "user"; readonly text: string }
  | { readonly id: string; readonly kind: "assistant"; readonly text: string }
  | { readonly id: string; readonly kind: "marker"; readonly text: string };

interface Source {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
}

const THREAD: readonly Turn[] = [
  {
    id: "t1",
    kind: "user",
    text: "What did we agree on for the Harbor launch date?",
  },
  { id: "t2", kind: "marker", text: "Searched 4 notes" },
  {
    id: "t3",
    kind: "assistant",
    text:
      "The team agreed to launch **Harbor on October 18**, one week later than first planned.\n\n" +
      "- Ada Park moved the date to leave room for the billing migration.\n" +
      "- Leo Ruiz will freeze the release branch on **October 14**.\n" +
      "- Marketing keeps the announcement draft but holds it until QA signs off.",
  },
  { id: "t4", kind: "user", text: "Who is writing the launch checklist?" },
  { id: "t5", kind: "marker", text: "Searched 2 meetings" },
  {
    id: "t6",
    kind: "assistant",
    text:
      "Mina Sato owns the checklist. She plans to share a first draft in Friday's sync, " +
      "and Theo Grant will review the support hand-off section.",
  },
];

const REPLY =
  "Here is what I found in your notes: the open questions are the **pricing page screenshots** " +
  "and the **support rota for launch week**. Both are tracked as reminders for Leo Ruiz.";

const suggestions = [
  "What questions are still open?",
  "Summarize the launch risks",
  "List my action items",
] as const;
const sources: readonly Source[] = [
  {
    id: "s1",
    title: "Harbor launch — weekly sync",
    meta: "Meeting · Oct 2 · 42 min",
  },
  { id: "s2", title: "Release plan", meta: "Note · edited Sep 30" },
  { id: "s3", title: "Billing migration risks", meta: "Note · edited Sep 28" },
  { id: "s4", title: "Support rota draft", meta: "Note · edited Sep 26" },
];

/**
 * Markdown to HTML for `dangerouslySetInnerHTML`. Model output is untrusted, so the HTML
 * goes through DOMPurify — which needs a DOM: on the server (SSR) it is skipped, which is
 * safe here only because the server ever renders just the trusted constant THREAD above.
 */
function markdown(source: string): string {
  const html = marked.parse(source, { async: false, gfm: true, breaks: true });
  return typeof window === "undefined" ? html : DOMPurify.sanitize(html);
}

export default function ChatTemplate() {
  const [turns, setTurns] = useState<readonly Turn[]>(THREAD);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const canSend = !pending && draft.trim().length > 0;

  const thread = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);
  const scrollPending = useRef(false);

  // Rendered once per turn, not on every re-render (each keystroke in the composer re-renders).
  const answers = useMemo(
    () =>
      new Map(
        turns
          .filter((t) => t.kind === "assistant")
          .map((t) => [t.id, markdown(t.text)]),
      ),
    [turns],
  );

  // After a send or a reply has rendered, keep the newest turn in view.
  useEffect(() => {
    if (!scrollPending.current) return;
    scrollPending.current = false;
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [turns, pending]);

  useEffect(
    () => () => {
      if (replyTimer.current !== null) clearTimeout(replyTimer.current);
    },
    [],
  );

  const newId = () => `n${++nextId.current}`;

  function send(text: string): void {
    const question = text.trim();
    if (!question || pending) return;
    setTurns((t) => [...t, { id: newId(), kind: "user", text: question }]);
    setDraft("");
    setPending(true);
    scrollPending.current = true;
    // Runs only after a user action (never during SSR): a canned reply stands in for the model.
    replyTimer.current = setTimeout(() => {
      replyTimer.current = null;
      setTurns((t) => [
        ...t,
        { id: newId(), kind: "marker", text: "Searched 4 notes" },
        { id: newId(), kind: "assistant", text: REPLY },
      ]);
      setPending(false);
      scrollPending.current = true;
    }, 900);
  }

  // Enter sends, Shift + Enter adds a new line.
  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send(draft);
    }
  }

  function reset(): void {
    if (replyTimer.current !== null) clearTimeout(replyTimer.current);
    replyTimer.current = null;
    setPending(false);
    setDraft("");
    setTurns([]);
  }

  return (
    <div className="chat-template tpl-chat">
      <style>{css}</style>
      <div className="layout">
        {/* No React chat pane yet: the same markup and classes as [soneChatPane] and its parts. */}
        <div data-slot="chat-pane" className="card pane">
          <div data-slot="chat-pane-header">
            <div data-slot="chat-pane-heading">
              <h2 data-slot="chat-pane-title">Ask about Harbor launch</h2>
              <span data-slot="chat-pane-description">
                Answers use the project's notes and meetings
              </span>
            </div>
            <div data-slot="chat-pane-actions">
              <SoneButton variant="ghost" size="sm" type="button">
                <SoneIcon icon="history" />
                <span>History</span>
              </SoneButton>
              <SoneButton
                variant="ghost"
                size="sm"
                type="button"
                onClick={reset}
              >
                <SoneIcon icon="plus" />
                <span>New chat</span>
              </SoneButton>
            </div>
          </div>

          {/* No React chat thread yet: the same markup and classes as <sone-chat-thread>. */}
          <div
            ref={thread}
            data-slot="chat-thread"
            className="thread"
            role="log"
            aria-live="polite"
            aria-label="Conversation with the assistant"
          >
            {!turns.length && !pending && (
              <SoneEmpty>
                <SoneEmptyHeader>
                  <SoneEmptyMedia variant="icon">
                    <SoneIcon icon="ask" />
                  </SoneEmptyMedia>
                  <SoneEmptyTitle as="p">
                    Start a new conversation
                  </SoneEmptyTitle>
                  <SoneEmptyDescription>
                    Ask about decisions, owners or follow-ups in Harbor launch.
                  </SoneEmptyDescription>
                </SoneEmptyHeader>
              </SoneEmpty>
            )}
            {turns.map((turn) =>
              turn.kind === "marker" ? (
                // No React marker yet: the same markup and classes as [soneMarker].
                <div
                  key={turn.id}
                  data-slot="marker"
                  data-variant="default"
                  className="marker"
                >
                  <span data-slot="marker-icon" aria-hidden="true">
                    <SoneIcon icon="search" size="sm" />
                  </span>
                  <span data-slot="marker-content">{turn.text}</span>
                </div>
              ) : turn.kind === "user" ? (
                // No React chat message yet: the same markup and classes as <sone-chat-message>.
                <div
                  key={turn.id}
                  data-slot="message"
                  data-align="end"
                  data-from="user"
                  className="is-user"
                >
                  <div data-slot="message-content">
                    <div
                      data-slot="bubble"
                      data-variant="default"
                      data-align="end"
                    >
                      <div data-slot="bubble-content" aria-label="You said">
                        {turn.text}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  key={turn.id}
                  data-slot="message"
                  data-align="start"
                  data-from="assistant"
                  className="is-assistant"
                >
                  <div data-slot="message-content">
                    <div
                      data-slot="bubble"
                      data-variant="ghost"
                      data-align="start"
                    >
                      <div
                        data-slot="bubble-content"
                        aria-label="Assistant said"
                      >
                        {/* No React markdown yet: the same wrapper as <sone-markdown size="sm">. */}
                        <div
                          className="markdown"
                          data-slot="markdown"
                          data-size="sm"
                        >
                          <div
                            className="markdown-block"
                            dangerouslySetInnerHTML={{
                              __html: answers.get(turn.id) ?? "",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            )}
            {pending && (
              <div
                data-slot="message"
                data-align="start"
                data-from="assistant"
                className="is-assistant"
              >
                <div data-slot="message-content">
                  {/* No React typing indicator yet: the same markup as <sone-typing-indicator>. */}
                  <div
                    data-slot="marker"
                    data-variant="default"
                    aria-label="Thinking"
                  >
                    <span data-slot="marker-icon" aria-hidden="true">
                      <SoneSpinner size={16} label={null} />
                    </span>
                    <span data-slot="marker-content" className="shimmer">
                      Thinking…
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="footer">
            {/* No React suggestion chips yet: the same markup as <sone-suggestion-chips>. */}
            <div
              data-slot="suggestions"
              role="group"
              aria-label="Suggested questions"
            >
              {suggestions.map((s, i) => (
                <SoneButton
                  key={s}
                  variant="outline"
                  size="sm"
                  type="button"
                  style={{ "--i": i } as CSSProperties}
                  disabled={pending}
                  onClick={() => send(s)}
                >
                  {s}
                </SoneButton>
              ))}
            </div>
            {/* No React chat composer yet: the same markup and classes as <sone-chat-composer>. */}
            <div data-slot="chat-composer" data-layout="inline">
              <SoneInputGroup
                as="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(draft);
                }}
              >
                <SoneInputGroupTextarea
                  value={draft}
                  onValueChange={setDraft}
                  rows={1}
                  aria-label="Ask a question"
                  placeholder="Ask about this project…"
                  disabled={pending}
                  onKeyDown={onComposerKeyDown}
                />
                <SoneInputGroupAddon as="span" align="inline-end">
                  <span data-slot="chat-composer-submit">
                    <SoneButton
                      size="icon-sm"
                      type="submit"
                      disabled={!canSend}
                      aria-label={pending ? "Sending" : "Send"}
                    >
                      {pending ? (
                        <SoneSpinner size={16} label={null} />
                      ) : (
                        <svg
                          data-slot="chat-send-arrow"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M4 12L20 4l-4 16-4-7-8-1z"
                            fill="currentColor"
                          />
                        </svg>
                      )}
                    </SoneButton>
                  </span>
                </SoneInputGroupAddon>
              </SoneInputGroup>
            </div>
          </div>
        </div>

        <div className="sources">
          <h2 className="sources-title">
            Sources
            <SoneBadge variant="secondary">{sources.length}</SoneBadge>
          </h2>
          <p className="sources-copy">
            The assistant only reads what is in this project.
          </p>
          <SoneItemGroup as="ul" className="source-list">
            {sources.map((source) => (
              <SoneItem key={source.id} as="li" variant="outline" size="sm">
                <SoneItemMedia as="span" variant="icon">
                  <SoneIcon icon="notes" />
                </SoneItemMedia>
                <SoneItemContent>
                  <SoneItemTitle>{source.title}</SoneItemTitle>
                  <SoneItemDescription>{source.meta}</SoneItemDescription>
                </SoneItemContent>
              </SoneItem>
            ))}
          </SoneItemGroup>
        </div>
      </div>
    </div>
  );
}

const css = `
.tpl-chat.chat-template {
  display: block;
  padding: var(--space-5);
}
.tpl-chat .layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 16rem;
  gap: var(--space-5);
  align-items: start;
}
.tpl-chat .pane {
  display: flex;
  flex-direction: column;
  min-width: 0;
}
.tpl-chat .thread {
  height: 26rem;
}
.tpl-chat .marker {
  color: var(--text-muted);
}
.tpl-chat .footer {
  display: grid;
  gap: var(--space-3);
}
.tpl-chat .sources {
  display: grid;
  gap: var(--space-3);
}
.tpl-chat .sources-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-chat .sources-copy {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}
.tpl-chat .source-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (max-width: 720px) {
  .tpl-chat.chat-template {
    padding: var(--space-3);
  }
  .tpl-chat .layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-chat .thread {
    height: 22rem;
  }
}
`;
