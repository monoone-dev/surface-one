// The section heading's level, with no framework in it: Angular (the `level` input's
// transform), the Vue and React twins (through @surface-one/core) read it.

export type SectionHeadingLevel = 2 | 3 | 4;

/**
 * `2`, `3` or `4` from whatever was bound (`3`, `"3"`, …); anything else is 2. A number
 * is read as Angular's `numberAttribute` reads it (both `parseFloat` and `Number` must
 * accept the value), so every framework settles on the same level.
 */
export function toSectionHeadingLevel(value: unknown): SectionHeadingLevel {
  const numeric =
    !isNaN(parseFloat(value as string)) && !isNaN(Number(value))
      ? Number(value)
      : 2;
  return numeric === 3 || numeric === 4 ? numeric : 2;
}
