"use client";

import DOMPurify from "dompurify";
import { Marked, type Tokens } from "marked";
import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import {
  SoneBadge,
  SoneButton,
  SoneIcon,
  SoneSegmented,
  SoneSeparator,
  SoneSwitch,
  SoneTooltip,
  type SegmentOption,
} from "@surface-one/react";

import { type Doc, DOCS } from "../data/editor";

// The shared stylesheet (../styles/editor.css + editor.twins.css), prefixed with .tpl-editor.
import { css } from "../styles/scoped/editor.generated";

type Mode = "edit" | "split" | "preview";
type Command = "heading" | "bold" | "italic" | "link" | "bulleted";

interface Tool {
  readonly command: Command;
  readonly label: string;
  readonly icon: string;
  readonly sep?: boolean;
}

// The glyphs of the <sone-markdown-editor> toolbar (16×16, stroked).
const TOOLS: readonly Tool[] = [
  { command: "heading", label: "Heading", icon: "M4 3v10M12 3v10M4 8h8" },
  {
    command: "bold",
    label: "Bold",
    icon: "M5 3h4a2.5 2.5 0 0 1 0 5H5zM5 8h4.8a2.5 2.5 0 0 1 0 5H5z",
    sep: true,
  },
  { command: "italic", label: "Italic", icon: "M7 3h5M4 13h5M10 3 6 13" },
  {
    command: "link",
    label: "Link",
    icon: "M7 9a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.6.6M9 7a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.6-.6",
    sep: true,
  },
  {
    command: "bulleted",
    label: "Bulleted list",
    icon: "M6 4h8M6 8h8M6 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01",
    sep: true,
  },
];

const SHORTCUTS: Partial<Record<string, Command>> = {
  b: "bold",
  i: "italic",
  k: "link",
};

const modes: readonly SegmentOption[] = [
  { value: "edit", label: "Write" },
  { value: "split", label: "Split" },
  { value: "preview", label: "Preview" },
];

// The source is untrusted (typed or pasted), as in <sone-markdown>: raw HTML is escaped,
// links open in a new tab, task boxes are read-only spans, and DOMPurify cleans the rest.
const escapeHtml = (s: string): string =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const markdown = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    html: ({ text }: Tokens.HTML | Tokens.Tag) => escapeHtml(text),
    link({ href, title, tokens }: Tokens.Link) {
      const t = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(href)}"${t} target="_blank" rel="noopener noreferrer">${this.parser.parseInline(tokens)}</a>`;
    },
    checkbox: ({ checked }: Tokens.Checkbox) =>
      `<span class="markdown-task-box" role="checkbox" aria-label="Task" aria-checked="${checked}" aria-disabled="true"></span>`,
    listitem(item: Tokens.ListItem) {
      if (!item.task) return false;
      const cls = item.checked ? "markdown-task is-done" : "markdown-task";
      return `<li class="${cls}"><span class="markdown-task-text">${this.parser.parse(item.tokens)}</span></li>\n`;
    },
  },
});

