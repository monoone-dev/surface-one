// The Angular-free parts of `sone-markdown-editor`, shared with its Vue and React twins:
// the toolbar layout, the keyboard shortcuts and the edit that keeps the native undo stack
// (paste conversion and the toolbar's roving focus live in core: `pasteAsMarkdown`,
// `moveToolbarFocus`). None of this imports Angular.
import {
  diffReplacement,
  type EditorState,
  type MarkdownCommand,
} from "./markdown-commands";
import type { MarkdownTextSurface } from "./markdown-surface";

export type MarkdownEditorMode = "edit" | "preview" | "split";
export type MarkdownEditorToolbar = "full" | "minimal" | "document" | "none";
export type MarkdownEditorAppearance = "field" | "bare";
export type MarkdownEditorToolbarPlacement = "top" | "dock";

export interface MarkdownSelection {
  readonly start: number;
  readonly end: number;
}

/** A toolbar button was pressed: `preventDefault()` keeps the editor from applying it. */
export class MarkdownToolbarCommandEvent {
  private prevented = false;
  constructor(readonly command: MarkdownCommand) {}
  get defaultPrevented(): boolean {
    return this.prevented;
  }
  preventDefault(): void {
    this.prevented = true;
  }
}

/** What a toolbar label names: a command, or the Headings menu. */
export type MarkdownToolbarLabelKey = MarkdownCommand | "headings";

/** The toolbar's names, one per command (and the Headings menu). */
export type MarkdownToolbarLabels = Readonly<
  Record<MarkdownToolbarLabelKey, string>
>;

export interface MarkdownToolbarItem {
  readonly command: MarkdownCommand;
  readonly label: string;
  /** The shortcut after the modifier key: shown in the tooltip, and `aria-keyshortcuts`. */
  readonly key?: { readonly display: string; readonly aria: string };
  /** The 16×16 glyph's path. */
  readonly icon: string;
  readonly group: number;
  readonly menu?: "heading";
}

export type MarkdownToolbarEntry =
  | {
      readonly kind: "button";
      readonly id: string;
      /** A separator goes before it. */
      readonly sep: boolean;
      readonly item: MarkdownToolbarItem;
    }
  | {
      readonly kind: "menu";
      readonly id: string;
      readonly sep: boolean;
      readonly label: string;
      readonly icon: string;
      readonly items: readonly MarkdownToolbarItem[];
    };

const ICON = {
  heading: "M4 3v10M12 3v10M4 8h8",
  heading1: "M2.5 4v8M8 4v8M2.5 8H8M11 6.5 13 5v7",
  heading2: "M2.5 4v8M8 4v8M2.5 8H8M14.5 12h-3c0-2.7 3-2 3-4 0-1-1.3-1.7-3-.7",
  heading3:
    "M2.5 4v8M8 4v8M2.5 8H8M11.5 5.6c1.1-.7 2.8-.2 2.8 1.1 0 .8-.6 1.4-1.4 1.4M11.3 11.4c1.3 1 3 .3 3-1 0-.8-.6-1.4-1.4-1.4",
  heading4: "M2.5 4v8M8 4v8M2.5 8H8M13.5 12V4.5l-3.2 4.8h4.2",
  heading5:
    "M2.5 4v8M8 4v8M2.5 8H8M14.2 4.5h-2.7l-.4 3.1c.4-.3.9-.4 1.4-.4 1 0 1.7.7 1.7 1.8 0 1.1-.8 1.9-1.8 1.9-.7 0-1.2-.3-1.5-.7",
  heading6:
    "M2.5 4v8M8 4v8M2.5 8H8M14.2 5c-.3-.4-.8-.6-1.3-.6-1.2 0-1.9 1.3-1.9 3.6 0 2.4.6 3.6 1.8 3.6 1 0 1.7-.8 1.7-1.8s-.7-1.7-1.6-1.7c-.9 0-1.6.6-1.8 1.5",
  section: "M2 3.5h6M2 7h4M2 10.5h4M2 14h6M12 6v6M9 9h6",
  indent: "M2 3h12M7.5 6.5H14M7.5 9.5H14M2 13h12M2 6l2.5 2L2 10",
  outdent: "M2 3h12M7.5 6.5H14M7.5 9.5H14M2 13h12M4.5 6 2 8l2.5 2",
  bold: "M5 3h4a2.5 2.5 0 0 1 0 5H5zM5 8h4.8a2.5 2.5 0 0 1 0 5H5z",
  italic: "M7 3h5M4 13h5M10 3 6 13",
  strike:
    "M3 8h10M10.5 4.5C10 3.6 9 3 8 3 6.3 3 5 4 5 5.3c0 .9.5 1.6 1.4 2M5.5 11.5c.5.9 1.5 1.5 2.7 1.5 1.7 0 3-1 3-2.3",
  code: "M6 4 2 8l4 4M10 4l4 4-4 4",
  wikilink: "M4.5 3H2.5v10h2M6.5 5H5v6h1.5M11.5 3h2v10h-2M9.5 5H11v6H9.5",
  link: "M7 9a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.6.6M9 7a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.6-.6",
  bulleted: "M6 4h8M6 8h8M6 12h8M2.5 4h.01M2.5 8h.01M2.5 12h.01",
  numbered:
    "M7 4h7M7 8h7M7 12h7M2 3h1v3M2 6h2M2 9.5c.3-.4.7-.5 1-.5.6 0 1 .4 1 .9 0 .8-2 1.6-2 2.6h2",
  task: "M2 3.5h3v3H2zM2 9.5h3v3H2zM7 5h7M7 11h7M2.7 5l.8.8L5 4.3",
  quote: "M3 4v8M6.5 5h7M6.5 8h7M6.5 11h5",
  codeBlock: "M2.5 2.5h11v11h-11zM6 6 4.5 8 6 10M10 6l1.5 2-1.5 2",
} as const;

