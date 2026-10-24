// A configurable heading level, with no framework in it: the app bar and the page blocks
// (Angular inputs, the Vue and React twins through @surface-one/core) read it the same way.

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * `1`–`6` from whatever was bound (`3`, `"3"`, …); anything else is `fallback`. A number
 * is read as Angular's `numberAttribute` reads it (both `parseFloat` and `Number` must
 * accept the value), so every framework settles on the same level.
 */
export function toHeadingLevel(
  value: unknown,
  fallback: HeadingLevel = 2,
): HeadingLevel {
  const numeric =
    !isNaN(parseFloat(value as string)) && !isNaN(Number(value))
      ? Number(value)
      : NaN;
  return Number.isInteger(numeric) && numeric >= 1 && numeric <= 6
    ? (numeric as HeadingLevel)
    : fallback;
}
