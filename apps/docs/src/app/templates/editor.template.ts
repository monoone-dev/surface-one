import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from "@angular/core";
import { SoneBadgeDirective } from "@surface-one/angular/badge";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SoneIconComponent } from "@surface-one/angular/icon";
import {
  SONE_MARKDOWN_EDITOR_PARTS,
  type MarkdownEditorMode,
} from "@surface-one/angular/markdown";
import {
  SoneSegmentedComponent,
  type SegmentOption,
} from "@surface-one/angular/segmented";
import { SoneSwitchComponent } from "@surface-one/angular/switch";

interface Doc {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly edited: string;
}

const DOCS: readonly Doc[] = [
  {
    id: "release",
    title: "Harbor release notes",
    edited: "2 min ago",
    body: `## What's new in Harbor 2.4

Harbor now imports meetings from **every calendar** you connect, and the search finds words inside transcripts.

### Highlights

- Calendar sync for Google and Outlook
- Search inside transcripts, with \`speaker:\` filters
- Faster exports — up to *3× quicker* for long meetings

### Before you upgrade

1. Back up your workspace from **Settings → Data**
2. Ask admins to re-approve the calendar scopes
3. Read the [migration guide](https://example.com/guide)

- [x] Draft the notes
- [ ] Legal review
- [ ] Publish on Oct 18

> Questions? Reply in the #harbor-launch channel.`,
  },
  {
    id: "rfc",
    title: "RFC: transcript search",
    edited: "Yesterday",
    body: `## Problem

Search only matches meeting titles, so people cannot find what was *said*.

## Proposal

Index transcript segments and rank them by recency and speaker.`,
  },
  {
    id: "retro",
    title: "Sprint 41 retro",
    edited: "Mon",
    body: `## Went well

- Billing dry run caught two bugs early

## To improve

- Freeze dates need a calendar reminder`,
  },
];

