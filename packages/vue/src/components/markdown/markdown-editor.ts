import {
  computed,
  defineComponent,
  h,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  shallowRef,
  useId,
  watch,
  withDirectives,
  type PropType,
  type SlotsType,
  type VNodeChild,
} from "vue";

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
  type MarkdownToolbarLabels,
} from "@surface-one/core";

import { useSoneMessages } from "../../composables/messages";
import { vSoneTooltip } from "../../directives/tooltip";
import { definePart } from "../../utils/part";
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

/** What a `SoneMarkdownEditor` template ref exposes. */
export interface SoneMarkdownEditorExposed {
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

/** `[soneMarkdownEditorTools]` — your controls at the end of the header (`#tools` slot). */
export const SoneMarkdownEditorTools = definePart({
  name: "SoneMarkdownEditorTools",
  tag: "div",
  className: "markdown-editor-tools",
  slot: "markdown-editor-tools",
});

/** `[soneMarkdownEditorFooter]` — a row under the text (`#footer` slot). */
export const SoneMarkdownEditorFooter = definePart({
  name: "SoneMarkdownEditorFooter",
  tag: "div",
  className: "markdown-editor-footer",
  slot: "markdown-editor-footer",
});

const glyph = (d: string, attrs: Record<string, unknown> = {}) =>
  h(
    "svg",
    {
      ...attrs,
      viewBox: "0 0 16 16",
      fill: "none",
      stroke: "currentColor",
      "stroke-width": "1.5",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
      "aria-hidden": "true",
    },
    h("path", { d }),
  );

const preventMousedown = (event: MouseEvent): void => event.preventDefault();

/**
 * `<sone-markdown-editor>` — a markdown field with a formatting toolbar (full, minimal,
 * document or none; ⌘/Ctrl + B, I, K, Shift+X, Shift+9), Write / Preview tabs or a split
 * view, list continuation on Enter and paste-as-markdown. `v-model` holds the text,
 * `v-model:mode` the view. `live` swaps the textarea for a live-preview editor
 * (CodeMirror — optional peer dependencies, loaded on demand after mount; the server
 * renders its empty host). Slots: `#tools` (header controls), `#footer` (under the text),
 * `#preview` (`{ source }`, your own preview).
 */
export const SoneMarkdownEditor = defineComponent({
  name: "SoneMarkdownEditor",
  props: {
    modelValue: { type: String, default: "" },
    mode: { type: String as PropType<MarkdownEditorMode>, default: "edit" },
    appearance: {
      type: String as PropType<MarkdownEditorAppearance>,
      default: "field",
    },
    toolbar: {
      type: String as PropType<MarkdownEditorToolbar>,
      default: "full",
    },
    stickyToolbar: { type: Boolean, default: false },
    toolbarPlacement: {
      type: String as PropType<MarkdownEditorToolbarPlacement>,
      default: "top",
    },
    focusFrame: { type: Boolean, default: true },
    tabs: { type: Boolean, default: true },
    minRows: { type: Number, default: 4 },
    ariaLabel: { type: String as PropType<string | null>, default: null },
    ariaLabelledby: { type: String as PropType<string | null>, default: null },
    ariaDescribedby: { type: String as PropType<string | null>, default: null },
    maxlength: { type: Number as PropType<number | null>, default: null },
    placeholder: { type: String, default: "" },
    spellcheck: { type: Boolean, default: true },
    autocapitalize: { type: String, default: "sentences" },
    readonly: { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    /** Busy (saving): disabled until it clears. */
    busy: { type: Boolean, default: false },
    invalid: { type: Boolean, default: false },
    textareaClass: { type: String, default: "" },
    /** The live-preview editor (CodeMirror) instead of the textarea. */
    live: { type: Boolean, default: false },
    /** Resolves an image of the live editor (default: inline `data:` images only). */
    imageSource: {
      type: Function as PropType<MarkdownImageResolver | null>,
      default: null,
    },
    shortcuts: { type: Boolean, default: true },
    continueLists: { type: Boolean, default: true },
  },
  emits: {
    "update:modelValue": (_value: string) => true,
    "update:mode": (_mode: MarkdownEditorMode) => true,
    editorInput: (_event: Event) => true,
    editorKeydown: (_event: KeyboardEvent) => true,
    editorPaste: (_event: ClipboardEvent) => true,
    editorDragover: (_event: DragEvent) => true,
    editorDrop: (_event: DragEvent) => true,
    editorFocus: (_event: FocusEvent) => true,
    editorBlur: (_event: FocusEvent) => true,
    selectionChange: (_selection: MarkdownSelection) => true,
    /** A toolbar button: `preventDefault()` on the event keeps the editor from applying it. */
    toolbarCommand: (_event: MarkdownToolbarCommandEvent) => true,
  },
  slots: Object as SlotsType<{
    tools: object;
    footer: object;
    preview: { source: string };
  }>,
  setup(props, { emit, expose, slots }) {
    const messages = useSoneMessages();
    const id = `sone-md-editor-${useId()}`;
    const host = ref<HTMLElement | null>(null);
    const header = ref<HTMLElement | null>(null);
    const area = ref<HTMLTextAreaElement | null>(null);
    const liveHost = ref<HTMLElement | null>(null);
    const liveSurface = shallowRef<LiveSurface | null>(null);
    const modKey = ref<string>("Ctrl+");
    onMounted(() => {
      modKey.value = markdownModKey();
    });

    const value = ref(props.modelValue);
    watch(
      () => props.modelValue,
      (next) => (value.value = next),
    );
    const mode = ref(props.mode);
    watch(
      () => props.mode,
      (next) => (mode.value = next),
    );

    const isDisabled = computed(() => props.disabled || props.busy);
    const toolsDisabled = computed(
      () => isDisabled.value || props.readonly || mode.value === "preview",
    );
    const showEdit = computed(() => mode.value !== "preview");
    const showPreview = computed(() => mode.value !== "edit");
    const showTabs = computed(() => props.tabs && mode.value !== "split");
    const labels = computed<MarkdownToolbarLabels>(() =>
      markdownToolbarLabels(messages.value.markdownToolbar),
    );
    const entries = computed(() =>
      markdownToolbarEntries(props.toolbar, labels.value),
    );

    const surface = (): MarkdownTextSurface | null =>
      liveSurface.value ?? area.value;

    const emitSelection = (): void => {
      const el = surface();
      if (el) {
        emit("selectionChange", {
          start: el.selectionStart,
          end: el.selectionEnd,
        });
      }
    };
    const sync = (next: string): void => {
      if (next !== value.value) {
        value.value = next;
        emit("update:modelValue", next);
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
      if (!native) return;
      // Restore the selection after the `value` binding re-applies, in case the engine moved the caret.
      void nextTick(() => {
        const now = surface();
        if (now && now.value === state.value) {
          now.setSelectionRange(state.selectionStart, state.selectionEnd);
        }
      });
    };

    const getSelection = (): MarkdownSelection => {
      const el = surface();
      const end = value.value.length;
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
      const v = value.value;
      commit({
        value: v.slice(0, from) + text + v.slice(to),
        selectionStart,
        selectionEnd,
      });
    };
    const applyCommand = (command: MarkdownCommand): void => {
      if (toolsDisabled.value) return;
      const { start, end } = getSelection();
      commit(
        applyMarkdownCommand(
          { value: value.value, selectionStart: start, selectionEnd: end },
          command,
          messages.value.markdownEditorSection,
        ),
      );
    };
    const focus = (options?: FocusOptions): void => surface()?.focus(options);

    const exposed: SoneMarkdownEditorExposed = {
      get textarea() {
        return surface();
      },
      focus,
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
        const v = value.value;
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
    expose(exposed);

    const onToolbarCommand = (command: MarkdownCommand): void => {
      if (toolsDisabled.value) return;
      const event = new MarkdownToolbarCommandEvent(command);
      emit("toolbarCommand", event);
      if (!event.defaultPrevented) applyCommand(command);
    };
    const setMode = (next: MarkdownEditorMode): void => {
      mode.value = next;
      emit("update:mode", next);
      if (next !== "preview") void nextTick(() => focus());
    };

    const onInput = (event: Event): void => {
      sync((event.target as unknown as MarkdownTextSurface).value);
      emit("editorInput", event);
      emitSelection();
    };
    let plainPasteArmed = false;
    const onKeydown = (event: KeyboardEvent): void => {
      emit("editorKeydown", event);
      if (event.defaultPrevented || event.isComposing || props.readonly) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.shiftKey && !event.altKey && event.code === "KeyV") {
        plainPasteArmed = true;
      }
      if (mod && !event.altKey && props.shortcuts) {
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
        props.continueLists
      ) {
        const { start, end } = getSelection();
        const next = continueList({
          value: value.value,
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
      const plain = plainPasteArmed;
      plainPasteArmed = false;
      emit("editorPaste", event);
      const data = event.clipboardData;
      if (event.defaultPrevented || plain || !data || toolsDisabled.value) {
        return;
      }
      const { start, end } = getSelection();
      const next = pasteAsMarkdown(data, value.value, start, end);
      if (!next) return;
      event.preventDefault();
      commit(next);
    };
    const indent = (direction: 1 | -1): boolean => {
      if (toolsDisabled.value) return false;
      const { start, end } = getSelection();
      commit(
        shiftIndent(
          { value: value.value, selectionStart: start, selectionEnd: end },
          direction,
        ),
      );
      return true;
    };
    const onBlur = (event: FocusEvent): void => emit("editorBlur", event);

    // ---- the floating toolbar dock --------------------------------------------------
    let dock: FloatingDockTracker | null = null;
    const stopDock = (): void => {
      dock?.destroy();
      dock = null;
    };
    onMounted(() => {
      watch(
        [() => props.toolbarPlacement, header],
        ([placement, el]) => {
          stopDock();
          if (placement === "dock" && el && host.value) {
            dock = trackFloatingDock(el, host.value);
          }
        },
        { immediate: true, flush: "post" },
      );
    });
    onBeforeUnmount(stopDock);

    // ---- the live editor ---------------------------------------------------------------
    const liveConfig = computed(() => {
      const attributes: Record<string, string> = {
        id: `${id}-area`,
        spellcheck: String(props.spellcheck),
        autocapitalize: props.autocapitalize,
        "aria-multiline": "true",
      };
      if (props.ariaLabel) attributes["aria-label"] = props.ariaLabel;
      if (props.ariaLabelledby)
        attributes["aria-labelledby"] = props.ariaLabelledby;
      if (props.ariaDescribedby)
        attributes["aria-describedby"] = props.ariaDescribedby;
      if (props.invalid) attributes["aria-invalid"] = "true";
      if (isDisabled.value) attributes["aria-disabled"] = "true";
      else if (props.readonly) attributes["aria-readonly"] = "true";
      return {
        placeholder: props.placeholder,
        readOnly: props.readonly || isDisabled.value,
        attributes,
        imageSource: props.imageSource,
      };
    });
    let unmountLive: (() => void) | null = null;
    const mountLive = (el: HTMLElement | null): void => {
      unmountLive?.();
      unmountLive = null;
      if (!el) return;
      let cancelled = false;
      let created: LiveSurface | null = null;
      const create = (module: LiveModule): void => {
        if (cancelled) return;
        const m = messages.value;
        created = module.createLiveMarkdown(el, {
          doc: value.value,
          ...liveConfig.value,
          contentClass: `markdown-editor-area ${props.textareaClass}`,
          labels: { task: m.markdownTask, taskDone: m.markdownTaskDone },
          onKeydown,
          onPaste,
          onIndent: indent,
          onDragover: (event) => emit("editorDragover", event),
          onDrop: (event) => emit("editorDrop", event),
          onFocus: (event) => emit("editorFocus", event),
          onBlur,
          onSelection: emitSelection,
          scrollMarginBottom: () => dock?.clearance ?? 0,
        });
        created.addEventListener("input", onInput);
        liveSurface.value = created;
      };
      if (liveModule) create(liveModule);
      else void loadLiveMarkdown().then(create);
      unmountLive = () => {
        cancelled = true;
        created?.destroy();
        liveSurface.value = null;
      };
    };
    onMounted(() => {
      watch(liveHost, mountLive, { immediate: true, flush: "post" });
      watch(
        () => props.live,
        (live) => {
          if (live) void loadLiveMarkdown();
        },
        { immediate: true },
      );
    });
    onBeforeUnmount(() => unmountLive?.());
    watch([liveSurface, value], ([s, v]) => {
      if (s && s.value !== v) s.replaceFromOutside(v);
    });
    watch(liveConfig, (config) => liveSurface.value?.configure(config));

    // ---- render ------------------------------------------------------------------------
    const toolbarButton = (item: MarkdownToolbarItem) => {
      const hint = markdownToolbarHint(item, modKey.value);
      return withDirectives(
        h(
          SoneButton,
          {
            key: item.command,
            variant: "ghost",
            size: "icon-sm",
            type: "button",
            "aria-label": item.label,
            "aria-keyshortcuts": hint.keyshortcuts ?? undefined,
            disabled: toolsDisabled.value,
            onMousedown: preventMousedown,
            onClick: () => onToolbarCommand(item.command),
            onKeydown: moveToolbarFocus,
          },
          () => glyph(item.icon),
        ),
        [[vSoneTooltip, hint.tooltip]],
      );
    };

    const toolbarChildren = (): VNodeChild[] =>
      entries.value.flatMap((entry) => [
        entry.sep
          ? h(SoneSeparator, {
              key: `sep:${entry.id}`,
              as: "span",
              orientation: "vertical",
              class: "markdown-editor-sep",
            })
          : null,
        entry.kind === "menu"
          ? h(
              SoneRowMenu,
              {
                key: entry.id,
                class: "markdown-editor-menu",
                prominent: true,
                side: props.toolbarPlacement === "dock" ? "top" : "bottom",
                align: "start",
                clipToScrollParents: false,
                label: entry.label,
                tooltip: entry.label,
                disabled: toolsDisabled.value,
                onMousedown: preventMousedown,
                onKeydown: moveToolbarFocus,
              },
              {
                glyph: () =>
                  glyph(entry.icon, { class: "markdown-editor-menu-glyph" }),
                default: () =>
                  entry.items.map((item) =>
                    h(
                      SoneMenuItem,
                      {
                        key: item.command,
                        role: "menuitem",
                        type: "button",
                        onMousedown: preventMousedown,
                        onClick: () => onToolbarCommand(item.command),
                      },
                      () => [glyph(item.icon), item.label],
                    ),
                  ),
              },
            )
          : toolbarButton(entry.item),
      ]);

    return () => {
      const m = messages.value;
      const tools = slots.tools?.({});
      const showHeader =
        showTabs.value || props.toolbar !== "none" || !!tools?.length;
      const headerNode = showHeader
        ? h(
            "div",
            {
              ref: header,
              class: "markdown-editor-header",
              "data-slot": "markdown-editor-header",
            },
            [
              showTabs.value
                ? h(
                    SoneTabsList,
                    {
                      role: "tablist",
                      class: "markdown-editor-tabs",
                      "aria-label": m.markdownEditorView,
                    },
                    () => [
                      h(
                        SoneTabsTrigger,
                        {
                          role: "tab",
                          type: "button",
                          id: `${id}-tab-edit`,
                          "aria-controls": showEdit.value
                            ? `${id}-edit`
                            : undefined,
                          active: mode.value === "edit",
                          disabled: isDisabled.value,
                          onClick: () => setMode("edit"),
                        },
                        () => m.markdownEditorWrite,
                      ),
                      h(
                        SoneTabsTrigger,
                        {
                          role: "tab",
                          type: "button",
                          id: `${id}-tab-preview`,
                          "aria-controls": showPreview.value
                            ? `${id}-preview`
                            : undefined,
                          active: mode.value === "preview",
                          disabled: isDisabled.value,
                          onClick: () => setMode("preview"),
                        },
                        () => m.markdownEditorPreview,
                      ),
                    ],
                  )
                : null,
              entries.value.length
                ? h(
                    "div",
                    {
                      class: "markdown-editor-toolbar",
                      role: "toolbar",
                      "aria-label": m.markdownEditorFormatting,
                      "aria-controls": showEdit.value
                        ? `${id}-area`
                        : undefined,
                    },
                    toolbarChildren(),
                  )
                : null,
              tools,
            ],
          )
        : null;

      const writePane = showEdit.value
        ? h(
            "div",
            {
              class: "markdown-editor-pane markdown-editor-write",
              id: `${id}-edit`,
              role: showTabs.value ? "tabpanel" : undefined,
              "aria-labelledby": showTabs.value ? `${id}-tab-edit` : undefined,
            },
            [
              props.live
                ? h("div", {
                    ref: liveHost,
                    class: "markdown-editor-live",
                    "data-slot": "markdown-editor-live",
                  })
                : h(
                    "div",
                    {
                      class: "markdown-editor-grow",
                      "data-value": value.value,
                    },
                    h("textarea", {
                      ref: area,
                      id: `${id}-area`,
                      class: ["markdown-editor-area", props.textareaClass],
                      "aria-label": props.ariaLabel ?? undefined,
                      "aria-labelledby": props.ariaLabelledby ?? undefined,
                      "aria-describedby": props.ariaDescribedby ?? undefined,
                      maxlength: props.maxlength ?? undefined,
                      "aria-invalid": props.invalid ? "true" : undefined,
                      placeholder: props.placeholder,
                      spellcheck: props.spellcheck ? "true" : "false",
                      autocapitalize: props.autocapitalize,
                      autocomplete: "off",
                      rows: props.minRows,
                      value: value.value,
                      disabled: isDisabled.value,
                      readonly: props.readonly,
                      onInput,
                      onKeydown,
                      onPaste,
                      onDragover: (event: DragEvent) =>
                        emit("editorDragover", event),
                      onDrop: (event: DragEvent) => emit("editorDrop", event),
                      onFocus: (event: FocusEvent) =>
                        emit("editorFocus", event),
                      onBlur,
                      onSelect: emitSelection,
                      onMouseup: emitSelection,
                      onKeyup: emitSelection,
                    }),
                  ),
              slots.footer?.({}),
            ],
          )
        : null;

      const previewPane = showPreview.value
        ? h(
            "div",
            {
              class: "markdown-editor-pane markdown-editor-preview",
              id: `${id}-preview`,
              role: showTabs.value ? "tabpanel" : undefined,
              "aria-labelledby": showTabs.value
                ? `${id}-tab-preview`
                : undefined,
            },
            slots.preview
              ? slots.preview({ source: value.value })
              : value.value.trim()
                ? h(SoneMarkdown, {
                    source: value.value,
                    size: props.appearance === "field" ? "sm" : "default",
                  })
                : h(
                    "p",
                    { class: "markdown-editor-empty" },
                    m.markdownEditorEmpty,
                  ),
          )
        : null;

      return h(
        "sone-markdown-editor",
        {
          ref: host,
          class: "markdown-editor",
          "data-slot": "markdown-editor",
          "data-mode": mode.value,
          "data-appearance": props.appearance,
          "data-disabled": isDisabled.value ? "" : undefined,
          "data-invalid": props.invalid ? "" : undefined,
          "data-sticky-toolbar": props.stickyToolbar ? "" : undefined,
          "data-toolbar-placement": props.toolbarPlacement,
          "data-focus-frame": props.focusFrame ? undefined : "off",
          style: { "--markdown-editor-rows": props.minRows },
        },
        [
          headerNode,
          h("div", { class: "markdown-editor-panes" }, [
            writePane,
            previewPane,
          ]),
        ],
      );
    };
  },
});
