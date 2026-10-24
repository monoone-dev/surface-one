"use client";

import {
  createElement,
  useEffect,
  useId,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ClipboardEvent as ReactClipboardEvent,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
} from "react";

import {
  MarkdownToolbarCommandEvent,
  applyMarkdownCommand,
  continueList,
  markdownModKey,
  markdownShortcutCommand,
  markdownToolbarEntries,
  markdownToolbarHint,
  markdownToolbarLabels,
  moveToolbarFocus,
  pasteAsMarkdown,
  shiftIndent,
  trackFloatingDock,
  writeMarkdownEdit,
  type EditorState,
  type FloatingDockTracker,
  type MarkdownCommand,
  type MarkdownEditorAppearance,
  type MarkdownEditorMode,
  type MarkdownEditorToolbar,
  type MarkdownEditorToolbarPlacement,
  type MarkdownImageResolver,
  type MarkdownSelection,
  type MarkdownTextSurface,
  type MarkdownToolbarItem,
} from "@surface-one/core";
import { useControllable } from "@surface-one/core/react/controllable";

import { useSoneMessages } from "../../context/messages";
import { useSoneTooltip } from "../../tooltip/tooltip";
import { cx, definePart } from "../../utils/part";
import { mergeRefs } from "../../utils/refs";
import { SoneButton } from "../button/button";
import { SoneMenuItem } from "../menu/menu";
import { SoneRowMenu } from "../row-menu/row-menu";
import { SoneSeparator } from "../separator/separator";
import { SoneTabsList, SoneTabsTrigger } from "../toggle-group/toggle-group";
import { SoneMarkdown } from "./markdown";

export {
  MarkdownToolbarCommandEvent,
  type MarkdownCommand,
  type MarkdownEditorAppearance,
  type MarkdownEditorMode,
  type MarkdownEditorToolbar,
  type MarkdownEditorToolbarPlacement,
  type MarkdownImage,
  type MarkdownImageResolver,
  type MarkdownSelection,
  type MarkdownTextSurface,
} from "@surface-one/core";

type LiveModule = typeof import("@surface-one/core/live-markdown");
type LiveSurface = InstanceType<LiveModule["LiveMarkdownSurface"]>;

// Kept after the first load so a remounted editor is created synchronously.
let liveModule: LiveModule | null = null;
let liveModuleLoading: Promise<LiveModule> | null = null;

function loadLiveMarkdown(): Promise<LiveModule> {
  liveModuleLoading ??= import("@surface-one/core/live-markdown").then(
    (module) => {
      liveModule = module;
      return module;
    },
  );
  return liveModuleLoading;
}

/** Starts loading the live editor (CodeMirror) ahead of a `live` editor's first mount. */
export function preloadLiveMarkdown(): void {
  void loadLiveMarkdown();
}

/** What a markdown editor's `handleRef` exposes. */
export interface SoneMarkdownEditorHandle {
  /** The editing surface: the `<textarea>`, or the live editor's. */
  readonly textarea: MarkdownTextSurface | null;
  focus(options?: FocusOptions): void;
  getSelection(): MarkdownSelection;
  setSelection(start: number, end?: number): void;
  insertText(text: string): void;
  replaceSelection(text: string): void;
  wrapSelection(before: string, after?: string): void;
  replaceRange(
    from: number,
    to: number,
    text: string,
    selectionStart?: number,
    selectionEnd?: number,
  ): void;
  applyCommand(command: MarkdownCommand): void;
}

/** `[soneMarkdownEditorTools]` — your controls at the end of the header (`tools`). */
export const SoneMarkdownEditorTools = definePart({
  name: "SoneMarkdownEditorTools",
  tag: "div",
  className: "markdown-editor-tools",
  slot: "markdown-editor-tools",
});

/** `[soneMarkdownEditorFooter]` — a row under the text (`footer`). */
export const SoneMarkdownEditorFooter = definePart({
  name: "SoneMarkdownEditorFooter",
  tag: "div",
  className: "markdown-editor-footer",
  slot: "markdown-editor-footer",
});

