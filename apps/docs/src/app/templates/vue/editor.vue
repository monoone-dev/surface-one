<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import DOMPurify from "dompurify";
import { Marked, type Tokens } from "marked";
import {
  SoneBadge,
  SoneButton,
  SoneIcon,
  SoneSegmented,
  SoneSeparator,
  SoneSwitch,
  vSoneTooltip,
  type SegmentOption,
} from "@surface-one/vue";

import { type Doc, DOCS } from "../data/editor";

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

const docs = ref<readonly Doc[]>(DOCS);
const activeId = ref("release");
const mode = ref<Mode>("split");
const saving = ref(false);
const published = ref(false);
const area = useTemplateRef<HTMLTextAreaElement>("area");
/** The toolbar floats as a dock at the bottom of the pane, or sits above the text. */
const dock = ref(true);
const editorEl = useTemplateRef<HTMLElement>("editorEl");
const dockEl = useTemplateRef<HTMLElement>("dockEl");
let saveTimer: ReturnType<typeof setTimeout> | null = null;

const active = computed(() => docs.value.find((d) => d.id === activeId.value)!);
const words = computed(
  () => active.value.body.split(/\s+/).filter((w) => /\w/.test(w)).length,
);
const readingTime = computed(() => Math.max(1, Math.round(words.value / 200)));
const saveText = computed(() =>
  saving.value ? "Saving…" : `Saved · ${active.value.edited}`,
);

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

// DOMPurify needs a DOM, which server rendering does not have: the preview renders
// only after mount, so the server and the hydrating client both start empty.
const mounted = ref(false);
onMounted(() => (mounted.value = true));
const previewHtml = computed(() =>
  mounted.value
    ? DOMPurify.sanitize(markdown.parse(active.value.body, { async: false }), {
        ADD_ATTR: ["target", "role"],
        FORBID_TAGS: ["style", "form", "input", "button", "textarea", "select"],
      })
    : "",
);

onBeforeUnmount(() => {
  if (saveTimer !== null) clearTimeout(saveTimer);
});

// The docked toolbar is `position: fixed`: like the Angular SoneFloatingDockDirective,
// measure the editor and its scroll region into the `--markdown-editor-dock-*` variables
// that markdown-editor.css reads, and re-measure on resize and on any scroll.
let stopDock: (() => void) | null = null;
function followDock(): void {
  stopDock?.();
  stopDock = null;
  const anchor = editorEl.value;
  const bar = dockEl.value;
  if (!dock.value || !anchor || !bar || typeof ResizeObserver === "undefined")
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
  document.addEventListener("scroll", place, { capture: true, passive: true });
  place();
  stopDock = () => {
    observer.disconnect();
    window.removeEventListener("resize", place);
    document.removeEventListener("scroll", place, { capture: true });
  };
}
onMounted(() => watch(dock, () => nextTick(followDock), { immediate: true }));
onBeforeUnmount(() => stopDock?.());

function open(id: string): void {
  activeId.value = id;
  published.value = false;
}

function create(): void {
  const id = `doc-${docs.value.length + 1}`;
  docs.value = [{ id, title: "", body: "", edited: "just now" }, ...docs.value];
  open(id);
  mode.value = "edit";
}

function patch(change: Partial<Doc>): void {
  const id = activeId.value;
  docs.value = docs.value.map((d) =>
    d.id === id ? { ...d, ...change, edited: "just now" } : d,
  );
  published.value = false;
  // A debounced autosave: a real app sends the draft to its API here.
  saving.value = true;
  if (saveTimer !== null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saving.value = false;
  }, 700);
}

function publish(): void {
  published.value = true;
}

/** Applies a formatting command to the textarea selection, then restores the selection. */
function format(command: Command): void {
  const el = area.value;
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
  patch({ body: next });
  void nextTick(() => {
    el.focus();
    el.setSelectionRange(start, end);
  });
}

function onKeydown(event: KeyboardEvent): void {
  if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey)
    return;
  const command = SHORTCUTS[event.key.toLowerCase()];
  if (!command) return;
  event.preventDefault();
  format(command);
}
</script>

