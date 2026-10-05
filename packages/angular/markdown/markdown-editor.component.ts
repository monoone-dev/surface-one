import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  Injector,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from "@angular/forms";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import { SoneSeparatorDirective } from "@surface-one/angular/separator";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";
import {
  SoneTabsListDirective,
  SoneTabsTriggerDirective,
} from "@surface-one/angular/toggle-group";
import { SoneMarkdownComponent } from "./markdown.component";
import {
  type EditorState,
  type MarkdownCommand,
  applyMarkdownCommand,
  continueList,
  diffReplacement,
} from "./markdown-commands";
import type { MarkdownTextSurface } from "./markdown-surface";
import type { LiveMarkdownSurface } from "./live/live-markdown";

export type MarkdownEditorMode = "edit" | "preview" | "split";
export type MarkdownEditorToolbar = "full" | "minimal" | "document" | "none";
export type MarkdownEditorAppearance = "field" | "bare";
export type MarkdownEditorToolbarPlacement = "top" | "dock";

export interface MarkdownSelection {
  readonly start: number;
  readonly end: number;
}

export interface MarkdownPreviewContext {
  readonly $implicit: string;
  readonly source: string;
}

@Directive({ selector: "ng-template[soneMarkdownPreview]" })
export class SoneMarkdownPreviewDirective {
  readonly template = inject<TemplateRef<MarkdownPreviewContext>>(TemplateRef);
}

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

@Directive({
  selector: "[soneMarkdownEditorTools]",
  host: { class: "markdown-editor-tools" },
})
export class SoneMarkdownEditorToolsDirective {}

@Directive({
  selector: "[soneMarkdownEditorFooter]",
  host: { class: "markdown-editor-footer" },
})
export class SoneMarkdownEditorFooterDirective {}

interface ToolbarItem {
  readonly command: MarkdownCommand;
  readonly label: string;
  readonly key?: { readonly display: string; readonly aria: string };
  readonly icon: string;
  readonly group: number;
  readonly menu?: ToolbarMenuId;
}

type ToolbarMenuId = "heading";

const TOOLBAR_MENUS: Record<
  ToolbarMenuId,
  { readonly label: string; readonly icon: string }
> = {
  heading: {
    label: $localize`:Markdown formatting toolbar button:Headings`,
    icon: "M2.5 3.5v9M8 3.5v9M2.5 8H8M10.5 7l2 2 2-2",
  },
};