export interface SoneMarkdownEditorProps extends Omit<
  HTMLAttributes<HTMLElement>,
  "children" | "defaultValue" | "onChange"
> {
  /** The markdown (controlled), with `onValueChange`; or `defaultValue`. */
  readonly value?: string;
  readonly defaultValue?: string;
  readonly onValueChange?: (value: string) => void;
  /** The view (controlled), with `onModeChange`; or `defaultMode`. */
  readonly mode?: MarkdownEditorMode;
  readonly defaultMode?: MarkdownEditorMode;
  readonly onModeChange?: (mode: MarkdownEditorMode) => void;
  readonly appearance?: MarkdownEditorAppearance;
  readonly toolbar?: MarkdownEditorToolbar;
  readonly stickyToolbar?: boolean;
  readonly toolbarPlacement?: MarkdownEditorToolbarPlacement;
  readonly focusFrame?: boolean;
  readonly tabs?: boolean;
  readonly minRows?: number;
  readonly ariaLabel?: string | null;
  readonly ariaLabelledby?: string | null;
  readonly ariaDescribedby?: string | null;
  readonly maxlength?: number | null;
  readonly placeholder?: string;
  readonly spellcheck?: boolean;
  readonly autocapitalize?: string;
  readonly readonly?: boolean;
  readonly disabled?: boolean;
  /** Busy (saving): disabled until it clears. */
  readonly busy?: boolean;
  readonly invalid?: boolean;
  readonly textareaClass?: string;
  /** The live-preview editor (CodeMirror) instead of the textarea. */
  readonly live?: boolean;
  /** Resolves an image of the live editor (default: inline `data:` images only). */
  readonly imageSource?: MarkdownImageResolver | null;
  readonly shortcuts?: boolean;
  readonly continueLists?: boolean;
  readonly onEditorInput?: (event: Event) => void;
  readonly onEditorKeydown?: (event: KeyboardEvent) => void;
  readonly onEditorPaste?: (event: ClipboardEvent) => void;
  readonly onEditorDragover?: (event: DragEvent) => void;
  readonly onEditorDrop?: (event: DragEvent) => void;
  readonly onEditorFocus?: (event: FocusEvent) => void;
  readonly onEditorBlur?: (event: FocusEvent) => void;
  readonly onSelectionChange?: (selection: MarkdownSelection) => void;
  /** A toolbar button: `preventDefault()` on the event keeps the editor from applying it. */
  readonly onToolbarCommand?: (event: MarkdownToolbarCommandEvent) => void;
  /** Your controls at the end of the header (a `SoneMarkdownEditorTools`). */
  readonly tools?: ReactNode;
  /** A row under the text (a `SoneMarkdownEditorFooter`). */
  readonly footer?: ReactNode;
  /** Your own preview of the source instead of `SoneMarkdown`. */
  readonly renderPreview?: (source: string) => ReactNode;
  /** The editing methods (`applyCommand`, `insertText`, …) and the surface. */
  readonly handleRef?: Ref<SoneMarkdownEditorHandle>;
  readonly ref?: Ref<HTMLElement>;
}

const preventMousedown = (event: ReactMouseEvent): void =>
  event.preventDefault();
const toolbarKey = (event: ReactKeyboardEvent<HTMLElement>): void =>
  moveToolbarFocus(event.nativeEvent);

