// How a textarea fits its content and counts its characters, with no framework in it:
// the Angular `textarea[soneTextarea]`, the Vue and React `SoneTextarea` (through
// @surface-one/core) and the React Native one share it.

/** The rows an autosizing textarea keeps between. `null` leaves that end open. */
export interface TextareaRows {
  readonly minRows?: number | null;
  readonly maxRows?: number | null;
}

/** The pixel height of `rows` lines plus the box's padding and border. */
export function textareaRowsHeight(
  rows: number,
  lineHeight: number,
  chrome: number,
): number {
  return Math.max(0, rows) * lineHeight + chrome;
}

/**
 * The height an autosizing textarea takes for a content height (`scrollHeight`, padding
 * included, border not), clamped to `minRows` … `maxRows`; `scroll` says the content
 * overflows the cap (the textarea then scrolls). Pure, so it is tested without a layout.
 */
export function textareaAutosizeHeight(
  contentHeight: number,
  metrics: {
    readonly lineHeight: number;
    readonly paddingY: number;
    readonly borderY: number;
  },
  { minRows = null, maxRows = null }: TextareaRows = {},
): { readonly height: number; readonly scroll: boolean } {
  const { lineHeight, paddingY, borderY } = metrics;
  const chrome = paddingY + borderY;
  const natural = contentHeight + borderY;
  const min = minRows ? textareaRowsHeight(minRows, lineHeight, chrome) : 0;
  const max = maxRows
    ? textareaRowsHeight(Math.max(maxRows, minRows ?? 0), lineHeight, chrome)
    : Number.POSITIVE_INFINITY;
  const height = Math.min(Math.max(natural, min), max);
  return { height: Math.ceil(height), scroll: natural > max };
}

/**
 * Fits `el`'s height to its content between `minRows` and `maxRows` (browser-only: it
 * measures). Called on every input and whenever the value changes from outside.
 */
export function autosizeTextarea(
  el: HTMLTextAreaElement,
  rows: TextareaRows = {},
): void {
  const view = el.ownerDocument.defaultView;
  if (!view) return;
  const style = view.getComputedStyle(el);
  const px = (v: string): number => Number.parseFloat(v) || 0;
  const fontSize = px(style.fontSize);
  const lineHeight = px(style.lineHeight) || fontSize * 1.2;
  const paddingY = px(style.paddingTop) + px(style.paddingBottom);
  const borderY =
    style.boxSizing === "border-box"
      ? px(style.borderTopWidth) + px(style.borderBottomWidth)
      : -paddingY;
  // Collapse first, so scrollHeight measures the content rather than the old box.
  el.style.height = "auto";
  const { height, scroll } = textareaAutosizeHeight(
    el.scrollHeight,
    { lineHeight, paddingY, borderY },
    rows,
  );
  el.style.height = `${height}px`;
  el.style.overflowY = scroll ? "auto" : "hidden";
}

/** What a textarea's character counter shows and says. */
export interface TextareaCount {
  /** Characters typed. */
  readonly count: number;
  /** The `maxlength`, or `null` when there is none. */
  readonly max: number | null;
  /** Characters left (`null` without a `maxlength`). */
  readonly remaining: number | null;
  /** `near` once few are left, `limit` at (or past) the `maxlength`. */
  readonly state: "default" | "near" | "limit";
  /** The visible text: `12/200`, or `12` without a `maxlength`. */
  readonly text: string;
  /** Whether a screen reader should hear the characters left now. */
  readonly announce: boolean;
}

/** How few characters left count as "near" the limit: 10, or a tenth of a long limit. */
export const textareaNearLimit = (max: number): number =>
  Math.max(10, Math.ceil(max * 0.1));

/** The counter of a textarea holding `value` with an optional `maxlength`. */
export function textareaCount(
  value: string | null | undefined,
  maxlength: number | null | undefined,
): TextareaCount {
  // UTF-16 code units, as the browser counts them against `maxlength`.
  const count = (value ?? "").length;
  const max =
    maxlength != null && Number.isFinite(maxlength) && maxlength >= 0
      ? Math.floor(maxlength)
      : null;
  if (max === null) {
    return {
      count,
      max,
      remaining: null,
      state: "default",
      text: String(count),
      announce: false,
    };
  }
  const remaining = Math.max(0, max - count);
  const state =
    remaining === 0
      ? "limit"
      : remaining <= textareaNearLimit(max)
        ? "near"
        : "default";
  return {
    count,
    max,
    remaining,
    state,
    text: `${count}/${max}`,
    announce: state !== "default",
  };
}
