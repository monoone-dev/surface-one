"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneIcon,
  SoneInputGroup,
  SoneInputGroupAddon,
  SoneInputGroupTextarea,
  SoneMenu,
  SoneMenuItem,
  SoneSpinner,
} from "@surface-one/react";

import {
  type Message,
  type Conversation,
  CONVERSATIONS,
  REPLIES,
  now,
} from "../data/messages";

function last(c: Conversation): Message {
  return c.messages[c.messages.length - 1]!;
}

export default function MessagesTemplate() {
  const [conversations, setConversations] =
    useState<readonly Conversation[]>(CONVERSATIONS);
  const [activeId, setActiveId] = useState("leo");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [starred, setStarred] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unread, setUnread] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      CONVERSATIONS.map((c) => [c.id, c.id === "leo" ? 0 : c.unread]),
    ),
  );

  const threadEl = useRef<HTMLDivElement>(null);
  const menuEl = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const active = conversations.find((c) => c.id === activeId)!;
  const thread = active.messages;
  const q = query.trim().toLowerCase();
  const visible = conversations.filter(
    (c) =>
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.messages.some((m) => m.text.toLowerCase().includes(q)),
  );

  // Keep the newest message in view when the thread changes.
  useEffect(() => {
    const el = threadEl.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [activeId, thread.length]);

  // The conversation menu closes on a click outside it (listener added in the browser only).
  useEffect(() => {
    if (!menuOpen) return;
    const onDocumentClick = (event: MouseEvent): void => {
      if (!menuEl.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocumentClick);
    return () => document.removeEventListener("click", onDocumentClick);
  }, [menuOpen]);

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  function open(id: string): void {
    setActiveId(id);
    setUnread((u) => ({ ...u, [id]: 0 }));
    setTyping(false);
  }

  function append(id: string, message: Message): void {
    setConversations((list) =>
      list.map((c) =>
        c.id === id ? { ...c, messages: [...c.messages, message] } : c,
      ),
    );
  }

  function send(): void {
    const text = draft.trim();
    if (!text) return;
    const id = activeId;
    append(id, { id: `n${++nextId.current}`, mine: true, text, time: now() });
    setDraft("");
    // Runs only after a user action (never during SSR): a canned reply stands in for the other person.
    if (timer.current !== null) clearTimeout(timer.current);
    setTyping(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setTyping(false);
      const n = ++nextId.current;
      append(id, {
        id: `n${n}`,
        mine: false,
        text: REPLIES[n % REPLIES.length]!,
        time: now(),
      });
    }, 1400);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    send();
  }

  // Enter sends, Shift + Enter adds a new line.
  function onComposerKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      send();
    }
  }

  return (
    <div className="messages-template tpl-messages">
      <style>{css}</style>
      <div className="inbox">
        <nav className="list" aria-label="Conversations">
          <div className="list-head">
            <h2>Messages</h2>
            <SoneButton
              variant="ghost"
              size="icon-sm"
              type="button"
              aria-label="New message"
            >
              <SoneIcon icon="edit" />
            </SoneButton>
          </div>
          <input
            type="search"
            className="search"
            aria-label="Search conversations"
            placeholder="Search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className="people">
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="person"
                  aria-current={activeId === c.id ? "true" : undefined}
                  onClick={() => open(c.id)}
                >
                  <span className={c.online ? "presence online" : "presence"}>
                    <SoneAvatar size="sm" aria-hidden="true">
                      <SoneAvatarFallback>{c.initials}</SoneAvatarFallback>
                    </SoneAvatar>
                  </span>
                  <span className="person-text">
                    <span className="person-top">
                      <span className="person-name">{c.name}</span>
                      <span className="person-time">{last(c).time}</span>
                    </span>
                    <span className="person-preview">
                      {last(c).mine ? "You: " : ""}
                      {last(c).text}
                    </span>
                  </span>
                  {unread[c.id] ? (
                    <SoneBadge className="unread">
                      {unread[c.id]}
                      <span className="sr-only"> unread</span>
                    </SoneBadge>
                  ) : null}
                </button>
              </li>
            ))}
            {!visible.length && (
              <li className="empty">No conversations match “{query}”.</li>
            )}
          </ul>
        </nav>

        <section className="conversation" aria-labelledby="msg-title">
          <header className="conv-head">
            <SoneAvatar size="sm" aria-hidden="true">
              <SoneAvatarFallback>{active.initials}</SoneAvatarFallback>
            </SoneAvatar>
            <div className="conv-heading">
              <h3 id="msg-title">{active.name}</h3>
              <p>
                {active.role} · {active.online ? "Online" : "Away"}
              </p>
            </div>
            <div className="conv-actions">
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Start a call"
              >
                <SoneIcon icon="audio-lines" />
              </SoneButton>
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Favorite conversation"
                aria-pressed={starred}
                onClick={() => setStarred((s) => !s)}
              >
                <SoneIcon icon="star" />
              </SoneButton>
              {/* No React row menu yet: a ghost icon button that opens a SoneMenu below it. */}
              <div
                ref={menuEl}
                className="menu-anchor"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setMenuOpen(false);
                }}
              >
                <SoneButton
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  aria-label="Conversation actions"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="19" cy="12" r="1" />
                    <circle cx="5" cy="12" r="1" />
                  </svg>
                </SoneButton>
                {menuOpen && (
                  <SoneMenu
                    className="menu-panel"
                    aria-label="Conversation actions"
                    onClick={() => setMenuOpen(false)}
                  >
                    <SoneMenuItem type="button" role="menuitem">
                      <SoneIcon icon="bell-plus" /> Mute for 1 hour
                    </SoneMenuItem>
                    <SoneMenuItem type="button" role="menuitem">
                      <SoneIcon icon="search" /> Search in conversation
                    </SoneMenuItem>
                    <SoneMenuItem
                      type="button"
                      role="menuitem"
                      variant="destructive"
                    >
                      <SoneIcon icon="trash" /> Delete conversation
                    </SoneMenuItem>
                  </SoneMenu>
                )}
              </div>
            </div>
          </header>

          {/* No React chat thread yet: the same markup and classes as <sone-chat-thread>. */}
          <div
            ref={threadEl}
            data-slot="chat-thread"
            className="thread"
            role="log"
            aria-live="polite"
            aria-label={`Conversation with ${active.name}`}
          >
            <p className="day">
              <span>Today</span>
            </p>
            {/* No React message / bubble yet: the same markup as [soneMessage] and [soneBubble]. */}
            <div data-slot="message-group">
              {thread.map((m, i) => (
                <div
                  key={m.id}
                  data-slot="message"
                  data-align={m.mine ? "end" : "start"}
                >
                  {!m.mine && (
                    <SoneAvatar
                      data-slot="message-avatar"
                      size="sm"
                      aria-hidden="true"
                      className={
                        i > 0 && !thread[i - 1]!.mine
                          ? "hidden-avatar"
                          : undefined
                      }
                    >
                      <SoneAvatarFallback>{active.initials}</SoneAvatarFallback>
                    </SoneAvatar>
                  )}
                  <div data-slot="message-content">
                    {(i === 0 || thread[i - 1]!.mine !== m.mine) && (
                      <div data-slot="message-header">
                        {m.mine ? "You" : active.name} · {m.time}
                      </div>
                    )}
                    <div
                      data-slot="bubble"
                      data-variant={m.mine ? "default" : "muted"}
                      data-align={m.mine ? "end" : "start"}
                    >
                      <div data-slot="bubble-content">{m.text}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {typing && (
              <div data-slot="message" data-align="start">
                <SoneAvatar
                  data-slot="message-avatar"
                  size="sm"
                  aria-hidden="true"
                >
                  <SoneAvatarFallback>{active.initials}</SoneAvatarFallback>
                </SoneAvatar>
                <div data-slot="message-content">
                  {/* No React typing indicator yet: the same markup as <sone-typing-indicator>. */}
                  <div
                    data-slot="marker"
                    data-variant="default"
                    aria-label={`${active.name} is typing`}
                  >
                    <span data-slot="marker-icon" aria-hidden="true">
                      <SoneSpinner size={16} label={null} />
                    </span>
                    <span data-slot="marker-content" className="shimmer">
                      {active.name} is typing…
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="composer">
            {/* No React chat composer yet: the same markup and classes as <sone-chat-composer layout="block">. */}
            <div data-slot="chat-composer" data-layout="block">
              <SoneInputGroup as="form" onSubmit={onSubmit}>
                <SoneInputGroupTextarea
                  rows={1}
                  aria-label={`Message ${active.name}`}
                  placeholder={`Message ${active.name}…`}
                  value={draft}
                  onValueChange={setDraft}
                  onKeyDown={onComposerKeyDown}
                />
                <SoneInputGroupAddon
                  align="block-end"
                  data-chat-composer-footer=""
                >
                  <div data-slot="chat-composer-tools">
                    <div data-slot="chat-composer-tool">
                      <SoneButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        aria-label="Attach a file"
                      >
                        <SoneIcon icon="plus" />
                      </SoneButton>
                      <SoneButton
                        variant="ghost"
                        size="icon-sm"
                        type="button"
                        aria-label="Insert a link"
                      >
                        <SoneIcon icon="link" />
                      </SoneButton>
                    </div>
                  </div>
                  <span data-slot="chat-composer-submit">
                    <SoneButton
                      size="icon-sm"
                      type="submit"
                      disabled={!draft.trim()}
                      aria-label="Send"
                    >
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
                    </SoneButton>
                  </span>
                </SoneInputGroupAddon>
              </SoneInputGroup>
            </div>
            <p className="hint">Enter to send · Shift + Enter for a new line</p>
          </div>
        </section>
      </div>
    </div>
  );
}

const css = `
.tpl-messages.messages-template {
  display: block;
}
.tpl-messages .inbox {
  display: grid;
  grid-template-columns: 18rem minmax(0, 1fr);
  height: 640px;
}
.tpl-messages .list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  min-height: 0;
  padding: var(--space-4) var(--space-3);
  border-right: var(--border-width-thin) solid var(--border-subtle);
  background: var(--sidebar);
}
.tpl-messages .list-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-1);
}
.tpl-messages .list-head h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
}
.tpl-messages .people {
  display: grid;
  align-content: start;
  gap: var(--space-0_5);
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}
.tpl-messages .person {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-2);
  border: 0;
  border-radius: var(--radius-md);
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.tpl-messages .person:hover {
  background: var(--surface-hover);
}
.tpl-messages .person[aria-current="true"] {
  background: var(--accent-soft);
}
.tpl-messages .person:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}
.tpl-messages .presence {
  position: relative;
  flex: none;
}
.tpl-messages .presence.online::after {
  content: "";
  position: absolute;
  right: -1px;
  bottom: -1px;
  width: 9px;
  height: 9px;
  border: 2px solid var(--sidebar);
  border-radius: var(--radius-pill);
  background: var(--success);
}
.tpl-messages .person-text {
  display: grid;
  flex: 1 1 auto;
  min-width: 0;
}
.tpl-messages .person-top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-2);
}
.tpl-messages .person-name {
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}
.tpl-messages .person-time {
  flex: none;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-messages .person-preview {
  overflow: hidden;
  color: var(--text-secondary);
  font-size: var(--font-size-xs);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-messages .unread {
  flex: none;
}
.tpl-messages .empty {
  padding: var(--space-3);
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
.tpl-messages .conversation {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
}
.tpl-messages .conv-head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  border-bottom: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-messages .conv-heading {
  flex: 1 1 auto;
  min-width: 0;
}
.tpl-messages .conv-heading h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}
.tpl-messages .conv-heading p {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-messages .conv-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.tpl-messages .menu-anchor {
  position: relative;
  display: inline-flex;
}
.tpl-messages .menu-panel {
  position: absolute;
  top: calc(100% + var(--space-1));
  right: 0;
  width: 15rem;
  z-index: var(--z-dropdown);
}
.tpl-messages .thread {
  flex: 1 1 auto;
  min-height: 0;
  padding: var(--space-4);
}
.tpl-messages .day {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin: 0 0 var(--space-3);
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
.tpl-messages .day::before,
.tpl-messages .day::after {
  content: "";
  flex: 1 1 auto;
  border-top: var(--border-width-thin) solid var(--border-subtle);
}
.tpl-messages .hidden-avatar {
  visibility: hidden;
}
.tpl-messages .composer {
  display: grid;
  gap: var(--space-1);
  padding: var(--space-3) var(--space-4) var(--space-4);
}
.tpl-messages .hint {
  margin: 0;
  color: var(--text-muted);
  font-size: var(--font-size-xs);
}
@media (max-width: 720px) {
  .tpl-messages .inbox {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }
  .tpl-messages .list {
    border-right: 0;
    border-bottom: var(--border-width-thin) solid var(--border-subtle);
  }
  .tpl-messages .people {
    max-height: 12rem;
  }
  .tpl-messages .conversation {
    height: 560px;
  }
}

`;