type ToolbarEntry =
  | {
      readonly kind: "button";
      readonly id: string;
      readonly sep: boolean;
      readonly item: ToolbarItem;
    }
  | {
      readonly kind: "menu";
      readonly id: string;
      readonly sep: boolean;
      readonly label: string;
      readonly icon: string;
      readonly items: readonly ToolbarItem[];
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

const TASK_KEY = { display: "⇧9", aria: "Shift+9" } as const;

const FULL: readonly ToolbarItem[] = [
  {
    command: "heading",
    label: $localize`:Markdown formatting toolbar button:Heading`,
    icon: ICON.heading,
    group: 0,
  },
  {
    command: "bold",
    label: $localize`:Markdown formatting toolbar button:Bold`,
    key: { display: "B", aria: "B" },
    icon: ICON.bold,
    group: 1,
  },
  {
    command: "italic",
    label: $localize`:Markdown formatting toolbar button:Italic`,
    key: { display: "I", aria: "I" },
    icon: ICON.italic,
    group: 1,
  },
  {
    command: "strike",
    label: $localize`:Markdown formatting toolbar button:Strikethrough`,
    key: { display: "⇧X", aria: "Shift+X" },
    icon: ICON.strike,
    group: 1,
  },
  {
    command: "code",
    label: $localize`:Markdown formatting toolbar button:Inline code`,
    icon: ICON.code,
    group: 1,
  },
  {
    command: "link",
    label: $localize`:Markdown formatting toolbar button:Link`,
    key: { display: "K", aria: "K" },
    icon: ICON.link,
    group: 2,
  },
  {
    command: "bulleted",
    label: $localize`:Markdown formatting toolbar button:Bulleted list`,
    icon: ICON.bulleted,
    group: 3,
  },
  {
    command: "numbered",
    label: $localize`:Markdown formatting toolbar button:Numbered list`,
    icon: ICON.numbered,
    group: 3,
  },
  {
    command: "task",
    label: $localize`:Markdown formatting toolbar button:Task list`,
    key: TASK_KEY,
    icon: ICON.task,
    group: 3,
  },
  {
    command: "quote",
    label: $localize`:Markdown formatting toolbar button:Quote`,
    icon: ICON.quote,
    group: 4,
  },
  {
    command: "codeBlock",
    label: $localize`:Markdown formatting toolbar button:Code block`,
    icon: ICON.codeBlock,
    group: 4,
  },
];
const DOCUMENT: readonly ToolbarItem[] = [
  {
    command: "heading1",
    label: $localize`:Markdown formatting toolbar button:Heading 1`,
    icon: ICON.heading1,
    group: 0,
    menu: "heading",
  },
  {
    command: "heading2",
    label: $localize`:Markdown formatting toolbar button:Heading 2`,
    icon: ICON.heading2,
    group: 0,
    menu: "heading",
  },
  {
    command: "heading3",
    label: $localize`:Markdown formatting toolbar button:Heading 3`,
    icon: ICON.heading3,
    group: 0,
    menu: "heading",
  },
  {
    command: "heading4",
    label: $localize`:Markdown formatting toolbar button:Heading 4`,
    icon: ICON.heading4,
    group: 0,
    menu: "heading",
  },
  {
    command: "heading5",
    label: $localize`:Markdown formatting toolbar button:Heading 5`,
    icon: ICON.heading5,
    group: 0,
    menu: "heading",
  },
  {
    command: "heading6",
    label: $localize`:Markdown formatting toolbar button:Heading 6`,
    icon: ICON.heading6,
    group: 0,
    menu: "heading",
  },
  {
    command: "section",
    label: $localize`:Markdown formatting toolbar button:New section`,
    icon: ICON.section,
    group: 0,
  },
  {
    command: "bold",
    label: $localize`:Markdown formatting toolbar button:Bold`,
    key: { display: "B", aria: "B" },
    icon: ICON.bold,
    group: 1,
  },
  {
    command: "italic",
    label: $localize`:Markdown formatting toolbar button:Italic`,
    key: { display: "I", aria: "I" },
    icon: ICON.italic,
    group: 1,
  },
  {
    command: "strike",
    label: $localize`:Markdown formatting toolbar button:Strikethrough`,
    key: { display: "⇧X", aria: "Shift+X" },
    icon: ICON.strike,
    group: 1,
  },
  {
    command: "code",
    label: $localize`:Markdown formatting toolbar button:Inline code`,
    icon: ICON.code,
    group: 1,
  },
  {
    command: "bulleted",
    label: $localize`:Markdown formatting toolbar button:Bulleted list`,
    icon: ICON.bulleted,
    group: 2,
  },
  {
    command: "numbered",
    label: $localize`:Markdown formatting toolbar button:Numbered list`,
    icon: ICON.numbered,
    group: 2,
  },
  {
    command: "task",
    label: $localize`:Markdown formatting toolbar button:Task list`,
    key: TASK_KEY,
    icon: ICON.task,
    group: 2,
  },
  {
    command: "quote",
    label: $localize`:Markdown formatting toolbar button:Quote`,
    icon: ICON.quote,
    group: 2,
  },
  {
    command: "outdent",
    label: $localize`:Markdown formatting toolbar button:Decrease indent`,
    icon: ICON.outdent,
    group: 3,
  },
  {
    command: "indent",
    label: $localize`:Markdown formatting toolbar button:Increase indent`,
    icon: ICON.indent,
    group: 3,
  },
  {
    command: "link",
    label: $localize`:Markdown formatting toolbar button:Link`,
    icon: ICON.link,
    group: 4,
  },
  {
    command: "wikilink",
    label: $localize`:Markdown formatting toolbar button:Wikilink`,
    icon: ICON.wikilink,
    group: 4,
  },
];
const MINIMAL: ReadonlySet<MarkdownCommand> = new Set([
  "bold",
  "italic",
  "link",
  "bulleted",
  "task",
]);

let nextId = 0;

type LiveMarkdownModule = typeof import("./live/live-markdown");

// Kept after the first load so a remounted editor is created synchronously, in the same render
// the caller focuses it in; an async remount would drop a caret placed by `afterNextRender`.
let liveModule: LiveMarkdownModule | null = null;
let liveModuleLoading: Promise<LiveMarkdownModule> | null = null;

export function preloadLiveMarkdown(): void {
  void loadLiveMarkdown();
}

function loadLiveMarkdown(): Promise<LiveMarkdownModule> {
  liveModuleLoading ??= import("./live/live-markdown").then((module) => {
    liveModule = module;
    return module;
  });
  return liveModuleLoading;
}

@Component({
  selector: "sone-markdown-editor",
  exportAs: "soneMarkdownEditor",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgTemplateOutlet,
    SoneButtonDirective,
    ...SONE_MENU_PARTS,
    SoneRowMenuComponent,
    SoneSeparatorDirective,
    SoneTooltipDirective,
    SoneTabsListDirective,
    SoneTabsTriggerDirective,
    SoneMarkdownComponent,
  ],
  templateUrl: "./markdown-editor.component.html",
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SoneMarkdownEditorComponent),
      multi: true,
    },
  ],
  host: {
    class: "markdown-editor",
    "data-slot": "markdown-editor",
    "[attr.data-mode]": "mode()",
    "[attr.data-appearance]": "appearance()",
    "[attr.data-disabled]": "isDisabled() ? '' : null",
    "[attr.data-invalid]": "invalid() ? '' : null",
    "[attr.data-sticky-toolbar]": "stickyToolbar() ? '' : null",
    "[attr.data-toolbar-placement]": "toolbarPlacement()",
    "[attr.data-focus-frame]": "focusFrame() ? null : 'off'",
    "[style.--markdown-editor-rows]": "minRows()",
  },
})
export class SoneMarkdownEditorComponent implements ControlValueAccessor {
  private readonly injector = inject(Injector);
  protected readonly id = `sone-md-editor-${nextId++}`;