/** The Headings menu's glyph. */
const HEADINGS_ICON = "M2.5 3.5v9M8 3.5v9M2.5 8H8M10.5 7l2 2 2-2";

const TASK_KEY = { display: "⇧9", aria: "Shift+9" } as const;
const KEYS: Partial<
  Record<MarkdownCommand, { readonly display: string; readonly aria: string }>
> = {
  bold: { display: "B", aria: "B" },
  italic: { display: "I", aria: "I" },
  strike: { display: "⇧X", aria: "Shift+X" },
  link: { display: "K", aria: "K" },
  task: TASK_KEY,
};

type Spec = readonly [
  command: keyof typeof ICON,
  group: number,
  options?: { readonly key?: boolean; readonly menu?: "heading" },
];

const FULL: readonly Spec[] = [
  ["heading", 0],
  ["bold", 1, { key: true }],
  ["italic", 1, { key: true }],
  ["strike", 1, { key: true }],
  ["code", 1],
  ["link", 2, { key: true }],
  ["bulleted", 3],
  ["numbered", 3],
  ["task", 3, { key: true }],
  ["quote", 4],
  ["codeBlock", 4],
];
const DOCUMENT: readonly Spec[] = [
  ["heading1", 0, { menu: "heading" }],
  ["heading2", 0, { menu: "heading" }],
  ["heading3", 0, { menu: "heading" }],
  ["heading4", 0, { menu: "heading" }],
  ["heading5", 0, { menu: "heading" }],
  ["heading6", 0, { menu: "heading" }],
  ["section", 0],
  ["bold", 1, { key: true }],
  ["italic", 1, { key: true }],
  ["strike", 1, { key: true }],
  ["code", 1],
  ["bulleted", 2],
  ["numbered", 2],
  ["task", 2, { key: true }],
  ["quote", 2],
  ["outdent", 3],
  ["indent", 3],
  ["link", 4],
  ["wikilink", 4],
];
const MINIMAL: ReadonlySet<MarkdownCommand> = new Set([
  "bold",
  "italic",
  "link",
  "bulleted",
  "task",
]);

/** The English toolbar labels (the Vue and React messages catalogue starts from these). */
export const MARKDOWN_TOOLBAR_LABELS_EN: MarkdownToolbarLabels = {
  headings: "Headings",
  heading: "Heading",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  heading4: "Heading 4",
  heading5: "Heading 5",
  heading6: "Heading 6",
  section: "New section",
  bold: "Bold",
  italic: "Italic",
  strike: "Strikethrough",
  code: "Inline code",
  link: "Link",
  wikilink: "Wikilink",
  bulleted: "Bulleted list",
  numbered: "Numbered list",
  task: "Task list",
  quote: "Quote",
  codeBlock: "Code block",
  indent: "Increase indent",
  outdent: "Decrease indent",
};

/** Every toolbar label, from a lookup by key (a translated messages catalogue). */
export function markdownToolbarLabels(
  label: (key: MarkdownToolbarLabelKey) => string,
): MarkdownToolbarLabels {
  const keys = Object.keys(
    MARKDOWN_TOOLBAR_LABELS_EN,
  ) as MarkdownToolbarLabelKey[];
  return Object.fromEntries(
    keys.map((key) => [key, label(key)]),
  ) as unknown as MarkdownToolbarLabels;
}