function Glyph({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function ToolbarButton({
  item,
  modKey,
  disabled,
  onCommand,
}: {
  item: MarkdownToolbarItem;
  modKey: string;
  disabled: boolean;
  onCommand: (command: MarkdownCommand) => void;
}): ReactElement {
  const hint = markdownToolbarHint(item, modKey);
  const tooltip = useSoneTooltip<HTMLButtonElement>(hint.tooltip);
  return (
    <SoneButton
      ref={tooltip}
      variant="ghost"
      size="icon-sm"
      type="button"
      aria-label={item.label}
      aria-keyshortcuts={hint.keyshortcuts ?? undefined}
      disabled={disabled}
      onMouseDown={preventMousedown}
      onClick={() => onCommand(item.command)}
      onKeyDown={toolbarKey}
    >
      <Glyph d={item.icon} />
    </SoneButton>
  );
}

/**
 * `<sone-markdown-editor>` — a markdown field with a formatting toolbar (full, minimal,
 * document or none; ⌘/Ctrl + B, I, K, Shift+X, Shift+9), Write / Preview tabs or a split
 * view, list continuation on Enter and paste-as-markdown. `live` swaps the textarea for a
 * live-preview editor (CodeMirror — optional peer dependencies, loaded on demand after
 * mount; the server renders its empty host).
 */
export function SoneMarkdownEditor({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  mode: modeProp,
  defaultMode = "edit",
  onModeChange,
  appearance = "field",
  toolbar = "full",
  stickyToolbar = false,
  toolbarPlacement = "top",
  focusFrame = true,
  tabs = true,
  minRows = 4,
  ariaLabel = null,
  ariaLabelledby = null,
  ariaDescribedby = null,
  maxlength = null,
  placeholder = "",
  spellcheck = true,
  autocapitalize = "sentences",
  readonly = false,
  disabled = false,
  busy = false,
  invalid = false,
  textareaClass = "",
  live = false,
  imageSource = null,
  shortcuts = true,
  continueLists = true,
  onEditorInput,
  onEditorKeydown,
  onEditorPaste,
  onEditorDragover,
  onEditorDrop,
  onEditorFocus,
  onEditorBlur,
  onSelectionChange,
  onToolbarCommand,
  tools,
  footer,
  renderPreview,
  handleRef,
  className,
  style,
  ref,
  ...rest
}: SoneMarkdownEditorProps): ReactElement {
  const m = useSoneMessages();
  const id = `sone-md-editor-${useId()}`;
  const [value, setValue] = useControllable(
    valueProp,
    defaultValue,
    onValueChange,
  );
  const [mode, setModeState] = useControllable(
    modeProp,
    defaultMode,
    onModeChange,
  );
  const host = useRef<HTMLElement | null>(null);
  const hostRef = useMemo(() => mergeRefs<HTMLElement>(host, ref), [ref]);
  const header = useRef<HTMLDivElement | null>(null);
  const area = useRef<HTMLTextAreaElement | null>(null);
  const liveHost = useRef<HTMLDivElement | null>(null);
  const liveSurface = useRef<LiveSurface | null>(null);
  const [, setLiveReady] = useState(0);
  const dock = useRef<FloatingDockTracker | null>(null);
  const pendingSelection = useRef<EditorState | null>(null);
  const pendingFocus = useRef(false);
  const plainPasteArmed = useRef(false);
  const [modKey, setModKey] = useState("Ctrl+");
  useEffect(() => setModKey(markdownModKey()), []);

  // The latest value for handlers that outlive a render (the live editor's).
  const valueRef = useRef(value);
  valueRef.current = value;

  const isDisabled = disabled || busy;
  const toolsDisabled = isDisabled || readonly || mode === "preview";
  const showEdit = mode !== "preview";
  const showPreview = mode !== "edit";
  const showTabs = tabs && mode !== "split";
  const showHeader = showTabs || toolbar !== "none" || tools != null;
  const labels = useMemo(
    () => markdownToolbarLabels(m.markdownToolbar),
    [m.markdownToolbar],
  );
  const entries = useMemo(
    () => markdownToolbarEntries(toolbar, labels),
    [toolbar, labels],
  );

  const surface = (): MarkdownTextSurface | null =>
    liveSurface.current ?? area.current;

  // Every handler reads the latest props through `api.current`.
  const api = useRef(null as unknown as ReturnType<typeof makeApi>);
  function makeApi() {
    const emitSelection = (): void => {
      const el = surface();
      if (el) {
        onSelectionChange?.({ start: el.selectionStart, end: el.selectionEnd });
      }
    };
    const sync = (next: string): void => {
      if (next !== valueRef.current) {
        valueRef.current = next;
        setValue(next);
      }
    };
    const commit = (state: EditorState): void => {
      const el = surface();
      if (!el) {
        sync(state.value);
        return;
      }
      const native = writeMarkdownEdit(el, state, sync);
      emitSelection();
      // Restore the selection after the re-render, in case the engine moved the caret.
      if (native) pendingSelection.current = state;
    };
    const getSelection = (): MarkdownSelection => {
      const el = surface();
      const end = valueRef.current.length;
      return el
        ? { start: el.selectionStart, end: el.selectionEnd }
        : { start: end, end };
    };
    const replaceRange = (
      from: number,
      to: number,
      text: string,
      selectionStart = from + text.length,
      selectionEnd = selectionStart,
    ): void => {
      const v = valueRef.current;
      commit({
        value: v.slice(0, from) + text + v.slice(to),
        selectionStart,
        selectionEnd,
      });
    };
    const applyCommand = (command: MarkdownCommand): void => {
      if (toolsDisabled) return;
      const { start, end } = getSelection();
      commit(
        applyMarkdownCommand(
          { value: valueRef.current, selectionStart: start, selectionEnd: end },
          command,
          m.markdownEditorSection,
        ),
      );
    };
    const handle: SoneMarkdownEditorHandle = {
      get textarea() {
        return surface();
      },
      focus: (options) => surface()?.focus(options),
      getSelection,
      setSelection: (start, end = start) => {
        const el = surface();
        if (el) {
          el.setSelectionRange(start, end);
          emitSelection();
        }
      },
      insertText: (text) => {
        const { start, end } = getSelection();
        replaceRange(start, end, text);
      },
      replaceSelection: (text) => {
        const { start, end } = getSelection();
        replaceRange(start, end, text, start, start + text.length);
      },
      wrapSelection: (before, after = before) => {
        const { start, end } = getSelection();
        const v = valueRef.current;
        commit({
          value:
            v.slice(0, start) +
            before +
            v.slice(start, end) +
            after +
            v.slice(end),
          selectionStart: start + before.length,
          selectionEnd: end + before.length,
        });
      },
      replaceRange,
      applyCommand,
    };
    const onInput = (event: Event): void => {
      sync((event.target as unknown as MarkdownTextSurface).value);
      onEditorInput?.(event);
      emitSelection();
    };
    const onKeydown = (event: KeyboardEvent): void => {
      onEditorKeydown?.(event);
      if (event.defaultPrevented || event.isComposing || readonly) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.shiftKey && !event.altKey && event.code === "KeyV") {
        plainPasteArmed.current = true;
      }
      if (mod && !event.altKey && shortcuts) {
        const command = markdownShortcutCommand(event);
        if (command) {
          // Stop the app's document-level shortcuts (⌘K = Search) from also firing.
          event.preventDefault();
          event.stopPropagation();
          applyCommand(command);
        }
        return;
      }
      if (
        event.key === "Enter" &&
        !mod &&
        !event.shiftKey &&
        !event.altKey &&
        continueLists
      ) {
        const { start, end } = getSelection();
        const next = continueList({
          value: valueRef.current,
          selectionStart: start,
          selectionEnd: end,
        });
        if (next) {
          event.preventDefault();
          commit(next);
        }
      }
    };
    const onPaste = (event: ClipboardEvent): void => {
      const plain = plainPasteArmed.current;
      plainPasteArmed.current = false;
      onEditorPaste?.(event);
      const data = event.clipboardData;
      if (event.defaultPrevented || plain || !data || toolsDisabled) return;
      const { start, end } = getSelection();
      const next = pasteAsMarkdown(data, valueRef.current, start, end);
      if (!next) return;
      event.preventDefault();
      commit(next);
    };
    const indent = (direction: 1 | -1): boolean => {
      if (toolsDisabled) return false;
      const { start, end } = getSelection();
      commit(
        shiftIndent(
          { value: valueRef.current, selectionStart: start, selectionEnd: end },
          direction,
        ),
      );
      return true;
    };
    const toolbarCommand = (command: MarkdownCommand): void => {
      if (toolsDisabled) return;
      const event = new MarkdownToolbarCommandEvent(command);
      onToolbarCommand?.(event);
      if (!event.defaultPrevented) applyCommand(command);
    };
    const setMode = (next: MarkdownEditorMode): void => {
      setModeState(next);
      if (next !== "preview") pendingFocus.current = true;
    };
    return {
      handle,
      emitSelection,
      onInput,
      onKeydown,
      onPaste,
      indent,
      toolbarCommand,
      setMode,
      onBlur: (event: FocusEvent) => onEditorBlur?.(event),
      onFocus: (event: FocusEvent) => onEditorFocus?.(event),
      onDragover: (event: DragEvent) => onEditorDragover?.(event),
      onDrop: (event: DragEvent) => onEditorDrop?.(event),
    };
  }
  api.current = makeApi();

  // A stable handle that always runs the latest render's methods.
  useImperativeHandle(
    handleRef,
    (): SoneMarkdownEditorHandle => ({
      get textarea() {
        return api.current.handle.textarea;
      },
      focus: (options) => api.current.handle.focus(options),
      getSelection: () => api.current.handle.getSelection(),
      setSelection: (start, end) => api.current.handle.setSelection(start, end),
      insertText: (text) => api.current.handle.insertText(text),
      replaceSelection: (text) => api.current.handle.replaceSelection(text),
      wrapSelection: (before, after) =>
        api.current.handle.wrapSelection(before, after),
      replaceRange: (from, to, text, selectionStart, selectionEnd) =>
        api.current.handle.replaceRange(
          from,
          to,
          text,
          selectionStart,
          selectionEnd,
        ),
      applyCommand: (command) => api.current.handle.applyCommand(command),
    }),
    [],
  );

  useLayoutEffect(() => {
    const state = pendingSelection.current;
    if (state) {
      pendingSelection.current = null;
      const now = surface();
      if (now && now.value === state.value) {
        now.setSelectionRange(state.selectionStart, state.selectionEnd);
      }
    }
    if (pendingFocus.current) {
      pendingFocus.current = false;
      surface()?.focus();
    }
  });

  // ---- the floating toolbar dock --------------------------------------------------------
  useEffect(() => {
    const el = header.current;
    if (toolbarPlacement !== "dock" || !el || !host.current) return;
    const tracker = trackFloatingDock(el, host.current);
    dock.current = tracker;
    return () => {
      tracker?.destroy();
      dock.current = null;
    };
  }, [toolbarPlacement, showHeader]);

  // ---- the live editor -------------------------------------------------------------------
  const liveConfig = useMemo(() => {
    const attributes: Record<string, string> = {
      id: `${id}-area`,
      spellcheck: String(spellcheck),
      autocapitalize,
      "aria-multiline": "true",
    };
    if (ariaLabel) attributes["aria-label"] = ariaLabel;
    if (ariaLabelledby) attributes["aria-labelledby"] = ariaLabelledby;
    if (ariaDescribedby) attributes["aria-describedby"] = ariaDescribedby;
    if (invalid) attributes["aria-invalid"] = "true";
    if (isDisabled) attributes["aria-disabled"] = "true";
    else if (readonly) attributes["aria-readonly"] = "true";
    return {
      placeholder,
      readOnly: readonly || isDisabled,
      attributes,
      imageSource,
    };
  }, [
    id,
    spellcheck,
    autocapitalize,
    ariaLabel,
    ariaLabelledby,
    ariaDescribedby,
    invalid,
    isDisabled,
    readonly,
    placeholder,
    imageSource,
  ]);
  const liveConfigRef = useRef(liveConfig);
  liveConfigRef.current = liveConfig;
  const liveLabels = useRef({
    task: m.markdownTask,
    taskDone: m.markdownTaskDone,
  });
  liveLabels.current = { task: m.markdownTask, taskDone: m.markdownTaskDone };
  const contentClass = `markdown-editor-area ${textareaClass}`;
  const contentClassRef = useRef(contentClass);
  contentClassRef.current = contentClass;

  const showLive = live && showEdit;
  useEffect(() => {
    if (live) void loadLiveMarkdown();
  }, [live]);
  useEffect(() => {
    const el = liveHost.current;
    if (!showLive || !el) return;
    let cancelled = false;
    let created: LiveSurface | null = null;
    const onInput = (event: Event): void => api.current.onInput(event);
    const create = (module: LiveModule): void => {
      if (cancelled) return;
      created = module.createLiveMarkdown(el, {
        doc: valueRef.current,
        ...liveConfigRef.current,
        contentClass: contentClassRef.current,
        labels: liveLabels.current,
        onKeydown: (event) => api.current.onKeydown(event),
        onPaste: (event) => api.current.onPaste(event),
        onIndent: (direction) => api.current.indent(direction),
        onDragover: (event) => api.current.onDragover(event),
        onDrop: (event) => api.current.onDrop(event),
        onFocus: (event) => api.current.onFocus(event),
        onBlur: (event) => api.current.onBlur(event),
        onSelection: () => api.current.emitSelection(),
        scrollMarginBottom: () => dock.current?.clearance ?? 0,
      });
      created.addEventListener("input", onInput);
      liveSurface.current = created;
      setLiveReady((n) => n + 1);
    };
    if (liveModule) create(liveModule);
    else void loadLiveMarkdown().then(create);
    return () => {
      cancelled = true;
      created?.destroy();
      liveSurface.current = null;
    };
  }, [showLive]);
  useEffect(() => {
    const s = liveSurface.current;
    if (s && s.value !== value) s.replaceFromOutside(value);
  });
  useEffect(() => {
    liveSurface.current?.configure(liveConfig);
  }, [liveConfig]);

  // ---- render ----------------------------------------------------------------------------
  const a = api.current;
  const headerNode = showHeader ? (
    <div
      ref={header}
      className="markdown-editor-header"
      data-slot="markdown-editor-header"
    >
      {showTabs ? (
        <SoneTabsList
          role="tablist"
          className="markdown-editor-tabs"
          aria-label={m.markdownEditorView}
        >
          <SoneTabsTrigger
            role="tab"
            type="button"
            id={`${id}-tab-edit`}
            aria-controls={showEdit ? `${id}-edit` : undefined}
            active={mode === "edit"}
            disabled={isDisabled}
            onClick={() => a.setMode("edit")}
          >
            {m.markdownEditorWrite}
          </SoneTabsTrigger>
          <SoneTabsTrigger
            role="tab"
            type="button"
            id={`${id}-tab-preview`}
            aria-controls={showPreview ? `${id}-preview` : undefined}
            active={mode === "preview"}
            disabled={isDisabled}
            onClick={() => a.setMode("preview")}
          >
            {m.markdownEditorPreview}
          </SoneTabsTrigger>
        </SoneTabsList>
      ) : null}
      {entries.length ? (
        <div
          className="markdown-editor-toolbar"
          role="toolbar"
          aria-label={m.markdownEditorFormatting}
          aria-controls={showEdit ? `${id}-area` : undefined}
        >
          {entries.flatMap((entry) => [
            entry.sep ? (
              <SoneSeparator
                key={`sep:${entry.id}`}
                as="span"
                orientation="vertical"
                className="markdown-editor-sep"
              />
            ) : null,
            entry.kind === "menu" ? (
              <SoneRowMenu
                key={entry.id}
                className="markdown-editor-menu"
                prominent
                side={toolbarPlacement === "dock" ? "top" : "bottom"}
                align="start"
                clipToScrollParents={false}
                label={entry.label}
                tooltip={entry.label}
                disabled={toolsDisabled}
                onMouseDown={preventMousedown}
                onKeyDown={toolbarKey}
                glyph={
                  <Glyph
                    d={entry.icon}
                    className="markdown-editor-menu-glyph"
                  />
                }
              >
                {entry.items.map((item) => (
                  <SoneMenuItem
                    key={item.command}
                    role="menuitem"
                    type="button"
                    onMouseDown={preventMousedown}
                    onClick={() => a.toolbarCommand(item.command)}
                  >
                    <Glyph d={item.icon} />
                    {item.label}
                  </SoneMenuItem>
                ))}
              </SoneRowMenu>
            ) : (
              <ToolbarButton
                key={entry.id}
                item={entry.item}
                modKey={modKey}
                disabled={toolsDisabled}
                onCommand={a.toolbarCommand}
              />
            ),
          ])}
        </div>
      ) : null}
      {tools}
    </div>
  ) : null;

  const writePane = showEdit ? (
    <div
      className="markdown-editor-pane markdown-editor-write"
      id={`${id}-edit`}
      role={showTabs ? "tabpanel" : undefined}
      aria-labelledby={showTabs ? `${id}-tab-edit` : undefined}
    >
      {live ? (
        <div
          ref={liveHost}
          className="markdown-editor-live"
          data-slot="markdown-editor-live"
        />
      ) : (
        <div className="markdown-editor-grow" data-value={value}>
          <textarea
            ref={area}
            id={`${id}-area`}
            className={cx("markdown-editor-area", textareaClass)}
            aria-label={ariaLabel ?? undefined}
            aria-labelledby={ariaLabelledby ?? undefined}
            aria-describedby={ariaDescribedby ?? undefined}
            maxLength={maxlength ?? undefined}
            aria-invalid={invalid ? "true" : undefined}
            placeholder={placeholder}
            spellCheck={spellcheck}
            autoCapitalize={autocapitalize}
            autoComplete="off"
            rows={minRows}
            value={value}
            disabled={isDisabled}
            readOnly={readonly}
            onChange={(event) => a.onInput(event.nativeEvent)}
            onKeyDown={(event) => a.onKeydown(event.nativeEvent)}
            onPaste={(event: ReactClipboardEvent<HTMLTextAreaElement>) =>
              a.onPaste(event.nativeEvent)
            }
            onDragOver={(event) => a.onDragover(event.nativeEvent)}
            onDrop={(event) => a.onDrop(event.nativeEvent)}
            onFocus={(event) => a.onFocus(event.nativeEvent)}
            onBlur={(event) => a.onBlur(event.nativeEvent)}
            onSelect={() => a.emitSelection()}
            onMouseUp={() => a.emitSelection()}
            onKeyUp={() => a.emitSelection()}
          />
        </div>
      )}
      {footer}
    </div>
  ) : null;

  const previewPane = showPreview ? (
    <div
      className="markdown-editor-pane markdown-editor-preview"
      id={`${id}-preview`}
      role={showTabs ? "tabpanel" : undefined}
      aria-labelledby={showTabs ? `${id}-tab-preview` : undefined}
    >
      {renderPreview ? (
        renderPreview(value)
      ) : value.trim() ? (
        <SoneMarkdown
          source={value}
          size={appearance === "field" ? "sm" : "default"}
        />
      ) : (
        <p className="markdown-editor-empty">{m.markdownEditorEmpty}</p>
      )}
    </div>
  ) : null;

  return createElement(
    "sone-markdown-editor",
    {
      "data-slot": "markdown-editor",
      "data-mode": mode,
      "data-appearance": appearance,
      "data-disabled": isDisabled ? "" : undefined,
      "data-invalid": invalid ? "" : undefined,
      "data-sticky-toolbar": stickyToolbar ? "" : undefined,
      "data-toolbar-placement": toolbarPlacement,
      "data-focus-frame": focusFrame ? undefined : "off",
      ...rest,
      ref: hostRef,
      className: cx("markdown-editor", className),
      style: { "--markdown-editor-rows": minRows, ...style } as CSSProperties,
    },
    headerNode,
    <div className="markdown-editor-panes">
      {writePane}
      {previewPane}
    </div>,
  );
}
