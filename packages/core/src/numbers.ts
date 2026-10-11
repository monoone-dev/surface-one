// Number guards for component inputs. Server-safe.

/** A segment value as drawn: finite and at least 0 (anything else is 0). */
export const nonNegative = (v: number): number =>
  Number.isFinite(v) ? Math.max(0, v) : 0;

/** A column count: a finite number ≥ 1, floored; anything else means "as many as fit". */
export const columnCount = (
  n: number | null | undefined,
): number | undefined =>
  n !== null && n !== undefined && Number.isFinite(n) && n >= 1
    ? Math.floor(n)
    : undefined;
