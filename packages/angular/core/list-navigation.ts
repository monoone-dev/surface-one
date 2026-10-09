/**
 * Pure keyboard-navigation helpers shared by the menu trigger, row menu, command
 * list and tree. No DOM globals: safe on the server and in plain Node.
 */

export interface ListNavigationOptions {
  /** Arrow keys wrap from the last item to the first and back. Default `true`. */
  readonly wrap?: boolean;
  /** How far PageUp / PageDown move. Default `10`. */
  readonly pageSize?: number;
}

/** The keys `listNavigationIndex` understands. */
export const LIST_NAVIGATION_KEYS: readonly string[] = [
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageDown",
  "PageUp",
];

/**
 * The index a vertical list moves to for `key`, from `current` (`-1` = nothing
 * active yet), or `null` when the key is not a navigation key or the list is empty.
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
  const last = count - 1;
  switch (key) {
    case "Home":
      return 0;
    case "End":
      return last;
    case "PageDown":
      return current < 0 ? 0 : Math.min(last, current + page);
    case "PageUp":
      return current < 0 ? last : Math.max(0, current - page);
    case "ArrowDown":
      if (current < 0) return 0;
      if (current >= last) return wrap ? 0 : last;
      return current + 1;
    case "ArrowUp":
      if (current < 0) return last;
      if (current <= 0) return wrap ? last : 0;
      return current - 1;
    default:
      return null;
  }
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