  readonly value = model<string>("");
  readonly mode = model<MarkdownEditorMode>("edit");

  readonly appearance = input<MarkdownEditorAppearance>("field");
  readonly toolbar = input<MarkdownEditorToolbar>("full");
  readonly stickyToolbar = input(false, { transform: booleanAttribute });
  readonly toolbarPlacement = input<MarkdownEditorToolbarPlacement>("top");
  readonly focusFrame = input(true, { transform: booleanAttribute });
  readonly tabs = input(true, { transform: booleanAttribute });
  readonly minRows = input(4, { transform: numberAttribute });

  readonly ariaLabel = input<string | null>(null);
  readonly ariaLabelledby = input<string | null>(null);
  readonly ariaDescribedby = input<string | null>(null);
  readonly maxlength = input<number | null>(null);
  readonly placeholder = input("");
  readonly spellcheck = input(true, { transform: booleanAttribute });
  readonly autocapitalize = input<string>("sentences");
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly busy = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly textareaClass = input("");
  readonly live = input(false, { transform: booleanAttribute });

  readonly shortcuts = input(true, { transform: booleanAttribute });
  readonly continueLists = input(true, { transform: booleanAttribute });

  readonly editorInput = output<Event>();
  readonly editorKeydown = output<KeyboardEvent>();
  readonly editorPaste = output<ClipboardEvent>();
  readonly editorDragover = output<DragEvent>();
  readonly editorDrop = output<DragEvent>();
  readonly editorFocus = output<FocusEvent>();
  readonly editorBlur = output<FocusEvent>();
  readonly selectionChange = output<MarkdownSelection>();
  readonly toolbarCommand = output<MarkdownToolbarCommandEvent>();

