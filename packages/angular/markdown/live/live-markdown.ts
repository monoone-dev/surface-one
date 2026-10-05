import {
  Annotation,
  Compartment,
  EditorSelection,
  EditorState,
  Prec,
} from "@codemirror/state";
import {
  EditorView,
  drawSelection,
  keymap,
  placeholder as placeholderText,
} from "@codemirror/view";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";

import type {
  MarkdownTextRect,
  MarkdownTextSurface,
} from "../markdown-surface";
import { livePreview } from "./live-preview";

export interface LiveMarkdownOptions {
  readonly doc: string;
  readonly placeholder: string;
  readonly readOnly: boolean;
  readonly attributes: Record<string, string>;
  readonly contentClass: string;
  readonly onKeydown: (event: KeyboardEvent) => void;
  readonly onPaste: (event: ClipboardEvent) => void;
  readonly onDragover: (event: DragEvent) => void;
  readonly onDrop: (event: DragEvent) => void;
  readonly onFocus: (event: FocusEvent) => void;
  readonly onBlur: (event: FocusEvent) => void;
  readonly onSelection: () => void;
}

export interface LiveMarkdownConfig {
  readonly placeholder: string;
  readonly readOnly: boolean;
  readonly attributes: Record<string, string>;
}

const programmatic = Annotation.define<boolean>();

export class LiveMarkdownSurface
  extends EventTarget
  implements MarkdownTextSurface
{
  private readonly editable = new Compartment();
  private readonly hint = new Compartment();
  private readonly attrs = new Compartment();
  private readonly options: LiveMarkdownOptions;
  private config: LiveMarkdownConfig;
  readonly view: EditorView;

  constructor(parent: HTMLElement, options: LiveMarkdownOptions) {
    super();
    this.options = options;
    this.config = {
      placeholder: options.placeholder,
      readOnly: options.readOnly,
      attributes: options.attributes,
    };
    this.view = new EditorView({
      parent,
      state: this.createState(options.doc, 0),
    });
    Object.defineProperty(this.view.contentDOM, "markdownSurface", {
      value: this,
    });
  }

  private createState(doc: string, caret: number): EditorState {
    const options = this.options;
    return EditorState.create({
      doc,
      selection: EditorSelection.cursor(Math.min(caret, doc.length)),
      extensions: [
        history(),
        drawSelection(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        markdown({ base: markdownLanguage }),
        EditorView.lineWrapping,
        livePreview,
        this.editable.of(editableExtensions(this.config.readOnly)),
        this.hint.of(placeholderText(this.config.placeholder)),
        this.attrs.of(this.contentAttributes(this.config.attributes)),
        Prec.highest(
          EditorView.domEventHandlers({
            keydown: (event) => {
              options.onKeydown(event);
              return event.defaultPrevented;
            },
            paste: (event) => {
              options.onPaste(event);
              return event.defaultPrevented;
            },
            dragover: (event) => {
              options.onDragover(event);
              return event.defaultPrevented;
            },
            drop: (event) => {
              options.onDrop(event);
              return event.defaultPrevented;
            },
            focus: (event) => {
              options.onFocus(event);
              return false;
            },
            blur: (event) => {
              options.onBlur(event);
              return false;
            },
          }),
        ),
        EditorView.updateListener.of((update) => {
          const external = update.transactions.some((tr) =>
            tr.annotation(programmatic),
          );
          if (update.docChanged && !external) {
            this.dispatchEvent(new Event("input"));
          }
          if (update.selectionSet || update.docChanged) {
            options.onSelection();
          }
        }),
      ],
    });
  }

  private contentAttributes(attributes: Record<string, string>) {
    return EditorView.contentAttributes.of({
      ...attributes,
      class: this.options.contentClass,
    });
  }

  get value(): string {
    return this.view.state.doc.toString();
  }

  set value(next: string) {
    const current = this.value;
    if (next === current) {
      return;
    }
    let start = 0;
    const max = Math.min(current.length, next.length);
    while (start < max && current[start] === next[start]) {
      start++;
    }
    let endCurrent = current.length;
    let endNext = next.length;
    while (
      endCurrent > start &&
      endNext > start &&
      current[endCurrent - 1] === next[endNext - 1]
    ) {
      endCurrent--;
      endNext--;
    }
    this.view.dispatch({
      changes: {
        from: start,
        to: endCurrent,
        insert: next.slice(start, endNext),
      },
      annotations: programmatic.of(true),
    });
  }

  // A value pushed in from outside (another note loaded, Revert) starts a fresh state: an undo
  // entry mapped across the swap could restore the previous document, which autosave would write.
  replaceFromOutside(next: string): void {
    if (next === this.value) {
      return;
    }
    this.view.setState(this.createState(next, this.selectionEnd));
  }

  get contentElement(): HTMLElement {
    return this.view.contentDOM;
  }

  get selectionStart(): number {
    return this.view.state.selection.main.from;
  }

  get selectionEnd(): number {
    return this.view.state.selection.main.to;
  }

  setSelectionRange(start: number, end: number): void {
    const length = this.view.state.doc.length;
    const anchor = Math.max(0, Math.min(start, length));
    const head = Math.max(0, Math.min(end, length));
    this.view.dispatch({
      selection: EditorSelection.single(anchor, head),
      scrollIntoView: true,
      annotations: programmatic.of(true),
    });
  }

  focus(): void {
    this.view.focus();
  }

  rectAt(start: number, end: number): MarkdownTextRect | null {
    const length = this.view.state.doc.length;
    const from = this.view.coordsAtPos(Math.min(start, length), 1);
    const to = this.view.coordsAtPos(Math.min(end, length), -1) ?? from;
    if (!from || !to) {
      return null;
    }
    return {
      top: from.top,
      left: from.left,
      right: Math.max(from.right, to.right),
      bottom: Math.max(from.bottom, to.bottom),
    };
  }

  configure(config: LiveMarkdownConfig): void {
    this.config = config;
    this.view.dispatch({
      effects: [
        this.editable.reconfigure(editableExtensions(config.readOnly)),
        this.hint.reconfigure(placeholderText(config.placeholder)),
        this.attrs.reconfigure(this.contentAttributes(config.attributes)),
      ],
    });
  }

  destroy(): void {
    this.view.destroy();
  }
}

function editableExtensions(readOnly: boolean) {
  return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)];
}

export function createLiveMarkdown(
  parent: HTMLElement,
  options: LiveMarkdownOptions,
): LiveMarkdownSurface {
  return new LiveMarkdownSurface(parent, options);
}
