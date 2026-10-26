"use client";

import DOMPurify from "dompurify";
import { marked } from "marked";
import { useEffect, useState, type FormEvent } from "react";
import {
  SoneAvatar,
  SoneAvatarFallback,
  SoneBadge,
  SoneButton,
  SoneField,
  SoneFieldGroup,
  SoneFieldLabel,
  SoneIcon,
  SoneLogo,
  SoneProgress,
  SoneSelect,
  SoneTooltip,
  type BadgeVariant,
  type ShellIcon,
} from "@surface-one/react";

import { type Task, type Comment, BRIEF } from "../data/workspace";

// The shared stylesheet (../styles/workspace.css + workspace.twins.css), prefixed with .tpl-workspace.
import { css } from "../styles/scoped/workspace.generated";

interface NavItem {
  readonly id: string;
  readonly label: string;
  readonly icon: ShellIcon;
  readonly badge?: number;
}

const STATUSES: Record<string, { label: string; variant: BadgeVariant }> = {
  todo: { label: "To do", variant: "outline" },
  progress: { label: "In progress", variant: "secondary" },
  review: { label: "In review", variant: "warning" },
  done: { label: "Done", variant: "success" },
};

const nav: readonly NavItem[] = [
  { id: "inbox", label: "Inbox", icon: "bell-ring", badge: 3 },
  { id: "tasks", label: "My tasks", icon: "list-checks" },
  { id: "meetings", label: "Meetings", icon: "meetings" },
  { id: "notes", label: "Notes", icon: "notes" },
];
const projects = [
  "Harbor launch",
  "Billing migration",
  "Onboarding v2",
] as const;
const statusOptions = Object.entries(STATUSES).map(([value, s]) => ({
  value,
  label: s.label,
}));

const INITIAL_TASKS: readonly Task[] = [
  { id: "map", label: "Map legacy_eur prices to cents", done: true },
  { id: "backfill", label: "Backfill affected subscriptions", done: false },
  { id: "dry-run", label: "Re-run the migration dry run", done: false },
];

const INITIAL_COMMENTS: readonly Comment[] = [
  {
    id: "c1",
    author: "Leo Ruiz",
    initials: "LR",
    time: "09:24",
    text: "Mapping is done in the PR. Backfill script is next.",
  },
  {
    id: "c2",
    author: "Ada Park",
    initials: "AP",
    time: "10:02",
    text: "Thanks! Please ping me once the dry run is green.",
  },
];