  private readonly nativeArea =
    viewChild<ElementRef<HTMLTextAreaElement>>("area");
  private readonly liveHost = viewChild<ElementRef<HTMLElement>>("liveHost");
  private readonly liveSurface = signal<LiveMarkdownSurface | null>(null);

  readonly textarea = computed<ElementRef<MarkdownTextSurface> | undefined>(
    () => {
      const surface = this.liveSurface();
      return surface
        ? new ElementRef<MarkdownTextSurface>(surface)
        : this.nativeArea();
    },
  );

  private readonly _preloadLive = effect(() => {
    if (this.live()) {
      void loadLiveMarkdown();
    }
  });

  private readonly _mountLive = effect((onCleanup) => {
    const host = this.liveHost()?.nativeElement;
    if (!host) {
      return;
    }
    let surface: LiveMarkdownSurface | null = null;
    let cancelled = false;
    const mount = (module: LiveMarkdownModule) => {
      if (cancelled) {
        return;
      }
      surface = untracked(() =>
        module.createLiveMarkdown(host, {
          doc: this.value(),
          ...this.liveConfig(),
          contentClass: `markdown-editor-area ${this.textareaClass()}`,
          onKeydown: (event) => this.onKeydown(event),
          onPaste: (event) => this.editorPaste.emit(event),
          onDragover: (event) => this.editorDragover.emit(event),
          onDrop: (event) => this.editorDrop.emit(event),
          onFocus: (event) => this.editorFocus.emit(event),
          onBlur: (event) => this.onBlur(event),
          onSelection: () => this.emitSelection(),
        }),
      );
      surface.addEventListener("input", (event) => this.onInput(event));
      this.liveSurface.set(surface);
    };
    if (liveModule) {
      mount(liveModule);
    } else {
      void loadLiveMarkdown().then(mount);
    }
    onCleanup(() => {
      cancelled = true;
      surface?.destroy();
      this.liveSurface.set(null);
    });
  });

  private readonly liveConfig = computed(() => {
    const attributes: Record<string, string> = {
      id: `${this.id}-area`,
      spellcheck: String(this.spellcheck()),
      autocapitalize: this.autocapitalize(),
      "aria-multiline": "true",
    };
    const label = this.ariaLabel();
    const labelledby = this.ariaLabelledby();
    const describedby = this.ariaDescribedby();
    if (label) attributes["aria-label"] = label;
    if (labelledby) attributes["aria-labelledby"] = labelledby;
    if (describedby) attributes["aria-describedby"] = describedby;
    if (this.invalid()) attributes["aria-invalid"] = "true";
    if (this.isDisabled()) attributes["aria-disabled"] = "true";
    else if (this.readonly()) attributes["aria-readonly"] = "true";
    return {
      placeholder: this.placeholder(),
      readOnly: this.readonly() || this.isDisabled(),
      attributes,
    };
  });

  private readonly _syncLive = effect(() => {
    const surface = this.liveSurface();
    const value = this.value();
    if (surface && surface.value !== value) {
      surface.replaceFromOutside(value);
    }
  });

  private readonly _configureLive = effect(() => {
    const config = this.liveConfig();
    untracked(() => this.liveSurface())?.configure(config);
  });

  protected readonly customPreview = contentChild(SoneMarkdownPreviewDirective);
  protected readonly hostTools = contentChild(SoneMarkdownEditorToolsDirective);