/**
 * The toolbar of a `toolbar` kind, as buttons and menus (the document toolbar folds its
 * six headings into one Headings menu), each marked when a separator goes before it.
 */
export function markdownToolbarEntries(
  kind: MarkdownEditorToolbar,
  labels: MarkdownToolbarLabels,
): MarkdownToolbarEntry[] {
  const specs =
    kind === "none"
      ? []
      : kind === "minimal"
        ? FULL.filter(([command]) => MINIMAL.has(command))
        : kind === "document"
          ? DOCUMENT
          : FULL;
  const list: MarkdownToolbarItem[] = specs.map(
    ([command, group, options]) => ({
      command,
      label: labels[command],
      ...(options?.key ? { key: KEYS[command] } : {}),
      icon: ICON[command],
      group,
      ...(options?.menu ? { menu: options.menu } : {}),
    }),
  );
  const entries: MarkdownToolbarEntry[] = [];
  list.forEach((item, i) => {
    const sep = i > 0 && list[i - 1].group !== item.group;
    const last = entries.at(-1);
    if (!item.menu) {
      entries.push({ kind: "button", id: item.command, sep, item });
    } else if (last?.kind === "menu" && last.id === `menu:${item.menu}`) {
      entries[entries.length - 1] = {
        ...last,
        items: [...last.items, item],
      };
    } else {
      entries.push({
        kind: "menu",
        id: `menu:${item.menu}`,
        sep,
        label: labels.headings,
        icon: HEADINGS_ICON,
        items: [item],
      });
    }
  });
  return entries;
}

/** `⌘` on Apple platforms, `Ctrl+` elsewhere (and on the server). */
export function markdownModKey(): "⌘" | "Ctrl+" {
  return typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl+";
}

/** A toolbar button's `aria-keyshortcuts` and tooltip. */
export function markdownToolbarHint(
  item: MarkdownToolbarItem,
  modKey: string,
): { readonly keyshortcuts: string | null; readonly tooltip: string } {
  return item.key
    ? {
        keyshortcuts: (modKey === "⌘" ? "Meta+" : "Control+") + item.key.aria,
        tooltip: `${item.label} (${modKey}${item.key.display})`,
      }
    : { keyshortcuts: null, tooltip: item.label };
}

/**
 * The formatting command a key press asks for: ⌘/Ctrl + B, I, K, Shift+X, Shift+9 —
 * `null` for any other key.
 */
export function markdownShortcutCommand(
  event: Pick<KeyboardEvent, "key" | "code" | "shiftKey">,
): MarkdownCommand | null {
  const key = event.key.toLowerCase();
  // With Shift held, `key` is the layout's shifted glyph, not "9" — read `code` instead.
  return event.shiftKey
    ? key === "x"
      ? "strike"
      : event.code === "Digit9"
        ? "task"
        : null
    : key === "b"
      ? "bold"
      : key === "i"
        ? "italic"
        : key === "k"
          ? "link"
          : null;
}

/**
 * Writes `state` into the editing surface and selects its range. A `<textarea>` takes the
 * change through `execCommand("insertText")`, which keeps it on the native undo stack
 * (a plain value write and an `input` event where the engine refuses); the live editor
 * takes the value and raises `input`. `sync` receives the textarea's new value. `true`
 * for a textarea, whose caller restores the selection after its next render.
 */
export function writeMarkdownEdit(
  el: MarkdownTextSurface,
  state: EditorState,
  sync: (value: string) => void,
): boolean {
  const before = el.value;
  if (
    typeof HTMLTextAreaElement === "undefined" ||
    !(el instanceof HTMLTextAreaElement)
  ) {
    if (state.value !== before) {
      el.value = state.value;
      (el as MarkdownTextSurface & EventTarget).dispatchEvent(
        new Event("input"),
      );
    }
    el.focus();
    el.setSelectionRange(state.selectionStart, state.selectionEnd);
    return false;
  }
  if (state.value !== before) {
    const { start, end, text } = diffReplacement(before, state.value);
    el.focus();
    el.setSelectionRange(start, end);
    let inserted: boolean;
    try {
      // Deprecated, but the only way to keep the edit on the native undo stack.
      inserted = el.ownerDocument.execCommand("insertText", false, text);
    } catch {
      inserted = false;
    }
    if (!inserted || el.value !== state.value) {
      el.value = state.value;
      // No native edit happened, so no `input` event fired either — raise one manually.
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }
    sync(el.value);
  } else {
    el.focus();
  }
  el.setSelectionRange(state.selectionStart, state.selectionEnd);
  return true;
}