<template>
  <div class="editor-app">
    <nav class="docs" aria-label="Documents">
      <div class="docs-head">
        <h2>Documents</h2>
        <SoneButton
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label="New document"
          @click="create"
        >
          <SoneIcon icon="note-add" />
        </SoneButton>
      </div>
      <ul>
        <li v-for="d in docs" :key="d.id">
          <button
            type="button"
            class="doc"
            :aria-current="activeId === d.id ? 'true' : undefined"
            @click="open(d.id)"
          >
            <SoneIcon icon="document" size="sm" />
            <span class="doc-text">
              <span class="doc-title">{{ d.title || "Untitled" }}</span>
              <span class="doc-meta">{{ d.edited }}</span>
            </span>
          </button>
        </li>
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
          :value="active.title"
          @input="patch({ title: ($event.target as HTMLInputElement).value })"
        />
        <SoneSegmented
          v-model="mode"
          size="sm"
          aria-label="Editor layout"
          :options="modes"
        />
        <div class="dock-toggle">
          <SoneSwitch v-model="dock" size="sm" input-id="editor-dock" />
          <label for="editor-dock">Floating toolbar</label>
        </div>
        <SoneButton size="sm" type="button" @click="publish">
          <SoneIcon icon="share" /><span>{{
            published ? "Published" : "Publish"
          }}</span>
        </SoneButton>
      </div>

      <!-- No Vue markdown editor component yet: the same markup and classes as <sone-markdown-editor>. -->
      <div
        ref="editorEl"
        class="markdown-editor editor"
        data-slot="markdown-editor"
        :data-mode="mode"
        data-appearance="field"
        :data-toolbar-placement="dock ? 'dock' : 'top'"
        style="--markdown-editor-rows: 14"
      >
        <div
          ref="dockEl"
          class="markdown-editor-header"
          data-slot="markdown-editor-header"
        >
          <div
            class="markdown-editor-toolbar"
            role="toolbar"
            aria-label="Formatting"
            :aria-controls="mode !== 'preview' ? 'editor-area' : undefined"
          >
            <template v-for="tool in TOOLS" :key="tool.command">
              <SoneSeparator
                v-if="tool.sep"
                orientation="vertical"
                class="markdown-editor-sep"
              />
              <SoneButton
                v-sone-tooltip="tool.label"
                variant="ghost"
                size="icon-sm"
                type="button"
                :aria-label="tool.label"
                :disabled="mode === 'preview'"
                @mousedown.prevent
                @click="format(tool.command)"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path :d="tool.icon" />
                </svg>
              </SoneButton>
            </template>
          </div>
          <div class="markdown-editor-tools tools">
            <SoneBadge variant="secondary">Markdown</SoneBadge>
          </div>
        </div>

        <div class="markdown-editor-panes">
          <div
            v-if="mode !== 'preview'"
            class="markdown-editor-pane markdown-editor-write"
          >
            <div class="markdown-editor-grow" :data-value="active.body">
              <textarea
                id="editor-area"
                ref="area"
                class="markdown-editor-area"
                aria-label="Document body"
                placeholder="Write in markdown…"
                autocomplete="off"
                rows="14"
                :value="active.body"
                @input="
                  patch({ body: ($event.target as HTMLTextAreaElement).value })
                "
                @keydown="onKeydown"
              ></textarea>
            </div>
          </div>
          <div
            v-if="mode !== 'edit'"
            class="markdown-editor-pane markdown-editor-preview"
          >
            <!-- No Vue markdown component yet: the same markup and classes as <sone-markdown>. -->
            <div
              v-if="active.body.trim()"
              class="markdown"
              data-slot="markdown"
              data-size="sm"
              v-html="previewHtml"
            ></div>
            <p v-else class="markdown-editor-empty">Nothing to preview</p>
          </div>
        </div>
      </div>

      <div class="doc-foot">
        <span>{{ words }} words · {{ readingTime }} min read</span>
        <span role="status">{{ saveText }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped src="../styles/editor.css"></style>