  private readonly cvaDisabled = signal(false);
  readonly isDisabled = computed(() => this.cvaDisabled() || this.busy());
  protected readonly toolsDisabled = computed(
    () => this.isDisabled() || this.readonly() || this.mode() === "preview",
  );
  protected readonly showEdit = computed(() => this.mode() !== "preview");
  protected readonly showPreview = computed(() => this.mode() !== "edit");
  protected readonly showTabs = computed(
    () => this.tabs() && this.mode() !== "split",
  );
  protected readonly showHeader = computed(
    () => this.showTabs() || this.toolbar() !== "none" || !!this.hostTools(),
  );
  protected readonly entries = computed<readonly ToolbarEntry[]>(() => {
    const kind = this.toolbar();
    const list =
      kind === "none"
        ? []
        : kind === "minimal"
          ? FULL.filter((i) => MINIMAL.has(i.command))
          : kind === "document"
            ? DOCUMENT
            : FULL;
    const entries: ToolbarEntry[] = [];
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
          ...TOOLBAR_MENUS[item.menu],
          items: [item],
        });
      }
    });
    return entries;
  });
  protected readonly previewSize = computed(() =>
    this.appearance() === "field" ? "sm" : "default",
  );
  protected readonly previewContext = computed<MarkdownPreviewContext>(() => ({
    $implicit: this.value(),
    source: this.value(),
  }));
  protected readonly modKey =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.userAgent)
      ? "⌘"
      : "Ctrl+";

  private onChange: (v: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(v: unknown): void {
    this.value.set(typeof v === "string" ? v : v == null ? "" : String(v));
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  focus(options?: FocusOptions): void {
    this.textarea()?.nativeElement.focus(options);
  }

  getSelection(): MarkdownSelection {
    const el = this.textarea()?.nativeElement;
    const end = this.value().length;
    return el
      ? { start: el.selectionStart, end: el.selectionEnd }
      : { start: end, end };
  }

  setSelection(start: number, end: number = start): void {
    const el = this.textarea()?.nativeElement;
    if (el) {
      el.setSelectionRange(start, end);
      this.emitSelection();
    }
  }

  insertText(text: string): void {
    const { start, end } = this.getSelection();
    this.replaceRange(start, end, text);
  }

  replaceSelection(text: string): void {
    const { start, end } = this.getSelection();
    this.replaceRange(start, end, text, start, start + text.length);
  }

  wrapSelection(before: string, after: string = before): void {
    const { start, end } = this.getSelection();
    const v = this.value();
    const next =
      v.slice(0, start) + before + v.slice(start, end) + after + v.slice(end);
    this.commit({
      value: next,
      selectionStart: start + before.length,
      selectionEnd: end + before.length,
    });
  }

  replaceRange(
    from: number,
    to: number,
    text: string,
    selectionStart = from + text.length,
    selectionEnd = selectionStart,
  ): void {
    const v = this.value();
    this.commit({
      value: v.slice(0, from) + text + v.slice(to),
      selectionStart,
      selectionEnd,
    });
  }

  applyCommand(command: MarkdownCommand): void {
    if (this.toolsDisabled()) {
      return;
    }
    const { start, end } = this.getSelection();
    this.commit(
      applyMarkdownCommand(
        { value: this.value(), selectionStart: start, selectionEnd: end },
        command,
      ),
    );
  }

  protected onToolbarCommand(command: MarkdownCommand): void {
    if (this.toolsDisabled()) {
      return;
    }
    const event = new MarkdownToolbarCommandEvent(command);
    this.toolbarCommand.emit(event);
    if (!event.defaultPrevented) {
      this.applyCommand(command);
    }
  }

  protected setMode(mode: MarkdownEditorMode): void {
    this.mode.set(mode);
    if (mode !== "preview") {
      afterNextRender(() => this.focus(), { injector: this.injector });
    }
  }

  protected onInput(event: Event): void {
    this.sync((event.target as unknown as MarkdownTextSurface).value);
    this.editorInput.emit(event);
    this.emitSelection();
  }

  protected onKeydown(event: KeyboardEvent): void {
    this.editorKeydown.emit(event);
    if (event.defaultPrevented || event.isComposing || this.readonly()) {
      return;
    }
    const mod = event.metaKey || event.ctrlKey;
    if (mod && !event.altKey && this.shortcuts()) {
      const key = event.key.toLowerCase();
      // With Shift held, `key` is the layout's shifted glyph, not "9" — read `code` instead.
      const command: MarkdownCommand | null = event.shiftKey
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
      if (command) {
        // Stop the app's document-level shortcuts (⌘K = Search) from also firing.
        event.preventDefault();
        event.stopPropagation();
        this.applyCommand(command);
      }
      return;
    }
    if (
      event.key === "Enter" &&
      !mod &&
      !event.shiftKey &&
      !event.altKey &&
      this.continueLists()
    ) {
      const { start, end } = this.getSelection();
      const next = continueList({
        value: this.value(),
        selectionStart: start,
        selectionEnd: end,
      });
      if (next) {
        event.preventDefault();
        this.commit(next);
      }
    }
  }

  protected onToolbarKeydown(event: KeyboardEvent): void {
    const { key } = event;
    if (
      key !== "ArrowLeft" &&
      key !== "ArrowRight" &&
      key !== "Home" &&
      key !== "End"
    ) {
      return;
    }
    const bar = (event.currentTarget as HTMLElement).closest(
      '[role="toolbar"]',
    );
    if (!bar) {
      return;
    }
    const buttons = Array.from(
      bar.querySelectorAll<HTMLButtonElement>("button"),
    ).filter((b) => !b.disabled);
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0 || buttons.length < 2) {
      return;
    }
    const to =
      key === "Home"
        ? 0
        : key === "End"
          ? buttons.length - 1
          : (at + (key === "ArrowRight" ? 1 : -1) + buttons.length) %
            buttons.length;
    event.preventDefault();
    buttons[to].focus();
  }

  protected onBlur(event: FocusEvent): void {
    this.onTouched();
    this.editorBlur.emit(event);
  }

  protected emitSelection(): void {
    const el = this.textarea()?.nativeElement;
    if (el) {
      this.selectionChange.emit({
        start: el.selectionStart,
        end: el.selectionEnd,
      });
    }
  }

  private sync(next: string): void {
    if (next !== this.value()) {
      this.value.set(next);
      this.onChange(next);
    }
  }

  // Deprecated `execCommand("insertText")` keeps the edit on the native undo stack when the
  // engine supports it; guarded, with a plain value write as the fallback.
  private commit(state: EditorState): void {
    const el = this.textarea()?.nativeElement;
    if (!el) {
      this.sync(state.value);
      return;
    }
    const before = el.value;
    if (!(el instanceof HTMLTextAreaElement)) {
      if (state.value !== before) {
        el.value = state.value;
        (el as MarkdownTextSurface & EventTarget).dispatchEvent(
          new Event("input"),
        );
      }
      el.focus();
      el.setSelectionRange(state.selectionStart, state.selectionEnd);
      this.emitSelection();
      return;
    }
    if (state.value !== before) {
      const { start, end, text } = diffReplacement(before, state.value);
      el.focus();
      el.setSelectionRange(start, end);
      let inserted: boolean;
      try {
        inserted = document.execCommand("insertText", false, text);
      } catch {
        inserted = false;
      }
      if (!inserted || el.value !== state.value) {
        el.value = state.value;
        // No native edit happened, so no `input` event fired either — raise one manually.
        el.dispatchEvent(new Event("input", { bubbles: true }));
      }
      this.sync(el.value);
    } else {
      el.focus();
    }
    el.setSelectionRange(state.selectionStart, state.selectionEnd);
    this.emitSelection();
    // Restore the selection after the `[value]` binding re-applies next render, in case the engine moved the caret on write.
    afterNextRender(
      () => {
        const area = this.textarea()?.nativeElement;
        if (area && area.value === state.value) {
          area.setSelectionRange(state.selectionStart, state.selectionEnd);
        }
      },
      { injector: this.injector },
    );
  }
}

export const SONE_MARKDOWN_EDITOR_PARTS = [
  SoneMarkdownEditorComponent,
  SoneMarkdownPreviewDirective,
  SoneMarkdownEditorToolsDirective,
  SoneMarkdownEditorFooterDirective,
] as const;
