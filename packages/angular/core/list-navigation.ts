/**
 * Pure keyboard-navigation helpers shared by the menu trigger, row menu, command
 * list, tree and the roving-tabindex toolbars and groups. No DOM globals: safe on
 * the server and in plain Node.
 */

/** The arrow keys a list answers: Up / Down, Left / Right, or all four. */
export type ListNavigationOrientation = "vertical" | "horizontal" | "both";

export interface ListNavigationOptions {
  /** Arrow keys wrap from the last item to the first and back. Default `true`. */
  readonly wrap?: boolean;
  /** How far PageUp / PageDown move. Default `10`. */
  readonly pageSize?: number;
  /**
   * Which arrow keys move: `vertical` (Up / Down, the default), `horizontal`
   * (Left / Right) or `both` (Down and Right move on, Up and Left move back).
   */
  readonly orientation?: ListNavigationOrientation;
  /** Right-to-left: Left moves on and Right moves back. Default `false`. */
  readonly rtl?: boolean;
  /** PageUp / PageDown move `pageSize` items. Default: on for a `vertical` list only. */
  readonly paging?: boolean;
}

/** The keys `listNavigationIndex` understands (for the default, vertical list). */
export const LIST_NAVIGATION_KEYS: readonly string[] = [
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageDown",
  "PageUp",
];

/** Which way an arrow key moves for `options`: `1` on, `-1` back, `0` not at all. */
function arrowStep(key: string, options: ListNavigationOptions): -1 | 0 | 1 {
  const orientation = options.orientation ?? "vertical";
  if (orientation !== "horizontal") {
    if (key === "ArrowDown") return 1;
    if (key === "ArrowUp") return -1;
  }
  if (orientation !== "vertical") {
    const flip = options.rtl ? -1 : 1;
    if (key === "ArrowRight") return flip as -1 | 1;
    if (key === "ArrowLeft") return -flip as -1 | 1;
  }
  return 0;
}

/**
 * The index a list moves to for `key`, from `current` (`-1` = nothing active yet),
 * or `null` when the key is not a navigation key for `options` or the list is
 * empty. Vertical by default; see `ListNavigationOptions` for toolbars, radio
 * groups and right-to-left.
 */
export function listNavigationIndex(
  key: string,
  current: number,
  count: number,
  options: ListNavigationOptions = {},
): number | null {
  if (count <= 0) return null;
  const wrap = options.wrap ?? true;
  const page = Math.max(1, options.pageSize ?? 10);
  const paging =
    options.paging ?? (options.orientation ?? "vertical") === "vertical";
  const last = count - 1;
  switch (key) {
    case "Home":
      return 0;
    case "End":
      return last;
    case "PageDown":
      if (!paging) return null;
      return current < 0 ? 0 : Math.min(last, current + page);
    case "PageUp":
      if (!paging) return null;
      return current < 0 ? last : Math.max(0, current - page);
  }
  const step = arrowStep(key, options);
  if (step === 1) {
    if (current < 0) return 0;
    if (current >= last) return wrap ? 0 : last;
    return current + 1;
  }
  if (step === -1) {
    if (current < 0) return last;
    if (current <= 0) return wrap ? last : 0;
    return current - 1;
  }
  return null;
}

/**
 * A roving-tabindex keydown (WAI-ARIA toolbar, radio group, listbox): the item an
 * arrow, Home or End key moves to among `items` from `current`, with the event's
 * default prevented — or `null` (event untouched) when the key does not move.
 * The caller focuses the item and updates its tab stop.
 */
export function rovingFocusTarget<T>(
  event: Pick<KeyboardEvent, "key" | "preventDefault">,
  items: readonly T[],
  current: number,
  options: ListNavigationOptions = {},
): T | null {
  const index = listNavigationIndex(event.key, current, items.length, options);
  if (index === null) return null;
  event.preventDefault();
  return items[index];
}

/**
 * Folds text for matching: lower case, accents removed (`Łódź` → `lodz`,
 * `Café` → `cafe`), whitespace collapsed.
 */
export function normalizeSearchText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/Ł/g, "L")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Typeahead: the first label (after `current`, wrapping) that starts with
 * `query`, or `-1`. A query of one repeated character cycles through the items
 * starting with it, as the WAI-ARIA menu and tree patterns describe.
 */
export function typeaheadIndex(
  labels: readonly string[],
  current: number,
  query: string,
): number {
  const q = normalizeSearchText(query);
  if (!q || labels.length === 0) return -1;
  const repeated = [...q].every((ch) => ch === q[0]);
  const needle = repeated ? q[0] : q;
  // A fresh multi-letter query may still match the current item; a single or
  // repeated letter moves on to the next one.
  const startOffset = repeated ? 1 : 0;
  for (let i = 0; i < labels.length; i++) {
    const index = (Math.max(current, 0) + startOffset + i) % labels.length;
    if (normalizeSearchText(labels[index]).startsWith(needle)) return index;
  }
  return -1;
}

/**
 * Collects typed characters into a typeahead query that resets after `timeoutMs`
 * of silence. Returns `push(char) => query`.
 */
export function createTypeaheadBuffer(
  timeoutMs = 500,
  now: () => number = Date.now,
): (char: string) => string {
  let buffer = "";
  let last = -Infinity;
  return (char: string): string => {
    const t = now();
    if (t - last > timeoutMs) buffer = "";
    last = t;
    buffer += char;
    return buffer;
  };
}

/** True for a key that should feed typeahead (one printable character, no modifier). */
export function isTypeaheadKey(event: {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
}): boolean {
  return (
    event.key.length === 1 &&
    event.key !== " " &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey
  );
}

/**
 * Roving focus inside a `role="toolbar"`: Left / Right (wrapping), Home / End move focus
 * between its enabled buttons from the one that has it. Call it on a button's keydown.
 */
export function moveToolbarFocus(
  event: KeyboardEvent,
  options: ListNavigationOptions = { orientation: "horizontal" },
): void {
  if (listNavigationIndex(event.key, 0, 2, options) === null) {
    return;
  }
  const bar = (event.currentTarget as HTMLElement).closest('[role="toolbar"]');
  if (!bar) {
    return;
  }
  const buttons = Array.from(
    bar.querySelectorAll<HTMLButtonElement>("button"),
  ).filter((b) => !b.disabled);
  const at = buttons.indexOf(
    bar.ownerDocument.activeElement as HTMLButtonElement,
  );
  if (at < 0 || buttons.length < 2) {
    return;
  }
  rovingFocusTarget(event, buttons, at, options)?.focus();
}