@Component({
  selector: "docs-editor-template",
  imports: [
    ...SONE_MARKDOWN_EDITOR_PARTS,
    SoneBadgeDirective,
    SoneButtonDirective,
    SoneIconComponent,
    SoneSegmentedComponent,
    SoneSwitchComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="editor-app">
      <nav class="docs" aria-label="Documents">
        <div class="docs-head">
          <h2>Documents</h2>
          <button
            soneBtn
            variant="ghost"
            size="icon-sm"
            type="button"
            aria-label="New document"
            (click)="create()"
          >
            <sone-icon icon="note-add" />
          </button>
        </div>
        <ul>
          @for (d of docs(); track d.id) {
            <li>
              <button
                type="button"
                class="doc"
                [attr.aria-current]="activeId() === d.id ? 'true' : null"
                (click)="open(d.id)"
              >
                <sone-icon icon="document" size="sm" />
                <span class="doc-text">
                  <span class="doc-title">{{ d.title || "Untitled" }}</span>
                  <span class="doc-meta">{{ d.edited }}</span>
                </span>
              </button>
            </li>
          }
        </ul>
      </nav>

      <section class="doc-pane" aria-label="Editor">
        <div class="doc-bar">
          <label class="sr-only" for="editor-title">Title</label>
          <input
            id="editor-title"
            class="title"
            type="text"
            placeholder="Untitled"
            [value]="active().title"
            (input)="patch({ title: $any($event.target).value })"
          />
          <sone-segmented
            size="sm"
            ariaLabel="Editor layout"
            [options]="modes"
            [value]="mode()"
            (valueChange)="mode.set($any($event))"
          />
          <div class="dock-toggle">
            <sone-switch size="sm" inputId="editor-dock" [(checked)]="dock" />
            <label for="editor-dock">Floating toolbar</label>
          </div>
          <button soneBtn size="sm" type="button" (click)="publish()">
            <sone-icon icon="share" /><span>{{
              published() ? "Published" : "Publish"
            }}</span>
          </button>
        </div>

        <sone-markdown-editor
          class="editor"
          ariaLabel="Document body"
          placeholder="Write in markdown…"
          toolbar="full"
          [toolbarPlacement]="dock() ? 'dock' : 'top'"
          [tabs]="false"
          [minRows]="14"
          [(mode)]="mode"
          [value]="active().body"
          (valueChange)="patch({ body: $event })"
        >
          <div soneMarkdownEditorTools class="tools">
            <span soneBadge variant="secondary">Markdown</span>
          </div>
        </sone-markdown-editor>

        <div class="doc-foot">
          <span>{{ words() }} words · {{ readingTime() }} min read</span>
          <span role="status">{{ saveText() }}</span>
        </div>
      </section>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
    .editor-app {
      display: grid;
      grid-template-columns: 15rem minmax(0, 1fr);
      height: 680px;
    }
    .docs {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding: var(--space-4) var(--space-3);
      border-right: var(--border-width-thin) solid var(--border-subtle);
      background: var(--sidebar);
    }
    .docs-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-1);
    }
    .docs-head h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: var(--font-size-md);
      font-weight: var(--font-weight-semibold);
    }
    .docs ul {
      display: grid;
      gap: var(--space-0_5);
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .doc {
      display: flex;
      align-items: flex-start;
      gap: var(--space-2);
      width: 100%;
      padding: var(--space-2);
      border: 0;
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--text-secondary);
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .doc:hover {
      background: var(--surface-hover);
    }
    .doc[aria-current="true"] {
      background: var(--accent-soft);
      color: var(--text-primary);
    }
    .doc:focus-visible {
      outline: none;
      box-shadow: var(--focus-ring);
    }
    .doc-text {
      display: grid;
      min-width: 0;
    }
    .doc-title {
      overflow: hidden;
      color: var(--text-primary);
      font-size: var(--font-size-sm);
      font-weight: var(--font-weight-medium);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .doc-meta {
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    .doc-pane {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      min-width: 0;
      /* The editor scrolls inside its pane: the docked toolbar floats at the bottom of
         this region, not of the whole page. */
      min-height: 0;
      overflow-y: auto;
      padding: var(--space-5) var(--space-6);
    }
    .doc-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }
    .doc-bar .title {
      flex: 1 1 14rem;
      width: auto;
      height: auto;
      padding: var(--space-1) 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      color: var(--text-primary);
      font-size: var(--font-size-xl);
      font-weight: var(--font-weight-semibold);
      box-shadow: none;
    }
    .doc-bar .title:focus-visible {
      outline: none;
      box-shadow: inset 0 calc(var(--border-width-thick) * -1) 0 var(--accent);
    }
    .dock-toggle {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
      white-space: nowrap;
    }
    .editor {
      flex: 1 0 auto;
    }
    .tools {
      margin-left: auto;
    }
    .doc-foot {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      color: var(--text-muted);
      font-size: var(--font-size-xs);
    }
    @media (max-width: 720px) {
      .editor-app {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
        height: 760px;
      }
      .docs {
        border-right: 0;
        border-bottom: var(--border-width-thin) solid var(--border-subtle);
        max-height: 11rem;
        overflow-y: auto;
      }
      .doc-pane {
        padding: var(--space-4);
      }
    }
  `,
})
export default class Template {
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly modes: readonly SegmentOption[] = [
    { value: "edit", label: "Write" },
    { value: "split", label: "Split" },
    { value: "preview", label: "Preview" },
  ];

  protected readonly docs = signal<readonly Doc[]>(DOCS);
  protected readonly activeId = signal("release");
  protected readonly mode = signal<MarkdownEditorMode>("split");
  /** The toolbar floats as a dock at the bottom of the pane, or sits above the text. */
  protected readonly dock = signal(true);
  protected readonly saving = signal(false);
  protected readonly published = signal(false);

  protected readonly active = computed(() =>
    this.docs().find((d) => d.id === this.activeId())!,
  );
  protected readonly words = computed(
    () =>
      this.active()
        .body.split(/\s+/)
        .filter((w) => /\w/.test(w)).length,
  );
  protected readonly readingTime = computed(() =>
    Math.max(1, Math.round(this.words() / 200)),
  );
  protected readonly saveText = computed(() =>
    this.saving() ? "Saving…" : `Saved · ${this.active().edited}`,
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      if (this.saveTimer !== null) clearTimeout(this.saveTimer);
    });
  }

  protected open(id: string): void {
    this.activeId.set(id);
    this.published.set(false);
  }

  protected create(): void {
    const id = `doc-${this.docs().length + 1}`;
    this.docs.update((all) => [
      { id, title: "", body: "", edited: "just now" },
      ...all,
    ]);
    this.open(id);
    this.mode.set("edit");
  }

  protected patch(change: Partial<Doc>): void {
    const id = this.activeId();
    this.docs.update((all) =>
      all.map((d) =>
        d.id === id ? { ...d, ...change, edited: "just now" } : d,
      ),
    );
    this.published.set(false);
    // A debounced autosave: a real app sends the draft to its API here.
    this.saving.set(true);
    if (this.saveTimer !== null) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.saving.set(false);
    }, 700);
  }

  protected publish(): void {
    this.published.set(true);
  }
}
