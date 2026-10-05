export interface MarkdownTextRect {
  readonly top: number;
  readonly left: number;
  readonly right: number;
  readonly bottom: number;
}

export interface MarkdownTextSurface {
  value: string;
  readonly selectionStart: number;
  readonly selectionEnd: number;
  setSelectionRange(start: number, end: number): void;
  focus(options?: FocusOptions): void;
  readonly contentElement?: HTMLElement;
  rectAt?(start: number, end: number): MarkdownTextRect | null;
}

export function surfaceElement(
  surface: MarkdownTextSurface | null | undefined,
): HTMLElement | null {
  if (!surface) {
    return null;
  }
  return surface instanceof HTMLElement
    ? surface
    : (surface.contentElement ?? null);
}

export function surfaceHasFocus(
  surface: MarkdownTextSurface | null | undefined,
): boolean {
  const element = surfaceElement(surface);
  return !!element && element.ownerDocument.activeElement === element;
}

export function surfaceVisibleFrame(
  surface: MarkdownTextSurface | null | undefined,
): MarkdownTextRect | null {
  const content = surfaceElement(surface);
  if (!content) {
    return null;
  }
  const frame = (
    content.closest<HTMLElement>(".cm-editor") ?? content
  ).getBoundingClientRect();
  const header = content
    .closest('[data-slot="markdown-editor"]')
    ?.querySelector('[data-slot="markdown-editor-header"]')
    ?.getBoundingClientRect();
  return {
    top: Math.max(frame.top, header?.bottom ?? frame.top),
    left: frame.left,
    right: frame.right,
    bottom: frame.bottom,
  };
}

export const SURFACE_CLICK_AWAY_IGNORE =
  "a, button, input, textarea, select, label, summary, [role='button'], [role='checkbox'], [role='link'], [contenteditable='true'], app-connections, [data-slot='markdown-editor-header']";

export function isOutsideSurfaceFrame(
  event: MouseEvent,
  surface: MarkdownTextSurface | null | undefined,
): boolean {
  const content = surfaceElement(surface);
  const frame = content?.closest<HTMLElement>(".cm-editor") ?? content;
  if (!frame) {
    return false;
  }
  const rect = frame.getBoundingClientRect();
  const offset = parseFloat(getComputedStyle(frame).outlineOffset) || 0;
  return (
    event.clientX < rect.left - offset ||
    event.clientX > rect.right + offset ||
    event.clientY < rect.top - offset ||
    event.clientY > rect.bottom + offset
  );
}
