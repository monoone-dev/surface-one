/**
 * Unique DOM ids for the components' internal ARIA wiring (`aria-labelledby`,
 * `aria-controls`, radio `name`s, …). Pure: no Angular, no DOM globals.
 */

const counters = new Map<string, number>();

/**
 * The next id for `prefix`: `soneId("sone-rating")` → `sone-rating-0`, then
 * `sone-rating-1`, … Each prefix counts on its own, so ids from different prefixes
 * never collide. Append a suffix for related ids: `` `${soneId("sone-graph")}-hint` ``.
 */
export function soneId(prefix: string): string {
  const next = counters.get(prefix) ?? 0;
  counters.set(prefix, next + 1);
  return `${prefix}-${next}`;
}