export default function EditorTemplate() {
  const [docs, setDocs] = useState<readonly Doc[]>(DOCS);
  const [activeId, setActiveId] = useState("release");
  const [mode, setMode] = useState<Mode>("split");
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(false);
  /** The toolbar floats as a dock at the bottom of the pane, or sits above the text. */
  const [dock, setDock] = useState(true);
  const area = useRef<HTMLTextAreaElement>(null);
  const editorEl = useRef<HTMLDivElement>(null);
  const dockEl = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** The selection to restore once a formatting command has re-rendered the textarea. */
  const selection = useRef<readonly [number, number] | null>(null);

  const active = docs.find((d) => d.id === activeId)!;
  const words = active.body.split(/\s+/).filter((w) => /\w/.test(w)).length;
  const readingTime = Math.max(1, Math.round(words / 200));
  const saveText = saving ? "Saving…" : `Saved · ${active.edited}`;

  // DOMPurify needs a DOM, which server rendering does not have: the preview renders
  // only after mount, so the server and the hydrating client both start empty.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const previewHtml = useMemo(
    () =>
      mounted
        ? DOMPurify.sanitize(markdown.parse(active.body, { async: false }), {
            ADD_ATTR: ["target", "role"],
            FORBID_TAGS: [
              "style",
              "form",
              "input",
              "button",
              "textarea",
              "select",
            ],
          })
        : "",
    [mounted, active.body],
  );

  useEffect(
    () => () => {
      if (saveTimer.current !== null) clearTimeout(saveTimer.current);
    },
    [],
  );

  // After a formatting command, put the focus and the selection back in the textarea.
  useLayoutEffect(() => {
    const el = area.current;
    const range = selection.current;
    if (!el || !range) return;
    selection.current = null;
    el.focus();
    el.setSelectionRange(range[0], range[1]);
  }, [docs]);

  // The docked toolbar is `position: fixed`: like the Angular SoneFloatingDockDirective,
  // measure the editor and its scroll region into the `--markdown-editor-dock-*` variables
  // that markdown-editor.css reads, and re-measure on resize and on any scroll.
  useEffect(() => {
    const anchor = editorEl.current;
    const bar = dockEl.current;
    if (!dock || !anchor || !bar || typeof ResizeObserver === "undefined")
      return;
    const region = anchor.closest<HTMLElement>(".doc-pane");
    let clearance = 0;
    const set = (name: string, px: number) =>
      anchor.style.setProperty(`--markdown-editor-dock-${name}`, `${px}px`);
    const place = () => {
      const box = anchor.getBoundingClientRect();
      // Never above the editor's own top: below the fold, the dock waits below it too.
      const bottom = Math.min(
        region?.getBoundingClientRect().bottom ?? Infinity,
        Math.max(window.innerHeight, box.top + clearance),
      );
      set("h", bar.offsetHeight);
      set("w", box.width);
      set("left", box.left);
      set("right", document.documentElement.clientWidth - box.right);
      const inset = window.innerHeight - bottom;
      set("inset", inset);
      const gap = parseFloat(getComputedStyle(bar).bottom) - inset;
      clearance = bar.offsetHeight + 2 * gap;
    };
    const observer = new ResizeObserver(place);
    for (const el of [anchor, bar, region]) if (el) observer.observe(el);
    window.addEventListener("resize", place);
    document.addEventListener("scroll", place, {
      capture: true,
      passive: true,
    });
    place();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      document.removeEventListener("scroll", place, { capture: true });
    };
  }, [dock]);

  function open(id: string): void {
    setActiveId(id);
    setPublished(false);
  }

  function create(): void {
    const id = `doc-${docs.length + 1}`;
    setDocs([{ id, title: "", body: "", edited: "just now" }, ...docs]);
    open(id);
    setMode("edit");
  }

  function patch(change: Partial<Doc>): void {
    const id = activeId;
    setDocs((all) =>
      all.map((d) =>
        d.id === id ? { ...d, ...change, edited: "just now" } : d,
      ),
    );
    setPublished(false);
    // A debounced autosave: a real app sends the draft to its API here.
    setSaving(true);
    if (saveTimer.current !== null) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      setSaving(false);
    }, 700);
  }

  function publish(): void {
    setPublished(true);
  }

  /** Applies a formatting command to the textarea selection, then restores the selection. */
  function format(command: Command): void {
    const el = area.current;
    if (!el) return;
    const value = el.value;
    let start = el.selectionStart;
    let end = el.selectionEnd;
    let next: string;
    if (command === "bold" || command === "italic") {
      const marker = command === "bold" ? "**" : "_";
      next =
        value.slice(0, start) +
        marker +
        value.slice(start, end) +
        marker +
        value.slice(end);
      start += marker.length;
      end += marker.length;
    } else if (command === "link") {
      const text = value.slice(start, end) || "link text";
      const url = "https://";
      next = `${value.slice(0, start)}[${text}](${url})${value.slice(end)}`;
      start += text.length + 3;
      end = start + url.length;
    } else {
      // Line commands: toggle a "## " or "- " prefix on every selected line.
      const prefix = command === "heading" ? "## " : "- ";
      const from = value.lastIndexOf("\n", start - 1) + 1;
      const lines = value.slice(from, end).split("\n");
      const on = lines.every((l) => l.startsWith(prefix));
      const changed = lines.map((l) =>
        on ? l.slice(prefix.length) : prefix + l,
      );
      next = value.slice(0, from) + changed.join("\n") + value.slice(end);
      const delta = (on ? -1 : 1) * prefix.length;
      start = Math.max(from, start + delta);
      end += delta * lines.length;
    }
    selection.current = [start, end];
    patch({ body: next });
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>): void {
    if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
      return;
    const command = SHORTCUTS[event.key.toLowerCase()];
    if (!command) return;
    event.preventDefault();
    format(command);
  }

  return (
    <div className="editor-app tpl-editor">
      <style>{css}</style>
      <nav className="docs" aria-label="Documents">
        <div className="docs-head">
          <h2>Documents</h2>
          <SoneButton
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="New document"
            onClick={create}
          >
            <SoneIcon icon="note-add" />
          </SoneButton>
        </div>
        <ul>
          {docs.map((d) => (
            <li key={d.id}>
              <button
                type="button"
                className="doc"
                aria-current={activeId === d.id ? "true" : undefined}
                onClick={() => open(d.id)}
              >
                <SoneIcon icon="document" size="sm" />
                <span className="doc-text">
                  <span className="doc-title">{d.title || "Untitled"}</span>
                  <span className="doc-meta">{d.edited}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <section className="doc-pane" aria-label="Editor">
        <div className="doc-bar">
          <label className="sr-only" htmlFor="editor-title">
            Title
          </label>
          <input
            id="editor-title"
            className="title"
            type="text"
            placeholder="Untitled"
            value={active.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
          <SoneSegmented
            value={mode}
            onValueChange={(v) => setMode(v as Mode)}
            size="sm"
            ariaLabel="Editor layout"
            options={modes}
          />
          <div className="dock-toggle">
            <SoneSwitch
              checked={dock}
              onCheckedChange={setDock}
              size="sm"
              inputId="editor-dock"
            />
            <label htmlFor="editor-dock">Floating toolbar</label>
          </div>
          <SoneButton size="sm" type="button" onClick={publish}>
            <SoneIcon icon="share" />
            <span>{published ? "Published" : "Publish"}</span>
          </SoneButton>
        </div>

        {/* No React markdown editor component yet: the same markup and classes as <sone-markdown-editor>. */}
        <div
          ref={editorEl}
          className="markdown-editor editor"
          data-slot="markdown-editor"
          data-mode={mode}
          data-appearance="field"
          data-toolbar-placement={dock ? "dock" : "top"}
          style={{ "--markdown-editor-rows": 14 } as CSSProperties}
        >
          <div
            ref={dockEl}
            className="markdown-editor-header"
            data-slot="markdown-editor-header"
          >
            <div
              className="markdown-editor-toolbar"
              role="toolbar"
              aria-label="Formatting"
              aria-controls={mode !== "preview" ? "editor-area" : undefined}
            >
              {TOOLS.map((tool) => (
                <Fragment key={tool.command}>
                  {tool.sep && (
                    <SoneSeparator
                      orientation="vertical"
                      className="markdown-editor-sep"
                    />
                  )}
                  <SoneTooltip text={tool.label}>
                    <SoneButton
                      variant="ghost"
                      size="icon-sm"
                      type="button"
                      aria-label={tool.label}
                      disabled={mode === "preview"}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => format(tool.command)}
                    >
                      <svg
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d={tool.icon} />
                      </svg>
                    </SoneButton>
                  </SoneTooltip>
                </Fragment>
              ))}
            </div>
            <div className="markdown-editor-tools tools">
              <SoneBadge variant="secondary">Markdown</SoneBadge>
            </div>
          </div>

          <div className="markdown-editor-panes">
            {mode !== "preview" && (
              <div className="markdown-editor-pane markdown-editor-write">
                <div className="markdown-editor-grow" data-value={active.body}>
                  <textarea
                    id="editor-area"
                    ref={area}
                    className="markdown-editor-area"
                    aria-label="Document body"
                    placeholder="Write in markdown…"
                    autoComplete="off"
                    rows={14}
                    value={active.body}
                    onChange={(e) => patch({ body: e.target.value })}
                    onKeyDown={onKeyDown}
                  />
                </div>
              </div>
            )}
            {mode !== "edit" && (
              <div className="markdown-editor-pane markdown-editor-preview">
                {/* No React markdown component yet: the same markup and classes as <sone-markdown>. */}
                {active.body.trim() ? (
                  <div
                    className="markdown"
                    data-slot="markdown"
                    data-size="sm"
                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                  />
                ) : (
                  <p className="markdown-editor-empty">Nothing to preview</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="doc-foot">
          <span>
            {words} words · {readingTime} min read
          </span>
          <span role="status">{saveText}</span>
        </div>
      </section>
    </div>
  );
}
