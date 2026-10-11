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

import { type Doc, DOCS } from "./data/editor";

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
  `,
  styleUrl: "./styles/editor.css",
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