export default function WorkspaceTemplate() {
  // Template-local sidebar state (no persistence), like the Angular sidebar service.
  // The menu tooltips show only while the sidebar is collapsed to icons.
  const [navOpen, setNavOpen] = useState(true);
  const navState = navOpen ? "expanded" : "collapsed";

  const [details, setDetails] = useState(true);
  const [status, setStatus] = useState("progress");
  const [priority, setPriority] = useState("high");
  const [draft, setDraft] = useState("");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [comments, setComments] = useState(INITIAL_COMMENTS);

  const statusInfo = STATUSES[status]!;
  const doneCount = tasks.filter((t) => t.done).length;

  // DOMPurify needs a DOM, which server rendering does not have: the brief renders
  // only after mount, so the server and the hydrating client both start empty.
  const [briefHtml, setBriefHtml] = useState("");
  useEffect(() => {
    setBriefHtml(
      DOMPurify.sanitize(
        marked.parse(BRIEF, { async: false, gfm: true, breaks: true }),
      ),
    );
  }, []);

  function toggle(id: string): void {
    setTasks((all) =>
      all.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function comment(event: FormEvent): void {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setComments((all) => [
      ...all,
      {
        id: `c${all.length + 1}`,
        author: "You",
        initials: "YO",
        time: "now",
        text,
      },
    ]);
    setDraft("");
  }

  return (
    <div
      data-slot="sidebar-wrapper"
      data-state={navState}
      className="tpl-workspace shell"
    >
      <style>{css}</style>
      {/* The same markup and classes as [soneSidebarWrapper] / <sone-sidebar>. */}
      {/* Left sidebar: navigation, collapses to icons */}
      <nav
        data-slot="sidebar"
        data-state={navState}
        data-collapsible={navOpen ? "" : "icon"}
        data-variant="inset"
        data-side="left"
        aria-label="Workspace"
        className="nav"
      >
        <div data-slot="sidebar-container" data-side="left">
          <div data-slot="sidebar-inner" data-sidebar="sidebar">
            <div data-slot="sidebar-header" data-sidebar="header">
              <div className="brand">
                <SoneLogo size="sm" />
                <span className="brand-name">Northwind Studio</span>
              </div>
            </div>
            <div data-slot="sidebar-content" data-sidebar="content">
              <div data-slot="sidebar-group" data-sidebar="group">
                <div data-slot="sidebar-group-label" data-sidebar="group-label">
                  Workspace
                </div>
                <ul data-slot="sidebar-menu" data-sidebar="menu">
                  {nav.map((item) => (
                    <li
                      key={item.id}
                      data-slot="sidebar-menu-item"
                      data-sidebar="menu-item"
                    >
                      <SoneTooltip
                        text={item.label}
                        side="right"
                        disabled={navOpen}
                      >
                        <button
                          data-slot="sidebar-menu-button"
                          data-sidebar="menu-button"
                          data-size="default"
                          data-variant="default"
                          type="button"
                          data-active={item.id === "tasks" ? "true" : undefined}
                          aria-current={
                            item.id === "tasks" ? "page" : undefined
                          }
                        >
                          <SoneIcon icon={item.icon} />
                          <span>{item.label}</span>
                        </button>
                      </SoneTooltip>
                      {item.badge ? (
                        <span
                          data-slot="sidebar-menu-badge"
                          data-sidebar="menu-badge"
                        >
                          {item.badge}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
              <hr
                data-slot="sidebar-separator"
                data-sidebar="separator"
                data-orientation="horizontal"
                className="separator"
                role="none"
              />
              <div data-slot="sidebar-group" data-sidebar="group">
                <div data-slot="sidebar-group-label" data-sidebar="group-label">
                  Projects
                </div>
                <ul data-slot="sidebar-menu" data-sidebar="menu">
                  {projects.map((p) => (
                    <li
                      key={p}
                      data-slot="sidebar-menu-item"
                      data-sidebar="menu-item"
                    >
                      <SoneTooltip text={p} side="right" disabled={navOpen}>
                        <button
                          data-slot="sidebar-menu-button"
                          data-sidebar="menu-button"
                          data-size="sm"
                          data-variant="default"
                          type="button"
                          data-active={
                            p === "Billing migration" ? "true" : undefined
                          }
                        >
                          <SoneIcon icon="folder" />
                          <span>{p}</span>
                        </button>
                      </SoneTooltip>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div data-slot="sidebar-footer" data-sidebar="footer">
              <ul data-slot="sidebar-menu" data-sidebar="menu">
                <li data-slot="sidebar-menu-item" data-sidebar="menu-item">
                  <SoneTooltip text="Settings" side="right" disabled={navOpen}>
                    <button
                      data-slot="sidebar-menu-button"
                      data-sidebar="menu-button"
                      data-size="default"
                      data-variant="default"
                      type="button"
                    >
                      <SoneIcon icon="settings" />
                      <span>Settings</span>
                    </button>
                  </SoneTooltip>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* The rail toggles the sidebar on click (the Angular rail also resizes it by dragging). */}
        <div
          data-slot="sidebar-rail"
          data-sidebar="rail"
          role="button"
          tabIndex={-1}
          aria-label="Toggle sidebar"
          title={navOpen ? "Click to collapse" : "Click to expand"}
          onClick={() => setNavOpen((open) => !open)}
        />
      </nav>

      <div data-slot="sidebar-inset" className="inset">
        <div className="topbar">
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            data-sidebar="trigger"
            aria-label="Toggle navigation"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((open) => !open)}
          >
            <SoneIcon icon="sidebar" />
          </SoneButton>
          <span className="crumbs">
            Billing migration <span aria-hidden="true">/</span> NW-142
          </span>
          <span className="spacer" />
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="Show details"
            aria-controls="ws-details"
            aria-expanded={details}
            onClick={() => setDetails((open) => !open)}
          >
            <SoneIcon icon="sidebar" className="flip" />
          </SoneButton>
        </div>

        <div className="main">
          {/* Centre: the task itself */}
          <article className="content" aria-labelledby="ws-title">
            <p className="eyebrow">
              NW-142 ·{" "}
              <SoneBadge variant={statusInfo.variant}>
                {statusInfo.label}
              </SoneBadge>
            </p>
            <h2 id="ws-title">Fix the EUR price mapping before the freeze</h2>
            {/* The same markup and classes as <sone-markdown>. */}
            <div
              className="markdown"
              data-slot="markdown"
              data-size="sm"
              dangerouslySetInnerHTML={{ __html: briefHtml }}
            />

            <h3 className="sub">
              Checklist
              <span className="sub-meta">
                {doneCount} of {tasks.length}
              </span>
            </h3>
            <SoneProgress
              size="sm"
              aria-label="Checklist progress"
              value={doneCount}
              max={tasks.length}
            />
            <ul className="tasks">
              {tasks.map((t) => (
                <li key={t.id}>
                  <SoneField orientation="horizontal">
                    <input
                      id={`ws-task-${t.id}`}
                      type="checkbox"
                      checked={t.done}
                      onChange={() => toggle(t.id)}
                    />
                    <SoneFieldLabel
                      htmlFor={`ws-task-${t.id}`}
                      className={t.done ? "done" : undefined}
                    >
                      {t.label}
                    </SoneFieldLabel>
                  </SoneField>
                </li>
              ))}
            </ul>

            <h3 className="sub">Activity</h3>
            {/* The same data-slot attributes as [soneMessage*]. */}
            <div data-slot="message-group" className="activity">
              {comments.map((c) => (
                <div key={c.id} data-slot="message" data-align="start">
                  <SoneAvatar
                    data-slot="message-avatar"
                    size="sm"
                    aria-hidden="true"
                  >
                    <SoneAvatarFallback>{c.initials}</SoneAvatarFallback>
                  </SoneAvatar>
                  <div data-slot="message-content">
                    <div data-slot="message-header">
                      {c.author} · {c.time}
                    </div>
                    <p className="comment">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <form className="reply" onSubmit={comment}>
              <label className="sr-only" htmlFor="ws-comment">
                Add a comment
              </label>
              <textarea
                id="ws-comment"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={2}
                placeholder="Add a comment…"
              />
              <SoneButton size="sm" type="submit" disabled={!draft.trim()}>
                Comment
              </SoneButton>
            </form>
          </article>
        </div>
      </div>
      {/* Right sidebar: properties of the task */}
      {/* The same classes as [soneSidePanel] and its parts. */}
      {details ? (
        <div
          id="ws-details"
          className="side-panel details"
          data-slot="side-panel"
          role="region"
          aria-labelledby="ws-details-title"
        >
          <div className="side-panel-header" data-slot="side-panel-header">
            <h3
              id="ws-details-title"
              className="side-panel-title"
              data-slot="side-panel-title"
            >
              Details
            </h3>
            <div className="side-panel-actions" data-slot="side-panel-actions">
              <SoneButton
                variant="ghost"
                size="icon-sm"
                type="button"
                aria-label="Hide details"
                onClick={() => setDetails(false)}
              >
                <SoneIcon icon="close" />
              </SoneButton>
            </div>
          </div>
          <div className="side-panel-content" data-slot="side-panel-content">
            <SoneFieldGroup>
              <SoneField>
                <SoneFieldLabel htmlFor="ws-status">Status</SoneFieldLabel>
                <SoneSelect
                  value={status}
                  onValueChange={setStatus}
                  size="sm"
                  selectId="ws-status"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </SoneSelect>
              </SoneField>
              <SoneField>
                <SoneFieldLabel htmlFor="ws-priority">Priority</SoneFieldLabel>
                <SoneSelect
                  value={priority}
                  onValueChange={setPriority}
                  size="sm"
                  selectId="ws-priority"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </SoneSelect>
              </SoneField>
            </SoneFieldGroup>
            <dl className="props">
              <div>
                <dt>Assignee</dt>
                <dd className="person">
                  <SoneAvatar size="sm" aria-hidden="true">
                    <SoneAvatarFallback>LR</SoneAvatarFallback>
                  </SoneAvatar>
                  Leo Ruiz
                </dd>
              </div>
              <div>
                <dt>Reviewer</dt>
                <dd className="person">
                  <SoneAvatar size="sm" aria-hidden="true">
                    <SoneAvatarFallback>AP</SoneAvatarFallback>
                  </SoneAvatar>
                  Ada Park
                </dd>
              </div>
              <div>
                <dt>Due</dt>
                <dd>Oct 14</dd>
              </div>
              <div>
                <dt>Estimate</dt>
                <dd>3 points</dd>
              </div>
              <div>
                <dt>Labels</dt>
                <dd className="labels">
                  <SoneBadge variant="outline">billing</SoneBadge>
                  <SoneBadge variant="outline">migration</SoneBadge>
                  <SoneBadge variant="destructive">blocker</SoneBadge>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      ) : null}
    </div>
  );
}
