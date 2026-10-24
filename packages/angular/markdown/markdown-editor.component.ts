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
import { NG_VALUE_ACCESSOR } from "@angular/forms";
import { SoneButtonDirective } from "@surface-one/angular/button";
import { SONE_MENU_PARTS } from "@surface-one/angular/menu";
import { SoneRowMenuComponent } from "@surface-one/angular/row-menu";
import { SoneSeparatorDirective } from "@surface-one/angular/separator";
import { SoneTooltipDirective } from "@surface-one/angular/tooltip";
import {
  SoneTabsListDirective,
  SoneTabsTriggerDirective,
} from "@surface-one/angular/toggle-group";
import { SoneFloatingDockDirective } from "./floating-dock.directive";
import {
  moveToolbarFocus,
  pasteAsMarkdown,
  soneId,
  SoneValueAccessor,
} from "@surface-one/angular/core";
import { shiftIndent, type IndentDirection } from "./markdown-indent";
import type { MarkdownImageResolver } from "./markdown-image";
import { SoneMarkdownComponent } from "./markdown.component";
import {
  type EditorState,
  type MarkdownCommand,
  applyMarkdownCommand,
  continueList,
} from "./markdown-commands";
import {
  type MarkdownEditorAppearance,
  type MarkdownEditorMode,
  type MarkdownEditorToolbar,
  type MarkdownEditorToolbarPlacement,
  type MarkdownSelection,
  type MarkdownToolbarEntry,
  type MarkdownToolbarLabels,
  MarkdownToolbarCommandEvent,
  markdownModKey,
  markdownShortcutCommand,
  markdownToolbarEntries,
  writeMarkdownEdit,
} from "./markdown-editor-core";
import type { MarkdownTextSurface } from "./markdown-surface";
import type { LiveMarkdownSurface } from "./live/live-markdown";

export {
  type MarkdownEditorAppearance,
  type MarkdownEditorMode,
  type MarkdownEditorToolbar,
  type MarkdownEditorToolbarPlacement,
  type MarkdownSelection,
  MarkdownToolbarCommandEvent,
} from "./markdown-editor-core";

export interface MarkdownPreviewContext {
  readonly $implicit: string;
  readonly source: string;
}

@Directive({ selector: "ng-template[soneMarkdownPreview]" })
export class SoneMarkdownPreviewDirective {
  readonly template = inject<TemplateRef<MarkdownPreviewContext>>(TemplateRef);
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

const TOOLBAR_LABELS: MarkdownToolbarLabels = {
  headings: $localize`:Markdown formatting toolbar button:Headings`,
  heading: $localize`:Markdown formatting toolbar button:Heading`,
  heading1: $localize`:Markdown formatting toolbar button:Heading 1`,
  heading2: $localize`:Markdown formatting toolbar button:Heading 2`,
  heading3: $localize`:Markdown formatting toolbar button:Heading 3`,
  heading4: $localize`:Markdown formatting toolbar button:Heading 4`,
  heading5: $localize`:Markdown formatting toolbar button:Heading 5`,
  heading6: $localize`:Markdown formatting toolbar button:Heading 6`,
  section: $localize`:Markdown formatting toolbar button:New section`,
  bold: $localize`:Markdown formatting toolbar button:Bold`,
  italic: $localize`:Markdown formatting toolbar button:Italic`,
  strike: $localize`:Markdown formatting toolbar button:Strikethrough`,
  code: $localize`:Markdown formatting toolbar button:Inline code`,
  link: $localize`:Markdown formatting toolbar button:Link`,
  wikilink: $localize`:Markdown formatting toolbar button:Wikilink`,
  bulleted: $localize`:Markdown formatting toolbar button:Bulleted list`,
  numbered: $localize`:Markdown formatting toolbar button:Numbered list`,
  task: $localize`:Markdown formatting toolbar button:Task list`,
  quote: $localize`:Markdown formatting toolbar button:Quote`,
  codeBlock: $localize`:Markdown formatting toolbar button:Code block`,
  indent: $localize`:Markdown formatting toolbar button:Increase indent`,
  outdent: $localize`:Markdown formatting toolbar button:Decrease indent`,
};

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
    SoneFloatingDockDirective,
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
export class SoneMarkdownEditorComponent extends SoneValueAccessor<string> {
  private readonly injector = inject(Injector);
  protected readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly id = soneId("sone-md-editor");

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
  readonly imageSource = input<MarkdownImageResolver | null>(null);

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
  private readonly dock = viewChild(SoneFloatingDockDirective);

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
          onPaste: (event) => this.onPaste(event),
          onIndent: (direction) => this.indent(direction),
          onDragover: (event) => this.editorDragover.emit(event),
          onDrop: (event) => this.editorDrop.emit(event),
          onFocus: (event) => this.editorFocus.emit(event),
          onBlur: (event) => this.onBlur(event),
          onSelection: () => this.emitSelection(),
          scrollMarginBottom: () => this.dock()?.clearance ?? 0,
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
      imageSource: this.imageSource(),
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
  protected readonly entries = computed<readonly MarkdownToolbarEntry[]>(() =>
    markdownToolbarEntries(this.toolbar(), TOOLBAR_LABELS),
  );
  protected readonly previewSize = computed(() =>
    this.appearance() === "field" ? "sm" : "default",
  );
  protected readonly previewContext = computed<MarkdownPreviewContext>(() => ({
    $implicit: this.value(),
    source: this.value(),
  }));
  protected readonly modKey = markdownModKey();

  protected disabledByComponent(): boolean {
    return this.busy();
  }

  writeValue(v: unknown): void {
    this.value.set(typeof v === "string" ? v : v == null ? "" : String(v));
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
    if (mod && event.shiftKey && !event.altKey && event.code === "KeyV") {
      this.plainPasteArmed = true;
    }
    if (mod && !event.altKey && this.shortcuts()) {
      const command = markdownShortcutCommand(event);
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

  private plainPasteArmed = false;

  protected onPaste(event: ClipboardEvent): void {
    const plain = this.plainPasteArmed;
    this.plainPasteArmed = false;
    this.editorPaste.emit(event);
    const data = event.clipboardData;
    if (event.defaultPrevented || plain || !data || this.toolsDisabled()) {
      return;
    }
    const { start, end } = this.getSelection();
    const next = pasteAsMarkdown(data, this.value(), start, end);
    if (!next) {
      return;
    }
    event.preventDefault();
    this.commit(next);
  }

  private indent(direction: IndentDirection): boolean {
    if (this.toolsDisabled()) {
      return false;
    }
    const { start, end } = this.getSelection();
    this.commit(
      shiftIndent(
        { value: this.value(), selectionStart: start, selectionEnd: end },
        direction,
      ),
    );
    return true;
  }

  protected onToolbarKeydown(event: KeyboardEvent): void {
    moveToolbarFocus(event);
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
    const native = writeMarkdownEdit(el, state, (value) => this.sync(value));
    this.emitSelection();
    if (!native) {
      return;
    }
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
